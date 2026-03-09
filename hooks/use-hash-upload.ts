import { useCallback, useEffect, useMemo, useState, startTransition } from 'react'
import { type FileError, type FileRejection, useDropzone } from 'react-dropzone'
import { createClient } from '@/lib/supabase'
import { IMMUTABLE_CACHE_CONTROL_SECONDS } from '@/lib/supabase-storage'

const supabase = createClient()

interface FileWithPreview extends File {
  preview?: string
  errors: readonly FileError[]
  uploadedPath?: string
}

type UseHashUploadOptions = {
  /**
   * Name of bucket to upload files to in your Supabase project
   */
  bucketName: string
  /**
   * Folder to upload files to in the specified bucket within your Supabase project.
   *
   * Defaults to uploading files to the root of the bucket
   *
   * e.g If specified path is `user-id/trades`, your file will be uploaded as `user-id/trades/hash.ext`
   */
  path?: string
  /**
   * Allowed MIME types for each file upload (e.g `image/png`, `text/html`, etc). Wildcards are also supported (e.g `image/*`).
   *
   * Defaults to allowing uploading of all MIME types.
   */
  allowedMimeTypes?: string[]
  /**
   * Maximum upload size of each file allowed in bytes. (e.g 1000 bytes = 1 KB)
   */
  maxFileSize?: number
  /**
   * Maximum number of files allowed per upload.
   */
  maxFiles?: number
  /**
   * The number of seconds the asset is cached in the browser and in the Supabase CDN.
   *
   * This is set in the Cache-Control: max-age=<seconds> header.
   * Defaults to 1 year for immutable hash-named files.
   */
  cacheControl?: number
  /**
   * When set to true, the file is overwritten if it exists.
   *
   * When set to false, an error is thrown if the object already exists. Defaults to `false`
   */
  upsert?: boolean
}

type UseHashUploadReturn = ReturnType<typeof useHashUpload>

/**
 * Custom hook for uploading files to Supabase Storage using SHA-256 hash-based naming
 * This creates short, deduplicated file paths like `user-id/trades/abc123.jpg`
 */
