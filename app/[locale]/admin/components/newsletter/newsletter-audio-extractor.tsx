// components/audio-extractor.tsx
"use client"

import { useRef, useState } from 'react'
import { Input, Output, Conversion, ALL_FORMATS, BlobSource, WavOutputFormat, BufferTarget } from 'mediabunny'
import { Upload } from 'lucide-react'
import { AudioPlayer } from './newsletter-audio-player'

interface AudioExtractorProps {
  onAudioExtracted?: (audioBuffer: ArrayBuffer, fileName: string) => void
}

export function AudioExtractor({ onAudioExtracted }: AudioExtractorProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [extractedAudio, setExtractedAudio] = useState<{ buffer: ArrayBuffer; fileName: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const extractAudio = async (file: File) => {
    setIsLoading(true)
    setError(null)
    
    try {
      console.log('Starting audio extraction for file:', file.name, file.type, file.size)
      
      // Create input from the video file
      const input = new Input({
        source: new BlobSource(file),
        formats: ALL_FORMATS,
      })

      // Check if the file has audio tracks
      console.log('Checking for audio tracks...')
      const audioTrack = await input.getPrimaryAudioTrack()
      console.log('Audio track found:', audioTrack)
      
      if (!audioTrack) {
        throw new Error('No audio track found in the video file')
      }

      // Create output for WAV audio (more compatible than MP3)
      console.log('Creating output format...')
      const output = new Output({
        format: new WavOutputFormat(),
        target: new BufferTarget(),
      })

      // Perform the conversion - Mediabunny should automatically handle audio extraction
      console.log('Initializing conversion...')
      const conversion = await Conversion.init({ input, output })
      console.log('Conversion initialized, executing...')
      await conversion.execute()
      console.log('Conversion completed')

      // Get the resulting audio buffer
      const buffer = output.target.buffer
      console.log('Buffer generated:', buffer ? buffer.byteLength : 'null')
      
      if (!buffer) {
        throw new Error('Failed to generate audio file - no buffer created')
      }
      
      // Pass the audio buffer to the parent component
      const audioFileName = `${file.name.replace(/\.[^/.]+$/, '')}.wav`
      
      // Store the extracted audio for the player
      setExtractedAudio({ buffer, fileName: audioFileName })
      
      if (onAudioExtracted) {
        onAudioExtracted(buffer, audioFileName)
        console.log('Audio extraction completed successfully, passed to parent component')
      }

    } catch (error) {
      console.error('Error extracting audio:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      setError(`Failed to extract audio: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('video/')) {
      extractAudio(file)
    }
  }


  return (
    <div className="p-4 bg-white dark:bg-black">
      {error && <div className="mb-4 p-3 bg-semantic-error-bg dark:bg-semantic-error-bg/20 border border-semantic-error-border dark:border-semantic-error-border rounded-md text-semantic-error dark:text-semantic-error">{error}</div>}
      
      <div className="relative">
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileChange}
        disabled={isLoading}
          className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-semantic-info-bg dark:file:bg-semantic-info-bg/20 file:text-semantic-info dark:file:text-semantic-info hover:file:bg-semantic-info-bg dark:hover:file:bg-semantic-info-bg/30"
        />
        <Upload className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
      </div>
      
      {isLoading && (
        <div className="mt-2 flex items-center gap-2 text-gray-700 dark:text-gray-300">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-semantic-info-border dark:border-semantic-info-border"></div>
          <span>Extracting audio...</span>
        </div>
      )}
      
      {/* Audio Player */}
      {extractedAudio && (
        <div className="mt-4">
          <AudioPlayer 
            audioBuffer={extractedAudio.buffer}
            fileName={extractedAudio.fileName}
          />
        </div>
      )}
    </div>
  )
}