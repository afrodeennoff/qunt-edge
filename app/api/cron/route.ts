import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Resend } from 'resend'
import { headers } from 'next/headers'
import { requireServiceAuth, toErrorResponse } from "@/server/authz"

export const dynamic = 'force-dynamic'

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

export async function GET() {
  try {
    // Fail with auth errors first so unauthorized calls don't get masked by config errors.
    const headersList = await headers()
    const authHeader = headersList.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Missing authorization header', code: 'UNAUTHORIZED' },
        { status: 401 },
      )
    }
    if (!process.env.CRON_SECRET) {
      return NextResponse.json(
        { error: 'Service not configured', code: 'CRON_SECRET_MISSING' },
        { status: 503 },
      )
    }
    requireServiceAuth(authHeader, { serviceName: 'cron' })

    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is missing')
      return NextResponse.json(
        { error: 'Service not configured', code: 'RESEND_API_KEY_MISSING' },
        { status: 503 },
      )
    }
    const resend = new Resend(process.env.RESEND_API_KEY)

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
            console.warn(`No email found for user: ${user.id}`)
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
              console.warn(`Failed to get email data for user ${user.id}:`, errorText)
              return null
            }

            const { emailData } = await response.json()
            return emailData
          } catch (error) {
            console.warn(`Error processing user ${user.id}:`, error)
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
            console.error('Failed to send email batch:', error)
            errorCount += validEmails.length
          }
        }
      } catch (error) {
        console.error('Error processing batch:', error)
        errorCount += batch.length
      }
    }

    console.log(`Weekly emails processed: ${successCount} successful, ${errorCount} failed`)

    return NextResponse.json({
      success: true,
      message: `Weekly emails processed: ${successCount} successful, ${errorCount} failed`,
      stats: { success: successCount, failed: errorCount }
    })

  } catch (error) {
    console.error('Cron job error:', error)
    return toErrorResponse(error)
  }
}
