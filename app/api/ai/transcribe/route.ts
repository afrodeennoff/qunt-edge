import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { rateLimit } from '@/lib/rate-limit'
import { guardAiRequest } from '@/lib/ai/route-guard'
import { apiError } from '@/lib/api-response'

const transcribeRateLimit = rateLimit({ limit: 10, window: 60_000, identifier: 'ai-transcribe' })
const MAX_AUDIO_BYTES = 25 * 1024 * 1024
const ALLOWED_AUDIO_TYPES = new Set([
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/webm',
  'audio/mp4',
  'audio/ogg',
  'audio/flac',
  'audio/x-m4a',
  'audio/aac',
])

export async function POST(request: NextRequest) {
  // Apply AI route guard (auth + entitlements + rate limit + budget)
  const guard = await guardAiRequest(request, 'transcribe', transcribeRateLimit)
  if (!guard.ok) return guard.response
  const { userId } = guard

  try {
    if (!process.env.OPENAI_API_KEY) {
      return apiError('SERVICE_UNAVAILABLE', 'Transcription service is not configured', 503)
    }

    const lengthHeader = request.headers.get('content-length')
    const contentLength = lengthHeader ? Number(lengthHeader) : 0
    if (Number.isFinite(contentLength) && contentLength > MAX_AUDIO_BYTES) {
      return apiError(
        'PAYLOAD_TOO_LARGE',
        `Audio file exceeds ${Math.round(MAX_AUDIO_BYTES / (1024 * 1024))}MB limit`,
        413,
      )
    }

    const formData = await request.formData()
    const audioFile = formData.get('audio') as File

    if (!audioFile) {
      return apiError('VALIDATION_FAILED', 'No audio file provided', 400)
    }

    if (audioFile.size <= 0) {
      return apiError('VALIDATION_FAILED', 'Audio file is empty', 400)
    }

    if (audioFile.size > MAX_AUDIO_BYTES) {
      return apiError(
        'PAYLOAD_TOO_LARGE',
        `Audio file exceeds ${Math.round(MAX_AUDIO_BYTES / (1024 * 1024))}MB limit`,
        413,
      )
    }

    if (!ALLOWED_AUDIO_TYPES.has(audioFile.type)) {
      return apiError('UNSUPPORTED_MEDIA_TYPE', 'Unsupported audio format', 415)
    }

    // Convert File to the format expected by OpenAI
    const audioBuffer = await audioFile.arrayBuffer()
    const audioBlob = new Blob([audioBuffer], { type: audioFile.type })

    // Create a File object for OpenAI API
    const audioForWhisper = new File([audioBlob], audioFile.name, {
      type: audioFile.type,
    })

    const openai = new OpenAI({
      baseURL: 'https://api.z.ai/api/paas/v4',
      apiKey: process.env.OPENAI_API_KEY,
    })

    // Transcribe using OpenAI Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: audioForWhisper,
      model: 'whisper-1',
      response_format: 'text',
    })

    return NextResponse.json({
      transcription: transcription,
      fileName: audioFile.name,
    })

  } catch (error) {
    console.error('Transcription error:', error)
    return apiError('INTERNAL_ERROR', 'Failed to transcribe audio', 500)
  }
}
