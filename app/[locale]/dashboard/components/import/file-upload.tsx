'use client'

import React, { useCallback, useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import Papa from 'papaparse'
import { ImportType } from './import-type-selection'
import { Progress } from "@/components/ui/progress"
import { XIcon, FileIcon, AlertCircle, ArrowUpCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useI18n } from "@/locales/client"
import { platforms } from './config/platforms'
import { Step } from './import-button'

interface FileUploadProps {
  importType: ImportType
  setRawCsvData: React.Dispatch<React.SetStateAction<string[][]>>
  setCsvData: React.Dispatch<React.SetStateAction<string[][]>>
  setHeaders: React.Dispatch<React.SetStateAction<string[]>>
  setStep: React.Dispatch<React.SetStateAction<Step>>
  setError: React.Dispatch<React.SetStateAction<string | null>>
}

export default function FileUpload({
  importType,
  setRawCsvData,
  setCsvData,
  setHeaders,
  setStep,
  setError
}: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const [parsedFiles, setParsedFiles] = useState<string[][][]>([])
  const t = useI18n()

  // Security: File size and type validation
  const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
  const ALLOWED_TYPES = [
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
  const ALLOWED_EXTENSIONS = ['.csv', '.xls', '.xlsx']

  // Security: Enhanced file validation function
  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File size exceeds 5MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`
      }
    }

    // Check file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: `Invalid file type: ${file.type}. Only CSV and Excel files are allowed.`
      }
    }

    // Check file extension
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
      return {
        valid: false,
        error: `Invalid file extension: ${fileExtension}. Only .csv, .xls, and .xlsx files are allowed.`
      }
    }

    // Check for potentially malicious file names
    const maliciousPatterns = [
      /<script/i,
      /javascript:/i,
      /vbscript:/i,
      /onload=/i,
      /onerror=/i,
      /alert\(/i,
      /eval\(/i
    ]
    
    for (const pattern of maliciousPatterns) {
      if (pattern.test(file.name)) {
        return {
          valid: false,
          error: 'File name contains potentially malicious content.'
        }
      }
    }

    return { valid: true }
  }

  const processFile = useCallback((file: File, index: number) => {
    return new Promise<void>((resolve, reject) => {
      // Security: Enhanced file validation
      const validation = validateFile(file)
      if (!validation.valid) {
        reject(new Error(validation.error))
        return
      }

       // Security: Read file content for validation
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result?.toString() || '';
        const firstLine = content.split('\n')[0] || '';
        const delimiter = firstLine.includes(';') ? ';' : ',';

        // Security: Check for potentially malicious content in file
        const maliciousContentPatterns = [
          /<script[^>]*>.*?<\/script>/i,
          /javascript:/i,
          /vbscript:/i,
          /data:\s*text\/html/i,
          /<iframe/i,
          /<object/i,
          /<embed/i,
          /<applet/i,
          /<meta/i,
          /<base/i,
          /<form/i,
          /<input/i,
          /<button/i,
          /onclick=/i,
          /onload=/i,
          /onerror=/i,
          /alert\(/i,
          /confirm\(/i,
          /prompt\(/i,
          /eval\(/i,
          /exec\(/i,
          /setTimeout/i,
          /setInterval/i,
          /document\./i,
          /window\./i,
          /\.cookie/i,
          /\.location/i
        ];

        for (const pattern of maliciousContentPatterns) {
          if (pattern.test(content)) {
            reject(new Error('File contains potentially malicious content and cannot be processed.'))
            return
          }
        }

        // Security: Validate CSV structure
        const lines = content.split('\n').filter(line => line.trim())
        if (lines.length === 0) {
          reject(new Error('File is empty or contains no valid data.'))
          return
        }

        // Check if first line contains headers (basic validation)
        const headers = lines[0].split(delimiter)
        if (headers.length < 2) {
          reject(new Error('File does not appear to be a valid CSV format.'))
          return
        }

        Papa.parse(file, {
          delimiter,
          skipEmptyLines: true,
          complete: (result) => {
            // Security: Validate parsed data
            if (!result.data || !Array.isArray(result.data)) {
              reject(new Error("Invalid CSV data format."))
              return
            }

            if (result.data.length === 0) {
              reject(new Error("The CSV file appears to be empty or contains no valid data."))
              return
            }

            // Security: Check for data that might be too large (potential DoS)
            if (result.data.length > 100000) {
              reject(new Error("CSV file contains too many rows (max 100,000)."))
              return
            }

            // Security: Validate that each row is an array
            for (let i = 0; i < Math.min(result.data.length, 100); i++) {
              if (!Array.isArray(result.data[i])) {
                reject(new Error(`Invalid data format at row ${i + 1}.`))
                return
              }
            }

            setParsedFiles(prevFiles => {
              const newFiles = [...prevFiles]
              newFiles[index] = result.data as string[][]
              return newFiles
            })
            setError(null)
            resolve()
          },
          error: (error) => {
            reject(new Error(`Error parsing CSV: ${error.message || 'Unknown parsing error'}`))
          }
        })
      };
      reader.onerror = () => {
        reject(new Error("Error reading file"))
      };
      reader.readAsText(file);
    })
  }, [setError, MAX_FILE_SIZE, ALLOWED_TYPES])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setUploadedFiles(prevFiles => [...prevFiles, ...acceptedFiles])
    acceptedFiles.forEach((file, index) => {
      const totalIndex = uploadedFiles.length + index
      setUploadProgress(prev => ({ ...prev, [file.name]: 0 }))
      
      // Security: Validate file before processing
      const validation = validateFile(file)
      if (!validation.valid) {
        setError(validation.error ?? 'Validation failed')
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }))
        return
      }
      
      processFile(file, totalIndex)
        .then(() => {
          setUploadProgress(prev => ({ ...prev, [file.name]: 100 }))
        })
        .catch(error => {
          setError(error.message)
          setUploadProgress(prev => ({ ...prev, [file.name]: 0 }))
        })
    })
  }, [processFile, setError, uploadedFiles.length, validateFile])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    // Security: Validate files at dropzone level
    maxSize: MAX_FILE_SIZE,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    }
  })

  const removeFile = (index: number) => {
    setUploadedFiles(prevFiles => prevFiles.filter((_, i) => i !== index))
    setParsedFiles(prevFiles => prevFiles.filter((_, i) => i !== index))
    setUploadProgress(prev => {
      const newProgress = { ...prev }
      delete newProgress[uploadedFiles[index].name]
      return newProgress
    })
  }

  const concatenateFiles = useCallback(() => {
    if (parsedFiles.length === 0) return

    try {
      const platform = platforms.find(p => p.type === importType)
      if (!platform) {
        throw new Error("Invalid import type")
      }

      // If platform doesn't have processFile (e.g., Rithmic Sync), skip processing
      if (!platform.processFile) {
        return
      }

      let concatenatedData: string[][] = []
      let headers: string[] = []

      parsedFiles.forEach((file, index) => {
        const { headers: fileHeaders, processedData } = platform.processFile!(file)
        if (index === 0) {
          headers = fileHeaders
          concatenatedData = processedData
        } else {
          concatenatedData = [...concatenatedData, ...processedData]
        }
      })

      setRawCsvData([headers, ...concatenatedData])
      setCsvData(concatenatedData)
      setHeaders(headers)

      // Find current step index and move to next step
      const currentStepIndex = platform.steps.findIndex(step => step.id === 'upload-file')
      if (currentStepIndex !== -1 && currentStepIndex < platform.steps.length - 1) {
        setStep(platform.steps[currentStepIndex + 1].id)
      }
      
      setError(null)
    } catch (error) {
      setError((error as Error).message)
    }
  }, [importType, parsedFiles, setRawCsvData, setCsvData, setHeaders, setStep, setError])

  useEffect(() => {
    if (parsedFiles.length > 0 && parsedFiles.length === uploadedFiles.length && Object.values(uploadProgress).every(progress => progress === 100)) {
      concatenateFiles()
    }
  }, [parsedFiles, uploadProgress, concatenateFiles, uploadedFiles.length])

  return (
    <div className="space-y-4 w-full h-full p-8 flex flex-col items-center justify-center">
      <div 
        {...getRootProps()} 
        className={cn(
          "h-80 w-full max-w-2xl border-2 border-dashed rounded-lg p-12 text-center transition-all duration-300 ease-in-out",
          "hover:border-primary/50 group relative",
          isDragActive 
            ? "border-primary bg-primary/5 scale-[0.99]" 
            : "border-gray-300 hover:bg-gray-50/50 dark:hover:bg-gray-900/50",
          "cursor-pointer flex items-center justify-center"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4">
          <ArrowUpCircle 
            className={cn(
              "h-14 w-14 transition-all duration-300 ease-bounce",
              isDragActive 
                ? "text-primary scale-110 -translate-y-2" 
                : "text-muted-foreground group-hover:text-primary group-hover:scale-110 group-hover:-translate-y-2"
            )} 
          />
          {isDragActive ? (
            <div className="space-y-2 relative">
              <p className="text-xl font-medium text-primary animate-in fade-in slide-in-from-bottom-2">
                {t('import.upload.dropHere')}
              </p>
              <p className="text-sm text-muted-foreground animate-in fade-in slide-in-from-bottom-3">
                {t('import.upload.weWillHandle')}
              </p>
            </div>
          ) : (
            <div className="space-y-2 relative">
              <p className="text-xl font-medium group-hover:text-primary transition-colors">
                {t('import.upload.dragAndDrop')}
              </p>
              <p className="text-sm text-muted-foreground">
                {t('import.upload.clickToBrowse')}
              </p>
            </div>
          )}
        </div>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="space-y-2 animate-in slide-in-from-bottom-4 duration-500 w-full max-w-2xl">
          <h3 className="text-lg font-semibold">{t('import.upload.uploadedFiles')}</h3>
          {uploadedFiles.map((file, index) => (
            <div 
              key={index} 
              className={cn(
                "flex items-center justify-between",
                "bg-gray-100 dark:bg-gray-800 rounded-lg",
                "p-3 hover:bg-gray-200 dark:hover:bg-gray-700",
                "transition-all duration-200 ease-in-out",
                "animate-in slide-in-from-bottom fade-in",
                "group"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center space-x-3">
                <div className="bg-primary/10 p-2 rounded-md group-hover:bg-primary/20 transition-colors">
                  <FileIcon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{file.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {t('import.upload.fileSize', { size: (file.size / 1024).toFixed(1) })}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Progress 
                  value={uploadProgress[file.name] || 0} 
                  className="w-24 h-2"
                />
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => removeFile(index)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <XIcon className="h-4 w-4" />
                  <span className="sr-only">{t('import.upload.removeFile')}</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {uploadedFiles.length > 0 && (
        <Alert className="animate-in slide-in-from-bottom-5 duration-700 w-full max-w-2xl">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t('import.upload.note')}</AlertTitle>
          <AlertDescription>
            {t('import.upload.noteDescription')}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
