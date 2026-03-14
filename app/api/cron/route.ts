import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Resend } from 'resend'
import { headers } from 'next/headers'
import { requireServiceAuth, toErrorResponse } from "@/server/authz"

export const dynamic = 'force-dynamic'

const MAX_LOG_MESSAGE_LENGTH = 200

const maskId = (value?: string) => value ? `${value.slice(0, 6)}…` : 'unknown'

const snippet = (value?: string) => {
  if (!value) return undefined
  if (value.length <= MAX_LOG_MESSAGE_LENGTH) {
    return value
  }
  return `${value.slice(0, MAX_LOG_MESSAGE_LENGTH)}…`
}

const sanitizeErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message) {
    return error.message
  }
  if (typeof error === "string") {
    return error
  }
  return "Unknown error"
}

const logSanitized = (
  level: "warn" | "error",
  event: string,
  context: Record<string, unknown> = {},
) => {
  console[level]({
    event,
    ...context
  })
}

// Retry configuration
const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second

async function fetchWithRetry(url: string, options: RequestInit, retries = MAX_RETRIES): Promise<Response> {
  try {
    const response = await fetch(url, options)
    return response
  } catch (error) {
    if (retries > 0 && (error instanceof Error && error.message.includes('ECONNRESET'))) {
      console.warn(`Retrying fetch (${MAX_RETRIES - retries + 1}/${MAX_RETRIES}) for ${url}`)
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
      return fetchWithRetry(url, options, retries - 1)
    }
    throw error
  }
}

export async function GET(req: Request) {
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is missing')
    return NextResponse.json({ error: 'Missing API key' }, { status: 500 })
  }
  const resend = new Resend(process.env.RESEND_API_KEY)

  try {
    // Verify that this is a legitimate Vercel cron job request
    const headersList = await headers()
    const authHeader = headersList.get('authorization')
    requireServiceAuth(authHeader, { serviceName: 'cron' })

    // Get all users with newsletter enabled
    const usersWithNewsletter = await prisma.newsletter.findMany({
      where: {
        isActive: {
          equals: true
        }
      }
    })

    // Get all users id with newsletter enabled
    const users = await prisma.user.findMany({
      where: {
        email: {
          in: usersWithNewsletter.map(newsletter => newsletter.email)
        }
      }
    })

    if (users.length === 0) {
      return NextResponse.json(
        { message: 'No users found' },
        { status: 200 }
      )
    }


    // Process subscribers in batches of 100 (Resend's batch limit)
    const batchSize = 100
    const batches: typeof users[] = []
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize)
      batches.push(batch)
    }

    let successCount = 0
    let errorCount = 0

    // Process each batch
    for (const batch of batches) {
      try {
        const emailBatch = batch.map(async (user) => {
          if (!user.email) {
            logSanitized("warn", "cron.user-without-email", {
              userId: maskId(user.id),
            })
            return null
          }

          try {
            // Get email data from the weekly summary endpoint with retry logic
            const response = await fetchWithRetry(
              `${process.env.NEXT_PUBLIC_APP_URL}/api/email/weekly-summary/${user.id}`,
              {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${process.env.CRON_SECRET}`
                }
              }
            )

            if (!response.ok) {
              const errorText = await response.text()
              logSanitized("warn", "cron.email-data-fetch-failed", {
                userId: maskId(user.id),
                status: response.status,
                statusText: response.statusText,
                bodySnippet: snippet(errorText),
                truncated: typeof errorText === "string" ? errorText.length > MAX_LOG_MESSAGE_LENGTH : false,
              })
              return null
            }

            const { emailData } = await response.json()
            return emailData
          } catch (error) {
            logSanitized("warn", "cron.email-batch-user-error", {
              userId: maskId(user.id),
              errorMessage: sanitizeErrorMessage(error),
            })
            return null
          }
        })

        // Filter out null values and send batch
        const validEmails = (await Promise.all(emailBatch)).filter(Boolean)
        if (validEmails.length > 0) {
          try {
            const result = await resend.batch.send(validEmails)
            successCount += result.data?.data.length || 0
            errorCount += batch.length - (result.data?.data.length || 0)
          } catch (error) {
            logSanitized("error", "cron.batch-send-failed", {
              batchSize: validEmails.length,
              errorMessage: sanitizeErrorMessage(error),
            })
            errorCount += validEmails.length
          }
        }
      } catch (error) {
        logSanitized("error", "cron.batch-processing-error", {
          batchSize: batch.length,
          errorMessage: sanitizeErrorMessage(error),
        })
        errorCount += batch.length
      }
    }

    return NextResponse.json({
      success: true,
      message: `Weekly emails processed: ${successCount} successful, ${errorCount} failed`,
      stats: { success: successCount, failed: errorCount }
    })

  } catch (error) {
    logSanitized("error", "cron.job-error", {
      errorMessage: sanitizeErrorMessage(error),
    })
    return toErrorResponse(error)
  }
}
