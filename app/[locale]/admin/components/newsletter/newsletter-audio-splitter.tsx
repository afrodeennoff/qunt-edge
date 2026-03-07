// components/audio-splitter.tsx
"use client"

import { useRef, useState } from 'react'
import { Input, Output, Conversion, ALL_FORMATS, BlobSource, WavOutputFormat, BufferTarget } from 'mediabunny'
import { Upload, Download, Play, Pause } from 'lucide-react'
import { TranscriptionComponent } from './newsletter-transcription'

interface AudioSegment {
  buffer: ArrayBuffer
  fileName: string
  startTime: number
  endTime: number
  index: number
}

interface AudioSplitterProps {
  onSegmentsCreated?: (segments: AudioSegment[]) => void
  onTranscriptionComplete?: (transcriptions: any[]) => void
}

export function AudioSplitter({ onSegmentsCreated, onTranscriptionComplete }: AudioSplitterProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [segments, setSegments] = useState<AudioSegment[]>([])
  const [progress, setProgress] = useState(0)
  const [currentSegment, setCurrentSegment] = useState<number | null>(null)
  const [playingSegment, setPlayingSegment] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)

  const splitAudio = async (file: File) => {
    setIsLoading(true)
    setError(null)
    setProgress(0)
    setSegments([])
    
    try {
      console.log('Starting audio splitting for file:', file.name, file.type, file.size)
      
      // Create input from the video/audio file
      const input = new Input({
        source: new BlobSource(file),
        formats: ALL_FORMATS,
      })

      // Check if the file has audio tracks
      console.log('Checking for audio tracks...')
      const audioTrack = await input.getPrimaryAudioTrack()
      console.log('Audio track found:', audioTrack)
      
      if (!audioTrack) {
        throw new Error('No audio track found in the file')
      }

      // Get the duration of the audio track
      const duration = await audioTrack.computeDuration()
      console.log('Audio duration:', duration, 'seconds')

      // Calculate number of 10-second segments
      const segmentDuration = 10 // 10 seconds
      const numberOfSegments = Math.ceil(duration / segmentDuration)
      console.log('Number of segments to create:', numberOfSegments)

      const createdSegments: AudioSegment[] = []

      // Create each segment
      for (let i = 0; i < numberOfSegments; i++) {
        const startTime = i * segmentDuration
        const endTime = Math.min(startTime + segmentDuration, duration)
        
        console.log(`Creating segment ${i + 1}/${numberOfSegments}: ${startTime}s - ${endTime}s`)
        
        // Create output for WAV audio
        const output = new Output({
          format: new WavOutputFormat(),
          target: new BufferTarget(),
        })

        // Perform the conversion with trim option
        const conversion = await Conversion.init({ 
          input, 
          output,
          trim: {
            start: startTime,
            end: endTime,
          }
        })
        
        await conversion.execute()

        // Get the resulting audio buffer
        const buffer = output.target.buffer
        
        if (!buffer) {
          throw new Error(`Failed to generate segment ${i + 1} - no buffer created`)
        }
        
        // Create segment object
        const segment: AudioSegment = {
          buffer,
          fileName: `${file.name.replace(/\.[^/.]+$/, '')}_segment_${String(i + 1).padStart(3, '0')}.wav`,
          startTime,
          endTime,
          index: i + 1
        }
        
        createdSegments.push(segment)
        
        // Update progress
        const progressPercent = ((i + 1) / numberOfSegments) * 100
        setProgress(progressPercent)
        setCurrentSegment(i + 1)
        
        console.log(`Segment ${i + 1} created successfully`)
      }

      setSegments(createdSegments)
      
      if (onSegmentsCreated) {
        onSegmentsCreated(createdSegments)
      }

      console.log('Audio splitting completed successfully')

    } catch (error) {
      console.error('Error splitting audio:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      setError(`Failed to split audio: ${errorMessage}`)
    } finally {
      setIsLoading(false)
      setCurrentSegment(null)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && (file.type.startsWith('video/') || file.type.startsWith('audio/'))) {
      splitAudio(file)
    }
  }

  const downloadSegment = (segment: AudioSegment) => {
    const blob = new Blob([segment.buffer], { type: 'audio/wav' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = segment.fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const playSegment = async (segment: AudioSegment) => {
    try {
      // Stop any currently playing audio
      if (audioContextRef.current) {
        await audioContextRef.current.close()
      }

      // Create new audio context
      audioContextRef.current = new AudioContext()
      
      // Decode the audio buffer
      const audioBuffer = await audioContextRef.current.decodeAudioData(segment.buffer.slice(0))
      
      // Create and play the audio
      const source = audioContextRef.current.createBufferSource()
      source.buffer = audioBuffer
      source.connect(audioContextRef.current.destination)
      
      setPlayingSegment(segment.index)
      
      source.onended = () => {
        setPlayingSegment(null)
      }
      
      source.start()
    } catch (error) {
      console.error('Error playing segment:', error)
    }
  }

  const stopAudio = () => {
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
    setPlayingSegment(null)
  }

  return (
    <div className="p-4 bg-white dark:bg-black">
      {error && (
        <div className="mb-4 p-3 bg-semantic-error-bg dark:bg-semantic-error-bg/20 border border-semantic-error-border dark:border-semantic-error-border rounded-md text-semantic-error dark:text-semantic-error">
          {error}
        </div>
      )}
      
      <div className="relative">
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*,audio/*"
          onChange={handleFileChange}
          disabled={isLoading}
          className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-semantic-info-bg dark:file:bg-semantic-info-bg/20 file:text-semantic-info dark:file:text-semantic-info hover:file:bg-semantic-info-bg dark:hover:file:bg-semantic-info-bg/30"
        />
        <Upload className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
      </div>
      
      {isLoading && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-semantic-info-border dark:border-semantic-info-border"></div>
            <span>
              {currentSegment ? `Creating segment ${currentSegment}...` : 'Processing audio...'}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-semantic-info-bg dark:bg-semantic-info-bg h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {Math.round(progress)}% complete
          </div>
        </div>
      )}
      
      {/* Segments List */}
      {segments.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Generated Segments ({segments.length})
          </h3>
          <div className="space-y-3">
            {segments.map((segment) => (
              <div 
                key={segment.index} 
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {segment.fileName}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Segment {segment.index} • {segment.startTime.toFixed(1)}s - {segment.endTime.toFixed(1)}s
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => playingSegment === segment.index ? stopAudio() : playSegment(segment)}
                    className="p-2 text-semantic-info dark:text-semantic-info hover:bg-semantic-info-bg dark:hover:bg-semantic-info-bg/20 rounded-md transition-colors"
                    title={playingSegment === segment.index ? 'Stop' : 'Play'}
                  >
                    {playingSegment === segment.index ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => downloadSegment(segment)}
                    className="p-2 text-white dark:text-white hover:bg-white/10 dark:hover:bg-white/10 rounded-md transition-colors"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Download All Button */}
          <div className="mt-4">
            <button
              onClick={() => segments.forEach(downloadSegment)}
              className="w-full py-2 px-4 bg-semantic-info-bg dark:bg-semantic-info-bg text-white rounded-md hover:bg-semantic-info-bg dark:hover:bg-semantic-info-bg transition-colors"
            >
              Download All Segments
            </button>
          </div>
        </div>
      )}

      {/* Transcription Component */}
      {segments.length > 0 && (
        <div className="mt-6">
          <TranscriptionComponent 
            segments={segments}
            onTranscriptionComplete={(transcriptions) => {
              if (onTranscriptionComplete) {
                onTranscriptionComplete(transcriptions)
              }
            }}
          />
        </div>
      )}
    </div>
  )
}
