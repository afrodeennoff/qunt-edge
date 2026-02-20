import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Resend } from 'resend'
import { headers } from 'next/headers'
import { format, subDays, isEqual, startOfDay } from 'date-fns'
import { enUS, fr } from 'date-fns/locale'
import RenewalNoticeEmail from '@/components/emails/renewal-notice'
import { requireServiceAuth, toErrorResponse } from '@/server/authz'
import { buildUnsubscribeUrl } from '@/lib/unsubscribe-url'

export const dynamic = 'force-dynamic'

// Utility function to get date locale
const getDateLocale = (language: string) => {
  return language === 'fr' ? fr : enUS
}

// Utility function to format payment frequency for display
const getFrequencyDisplay = (frequency: string, language: string) => {
  const frequencies = {
    en: {
      monthly: 'Monthly',
      quarterly: 'Quarterly',
      biannual: 'Bi-annual',
      annual: 'Annual',
      custom: 'Custom'
    },
    fr: {
      monthly: 'Mensuel',
      quarterly: 'Trimestriel',
      biannual: 'Semestriel',
      annual: 'Annuel',
      custom: 'Personnalisé'
    }
  }

  return frequencies[language as keyof typeof frequencies]?.[frequency as keyof typeof frequencies.en] || frequency
}

// Daily cron job handler - runs every day at 9 AM UTC
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
    requireServiceAuth(authHeader, { serviceName: 'cron-renewal-notice' })

    const today = startOfDay(new Date())

    // Find all accounts with auto-renewal enabled and valid payment dates
    const accountsWithRenewal = await prisma.account.findMany({
      where: {
        autoRenewal: true,
        nextPaymentDate: {
          not: null
        },
        renewalNotice: {
          not: null,
          gt: 0
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            language: true
          }
        }
      }
    })

    if (accountsWithRenewal.length === 0) {
      return NextResponse.json(
        { message: 'No accounts with auto-renewal found' },
        { status: 200 }
      )
    }

    // Filter accounts that need renewal notification today
    const accountsToNotify = accountsWithRenewal.filter(account => {
      if (!account.nextPaymentDate || !account.renewalNotice) return false

      const notificationDate = startOfDay(subDays(account.nextPaymentDate, account.renewalNotice))
      if (!isEqual(notificationDate, today)) return false

      if (account.renewalNoticeLastSentAt && isEqual(startOfDay(account.renewalNoticeLastSentAt), today)) {
        return false
      }

      return true
    })

    if (accountsToNotify.length === 0) {
      return NextResponse.json(
        { message: 'No accounts need renewal notification today' },
        { status: 200 }
      )
    }

    let successCount = 0
    let errorCount = 0

    // Group accounts by user to avoid sending multiple emails to the same user
    const userAccountsMap = new Map<string, typeof accountsToNotify>()

    accountsToNotify.forEach(account => {
      if (account.user?.email) {
        const existing = userAccountsMap.get(account.user.email) || []
        userAccountsMap.set(account.user.email, [...existing, account])
      }
    })

    // Send emails to each user
    for (const [userEmail, userAccounts] of userAccountsMap) {
      try {
        const user = userAccounts[0].user!
        const userLanguage = user.language || 'en'
        const locale = getDateLocale(userLanguage)

        // If user has multiple accounts expiring, send one email with all accounts
        // For simplicity, we'll send separate emails for each account
        for (const account of userAccounts) {
          try {
            const daysUntilRenewal = account.renewalNotice!
            const nextPaymentDate = format(account.nextPaymentDate!, 'PPP', { locale })
            const accountName = account.number || `Account ${account.id}`
            const propFirmName = account.propfirm || 'Unknown Prop Firm'
            const frequency = account.paymentFrequency || 'monthly'

            const unsubscribeUrl = buildUnsubscribeUrl(userEmail, req)

            const { data, error } = await resend.emails.send({
              from: 'Qunt Edge Renewals <renewals@eu.updates.qunt-edge.vercel.app>',
              to: userEmail,
              subject: userLanguage === 'fr'
                ? `Renouvellement prochain - ${accountName}`
                : `Upcoming Renewal - ${accountName}`,
              react: RenewalNoticeEmail({
                userFirstName: user.email.split('@')[0],
                userEmail: userEmail,
                accountName: accountName,
                propFirmName: propFirmName,
                nextPaymentDate: nextPaymentDate,
                daysUntilRenewal: daysUntilRenewal,
                paymentFrequency: frequency,
                language: userLanguage,
                unsubscribeUrl: unsubscribeUrl
              }),
              replyTo: 'hugo.demenez@qunt-edge.vercel.app',
              headers: {
                'List-Unsubscribe': `<${unsubscribeUrl}>`,
                'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
              }
            })

            if (error) {
              console.error(`Failed to send renewal notice to ${userEmail} for account ${account.id}:`, error)
              errorCount++
            } else {
              console.log(`Renewal notice sent to ${userEmail} for account ${account.id}`)
              successCount++

              await prisma.account.update({
                where: { id: account.id },
                data: { renewalNoticeLastSentAt: new Date() }
              })
            }
          } catch (accountError) {
            console.error(`Error processing account ${account.id}:`, accountError)
            errorCount++
          }
        }
      } catch (userError) {
        console.error(`Error processing user ${userEmail}:`, userError)
        errorCount += userAccounts.length
      }
    }

    console.log(`Renewal notice emails processed: ${successCount} successful, ${errorCount} failed`)

    return NextResponse.json({
      success: true,
      message: `Renewal notice emails processed: ${successCount} successful, ${errorCount} failed`,
      stats: {
        success: successCount,
        failed: errorCount,
        accountsChecked: accountsWithRenewal.length,
        accountsToNotify: accountsToNotify.length,
        usersNotified: userAccountsMap.size
      }
    })

  } catch (error) {
    console.error('Renewal notice cron job error:', error)
    return toErrorResponse(error)
  }
}
