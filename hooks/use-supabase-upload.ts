import { useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { useUploadCore, type UploadResult } from './use-upload-core'

const supabase = createClient()

type UseSupabaseUploadOptions = {
  /**
   * Name of bucket to upload files to in your Supabase project
   */
  bucketName: string
  /**
   * Folder to upload files to in the specified bucket within your Supabase project.
   *
   * Defaults to uploading files to the root of the bucket
   *
   * e.g If specified path is `test`, your file will be uploaded as `test/file_name`
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

type UseSupabaseUploadReturn = ReturnType<typeof useSupabaseUpload>

const useSupabaseUpload = (options: UseSupabaseUploadOptions) => {
  const {
    bucketName,
    path,
    allowedMimeTypes = [],
    maxFileSize = Number.POSITIVE_INFINITY,
    maxFiles = 1,
    cacheControl = 3600,
    upsert = false,
  } = options

  const uploadFile = useCallback(async (file: File): Promise<UploadResult> => {
    try {
      const { error } = await supabase.storage
        .from(bucketName)
        .upload(!!path ? `${path}/${file.name}` : file.name, file, {
          cacheControl: cacheControl.toString(),
          upsert,
        })
      if (error) {
        return { name: file.name, message: error.message }
      } else {
        return { name: file.name, message: undefined }
      }
    } catch (error) {
       const errorMessage = error instanceof Error ? error.message : 'Upload failed'
       return { name: file.name, message: errorMessage }
    }
  }, [bucketName, path, cacheControl, upsert])

  return useUploadCore({
    allowedMimeTypes,
    maxFileSize,
    maxFiles,
    uploadFile,
  })
}

export { useSupabaseUpload, type UseSupabaseUploadOptions, type UseSupabaseUploadReturn }
