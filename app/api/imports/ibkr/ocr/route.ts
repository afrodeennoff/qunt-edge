import PDFParser from 'pdf2json'
import { logger } from '@/lib/logger'
import { apiError } from '@/lib/api-response'
import { createRateLimitResponse, rateLimit } from '@/lib/rate-limit'

export const maxDuration = 60

const MAX_PDF_BYTES = 10 * 1024 * 1024
const MAX_OCR_BODY_BYTES = 12 * 1024 * 1024
const ocrRateLimit = rateLimit({ limit: 15, window: 60_000, identifier: 'ibkr-ocr' })

type Attachment = {
  type?: string
  content?: ArrayBuffer | string
}

type OCRRequestBody = {
  attachments?: Attachment[]
}

type ParsedRun = { T: string }
type ParsedText = { R: ParsedRun[] }
type ParsedPage = { Texts: ParsedText[] }
type ParsedPDFData = { Pages: ParsedPage[] }

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function errorResponse(
  requestId: string,
  status: number,
  error: string,
  code: string
): Response {
  return jsonResponse(
    {
      error: { code, message: error, details: { requestId } },
      code,
      requestId,
    },
    status,
  )
}

function normalizeAttachment(body: OCRRequestBody): Attachment | null {
  const first = body.attachments?.[0]
  return first ?? null
}

function decodePdfBuffer(attachment: Attachment): Buffer {
  if (attachment.content instanceof ArrayBuffer) {
    return Buffer.from(attachment.content)
  }

  if (typeof attachment.content === 'string') {
    return Buffer.from(attachment.content, 'base64')
  }

  throw new Error('Invalid file content format')
}

async function extractTextFromPdf(pdfBuffer: Buffer): Promise<string> {
  return new Promise((resolve) => {
    const pdfParser = new PDFParser()
    let extractedText = ''

    pdfParser.on('pdfParser_dataError', (errData: unknown) => {
      const message = errData instanceof Error ? errData.message : 'PDF parsing failed'
      resolve(`PDF processing failed: ${message}`)
    })

    pdfParser.on('pdfParser_dataReady', (pdfData: unknown) => {
      try {
        const parsedData = pdfData as ParsedPDFData
        parsedData.Pages.forEach((page) => {
          page.Texts.forEach((text) => {
            text.R.forEach((run) => {
              extractedText += `${decodeURIComponent(run.T)} `
            })
          })
          extractedText += '\n'
        })
        resolve(extractedText.trim())
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        resolve(`PDF processing failed: ${message}`)
      }
    })

    pdfParser.parseBuffer(pdfBuffer)
  })
}

export async function POST(request: Request) {
  const requestId = crypto.randomUUID()

  try {
    const contentLength = Number(request.headers.get('content-length') || 0)
    if (Number.isFinite(contentLength) && contentLength > MAX_OCR_BODY_BYTES) {
      return apiError(
        'PAYLOAD_TOO_LARGE',
        `Request body exceeds ${Math.round(MAX_OCR_BODY_BYTES / (1024 * 1024))}MB.`,
        413,
        { requestId },
      )
    }

    const limit = await ocrRateLimit(request)
    if (!limit.success) {
      return createRateLimitResponse({
        limit: limit.limit,
        remaining: limit.remaining,
        resetTime: limit.resetTime,
      })
    }

    const json = (await request.json()) as OCRRequestBody
    const attachment = normalizeAttachment(json)

    if (!attachment) {
      return errorResponse(requestId, 400, 'No file provided', 'IMPORT_FILE_MISSING')
    }

    if (attachment.type !== 'application/pdf') {
      return errorResponse(requestId, 400, 'Invalid file type. Only PDF files are allowed.', 'IMPORT_FILE_TYPE_INVALID')
    }

    let pdfBuffer: Buffer
    try {
      pdfBuffer = decodePdfBuffer(attachment)
    } catch (error) {
      logger.warn('[IBKR OCR] Invalid file payload', {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown payload error',
      })
      return errorResponse(requestId, 400, 'Invalid file content format', 'IMPORT_FILE_CONTENT_INVALID')
    }

    if (pdfBuffer.length === 0) {
      return errorResponse(requestId, 400, 'PDF file is empty', 'IMPORT_FILE_EMPTY')
    }

    if (pdfBuffer.length > MAX_PDF_BYTES) {
      return errorResponse(
        requestId,
        413,
        `PDF exceeds ${MAX_PDF_BYTES / (1024 * 1024)}MB size limit`,
        'IMPORT_FILE_TOO_LARGE'
      )
    }

    const extractedText = await extractTextFromPdf(pdfBuffer)

    if (!extractedText || extractedText.startsWith('PDF processing failed:')) {
      return errorResponse(
        requestId,
        422,
        extractedText || 'PDF parsing produced no text',
        'IMPORT_PDF_PARSE_FAILED'
      )
    }

    return jsonResponse({ text: extractedText, requestId }, 200)
  } catch (error) {
    logger.error('[IBKR OCR] Request processing failed', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return errorResponse(requestId, 500, 'Failed to process request', 'IMPORT_OCR_INTERNAL_ERROR')
  }
}
