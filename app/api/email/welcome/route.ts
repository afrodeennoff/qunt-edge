import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Resend } from 'resend'
import WelcomeEmail from '@/components/emails/welcome'
import { getLatestVideoFromPlaylist } from "@/app/[locale]/admin/actions/youtube"
import crypto from 'crypto'
import { buildUnsubscribeUrl } from "@/lib/unsubscribe-url"
import { z } from "zod"
import { parseJson, toValidationErrorResponse } from "@/app/api/_utils/validate"

export const dynamic = 'force-dynamic'

const welcomeWebhookSchema = z.object({
  type: z.string(),
  record: z.object({
    email: z.string().email(),
    raw_user_meta_data: z.record(z.string(), z.unknown()).optional(),
  }).passthrough(),
}).passthrough()

function isAuthorizedWebhook(request: Request): boolean {
  const secret = process.env.WELCOME_WEBHOOK_SECRET || process.env.SUPABASE_WEBHOOK_SECRET
  if (!secret) return false

  const authHeader = request.headers.get('authorization') || ''
  const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  const candidate = bearer || request.headers.get('x-webhook-secret') || ''

  if (!candidate) return false
  try {
    return crypto.timingSafeEqual(Buffer.from(candidate), Buffer.from(secret))
  } catch {
    return false
  }
}

export async function POST(req: Request) {
  if (!isAuthorizedWebhook(req)) {
    return NextResponse.json({ error: 'Unauthorized webhook request' }, { status: 401 })
  }

  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is missing')
    return NextResponse.json({ error: 'Missing API key' }, { status: 500 })
  }
  const resend = new Resend(process.env.RESEND_API_KEY)

  const fifteenMinutesFromNow = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  try {
    const payload = await parseJson(req, welcomeWebhookSchema)

    // Only process new user insertions
    if (payload.type !== 'INSERT') {
      return NextResponse.json(
        { message: 'Ignored event type' },
        { status: 200 }
      )
    }

    const { record } = payload
    console.log(record)

    // Identify user based on email

    // Get the user's first name or use default
    const rawName = record.raw_user_meta_data?.name
    const rawFullName = record.raw_user_meta_data?.full_name
    const fullName =
      (typeof rawName === "string" && rawName) ||
      (typeof rawFullName === "string" && rawFullName) ||
      ""
    const firstName = fullName.split(' ')[0] || 'trader'
    const lastName = fullName.split(' ')[1] || ''

    // Add email to newsletter list
    await prisma.newsletter.upsert({
      where: { email: record.email },
      update: { isActive: true },
      create: {
        email: record.email,
        firstName: firstName,
        lastName: lastName,
        isActive: true
      }
    })

    const unsubscribeUrl = buildUnsubscribeUrl(record.email, req)

    // Check user language preference from database
    const user = await prisma.user.findUnique({
      where: { email: record.email }
    })
    const userLanguage = user?.language || 'en'
    let youtubeId = 'ZBrIZpCh_7Q'
    if (userLanguage === 'fr') {
      youtubeId = await getLatestVideoFromPlaylist() || '_-VtBaOGctY'
    }

    // Use react prop instead of rendering to HTML
    const { data, error } = await resend.emails.send({
      from: 'Qunt Edge <welcome@eu.updates.qunt-edge.vercel.app>',
      to: record.email,
      subject: userLanguage === 'fr' ? 'Bienvenue sur Qunt Edge' : 'Welcome to Qunt Edge',
      react: WelcomeEmail({ firstName, email: record.email, language: userLanguage, youtubeId: youtubeId || 'ZBrIZpCh_7Q' }),
      replyTo: 'hugo.demenez@qunt-edge.vercel.app',
      headers: {
        'List-Unsubscribe': `<${unsubscribeUrl}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
      },
      scheduledAt: fifteenMinutesFromNow
    })

    if (error) {
      console.error('Email error:', error)
      return NextResponse.json(
        { error: 'Failed to send welcome email' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Successfully processed webhook and sent welcome email', data },
      { status: 200 }
    )

  } catch (error) {
    console.error('Webhook error:', error)
    return toValidationErrorResponse(error)
  }
}