const useHashUpload = (options: UseHashUploadOptions) => {
  const {
    bucketName,
    path,
    allowedMimeTypes = [],
    maxFileSize = Number.POSITIVE_INFINITY,
    maxFiles = 1,
    cacheControl = IMMUTABLE_CACHE_CONTROL_SECONDS,
    upsert = false,
  } = options

  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [errors, setErrors] = useState<{ name: string; message: string }[]>([])
  const [successes, setSuccesses] = useState<string[]>([])
  const [uploadedPaths, setUploadedPaths] = useState<string[]>([])

  const isSuccess = useMemo(() => {
    if (errors.length === 0 && successes.length === 0) {
      return false
    }
    if (errors.length === 0 && successes.length === files.length) {
      return true
    }
    return false
  }, [errors.length, successes.length, files.length])

  /**
   * Compute SHA-256 hash of a file for deduplicated, short filenames
   */
  const computeFileHash = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer()
    const digest = await crypto.subtle.digest('SHA-256', buffer)
    const hashArray = Array.from(new Uint8Array(digest))
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
    return hashHex
  }

  /**
   * Get file extension from MIME type or filename
   */
  const getFileExtension = (file: File): string => {
    const mimeExt = file.type.split('/')[1] || ''
    const nameExt = file.name.includes('.')
      ? file.name.split('.').pop() || ''
      : ''
    return (mimeExt || nameExt || 'bin').toLowerCase()
  }

  const getScopedBasePath = async (): Promise<string> => {
    const { data, error } = await supabase.auth.getUser()

    if (error || !data.user?.id) {
      throw new Error('Authentication required for storage upload')
    }

    const authUid = data.user.id
    const trimmedPath = (path ?? '').replace(/^\/+|\/+$/g, '')

    if (!trimmedPath) {
      return authUid
    }

    if (trimmedPath === authUid || trimmedPath.startsWith(`${authUid}/`)) {
      return trimmedPath
    }

    return `${authUid}/${trimmedPath}`
  }

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      const validFiles = acceptedFiles
        .filter((file) => !files.find((x) => x.name === file.name))
        .map((file) => {
          ;(file as FileWithPreview).preview = URL.createObjectURL(file)
          ;(file as FileWithPreview).errors = []
          return file as FileWithPreview
        })

      const invalidFiles = fileRejections.map(({ file, errors }) => {
        ;(file as FileWithPreview).preview = URL.createObjectURL(file)
        ;(file as FileWithPreview).errors = errors
        return file as FileWithPreview
      })

      const newFiles = [...files, ...validFiles, ...invalidFiles]

      setFiles(newFiles)
    },
    [files, setFiles]
  )

  const dropzoneProps = useDropzone({
    onDrop,
    noClick: files.length > 0,
    accept: allowedMimeTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize: maxFileSize,
    maxFiles: maxFiles,
    multiple: maxFiles !== 1,
  })

  const onUpload = useCallback(async () => {
    setLoading(true)

    // Only upload files that haven't been successfully uploaded yet
    const filesWithErrors = errors.map((x) => x.name)
    const filesToUpload =
      filesWithErrors.length > 0
        ? [
            ...files.filter((f) => filesWithErrors.includes(f.name)),
            ...files.filter((f) => !successes.includes(f.name)),
          ]
        : files

    const responses = await Promise.all(
      filesToUpload.map(async (file) => {
        try {
          const scopedBasePath = await getScopedBasePath()

          // Compute hash for short filename
          const hashHex = await computeFileHash(file)
          const ext = getFileExtension(file)

          // Create short hash-based path
          const fileName = `${hashHex}.${ext}`
          const filePath = `${scopedBasePath}/${fileName}`

          const { error } = await supabase.storage
            .from(bucketName)
            .upload(filePath, file, {
              cacheControl: cacheControl.toString(),
              upsert,
            })

          // If file already exists, that's okay - we'll reuse it
          if (error && error.message && error.message.includes('already exists')) {
            return {
              name: file.name,
              message: undefined,
              path: filePath
            }
          }

          if (error) {
            return { name: file.name, message: error.message, path: undefined }
          }

          return {
            name: file.name,
            message: undefined,
            path: filePath
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Upload failed'
          return { name: file.name, message: errorMessage, path: undefined }
        }
      })
    )

    const responseErrors = responses.filter((x) => x.message !== undefined)
    setErrors(responseErrors.map(r => ({ name: r.name, message: r.message! })))

    const responseSuccesses = responses.filter((x) => x.message === undefined)
    const newSuccesses = Array.from(
      new Set([...successes, ...responseSuccesses.map((x) => x.name)])
    )
    setSuccesses(newSuccesses)

    // Store uploaded object paths (private-bucket safe)
    const newPaths = responseSuccesses
      .map((x) => x.path)
      .filter((storedPath): storedPath is string => storedPath !== undefined)
    setUploadedPaths((prev) => [...prev, ...newPaths])

    setLoading(false)
  }, [files, path, bucketName, errors, successes, cacheControl, upsert])

  useEffect(() => {
    if (files.length === 0) {
      startTransition(() => {
        setErrors([])
        setSuccesses([])
        setUploadedPaths([])
      })
    }

    // If the number of files doesn't exceed the maxFiles parameter, remove the error 'Too many files' from each file
    if (files.length <= maxFiles) {
      let changed = false
      const newFiles = files.map((file) => {
        if (file.errors.some((e) => e.code === 'too-many-files')) {
          file.errors = file.errors.filter((e) => e.code !== 'too-many-files')
          changed = true
        }
        return file
      })
      if (changed) {
        setFiles(newFiles)
      }
    }
  }, [files.length, setFiles, maxFiles])

  return {
    files,
    setFiles,
    successes,
    isSuccess,
    loading,
    errors,
    setErrors,
    onUpload,
    uploadedPaths,
    // Backwards-compatible alias for existing callers.
    uploadedUrls: uploadedPaths,
    maxFileSize: maxFileSize,
    maxFiles: maxFiles,
    allowedMimeTypes,
    ...dropzoneProps,
  }
}

export { useHashUpload, type UseHashUploadOptions, type UseHashUploadReturn }
