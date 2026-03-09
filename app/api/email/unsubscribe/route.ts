import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyUnsubscribeToken } from "@/lib/unsubscribe-token"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const token = searchParams.get('token')

    if (!email || !token) {
      return NextResponse.json(
        { error: 'Invalid unsubscribe link' },
        { status: 401 }
      )
    }

    if (!verifyUnsubscribeToken(token, email)) {
      return NextResponse.json(
        { error: 'Invalid or expired unsubscribe token' },
        { status: 401 }
      )
    }

    // Update or create newsletter record with isActive = false
    await prisma.newsletter.upsert({
      where: { email },
      update: { isActive: false },
      create: {
        email,
        isActive: false
      }
    })

    // Redirect to the newsletter preferences page
    return NextResponse.redirect(
      new URL(`/newsletter?status=unsubscribed&email=${encodeURIComponent(email)}`, request.url)
    )
  } catch (error) {
    console.error('Unsubscribe error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
