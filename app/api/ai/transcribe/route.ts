import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createRateLimitResponse, rateLimit } from '@/lib/rate-limit'
import { createRouteClient } from '@/lib/supabase/route-client'

const transcribeRateLimit = rateLimit({ limit: 10, window: 60_000, identifier: 'ai-transcribe', requireDistributedInProduction: true })
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
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'Service unavailable', message: 'Transcription service is not configured' },
        { status: 503 }
      )
    }

    const supabase = createRouteClient(request)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const limit = await transcribeRateLimit(request)
    if (!limit.success) {
      return createRateLimitResponse({
        limit: limit.limit,
        remaining: limit.remaining,
        resetTime: limit.resetTime,
      })
    }

    const lengthHeader = request.headers.get('content-length')
    const contentLength = lengthHeader ? Number(lengthHeader) : 0
    if (Number.isFinite(contentLength) && contentLength > MAX_AUDIO_BYTES) {
      return NextResponse.json(
        { error: `Audio file exceeds ${Math.round(MAX_AUDIO_BYTES / (1024 * 1024))}MB limit` },
        { status: 413 }
      )
    }

    const formData = await request.formData()
    const audioFile = formData.get('audio') as File

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      )
    }

    if (audioFile.size <= 0) {
      return NextResponse.json(
        { error: 'Audio file is empty' },
        { status: 400 }
      )
    }

    if (audioFile.size > MAX_AUDIO_BYTES) {
      return NextResponse.json(
        { error: `Audio file exceeds ${Math.round(MAX_AUDIO_BYTES / (1024 * 1024))}MB limit` },
        { status: 413 }
      )
    }

    if (!ALLOWED_AUDIO_TYPES.has(audioFile.type)) {
      return NextResponse.json(
        { error: 'Unsupported audio format' },
        { status: 415 }
      )
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
    return NextResponse.json(
      { error: 'Failed to transcribe audio' },
      { status: 500 }
    )
  }
}
