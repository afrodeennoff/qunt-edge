import { useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { useUploadCore, type UploadResult } from './use-upload-core'

const supabase = createClient()

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
   * This is set in the Cache-Control: max-age=<seconds> header. Defaults to 3600 seconds.
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
    cacheControl = 3600,
    upsert = false,
  } = options

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

  const uploadFile = useCallback(async (file: File): Promise<UploadResult> => {
    try {
      // Compute hash for short filename
      const hashHex = await computeFileHash(file)
      const ext = getFileExtension(file)

      // Create short hash-based path
      const fileName = `${hashHex}.${ext}`
      const filePath = path ? `${path}/${fileName}` : fileName

      const { error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: cacheControl.toString(),
          upsert,
        })

      // If file already exists, that's okay - we'll reuse it
      if (error && error.message && error.message.includes('already exists')) {
        const { data: pub } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath)

        return {
          name: file.name,
          message: undefined,
          url: pub.publicUrl
        }
      }

      if (error) {
        return { name: file.name, message: error.message, url: undefined }
      }

      // Get public URL for successful upload
      const { data: pub } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath)

      return {
        name: file.name,
        message: undefined,
        url: pub.publicUrl
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      return { name: file.name, message: errorMessage, url: undefined }
    }
  }, [bucketName, path, cacheControl, upsert])

  return useUploadCore({
    allowedMimeTypes,
    maxFileSize,
    maxFiles,
    uploadFile,
  })
}

export { useHashUpload, type UseHashUploadOptions, type UseHashUploadReturn }
