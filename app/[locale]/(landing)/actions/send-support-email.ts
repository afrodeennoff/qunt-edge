// app/actions/sendSupportEmail.ts
'use server'

import SupportRequestEmail from '@/components/emails/support-request';
import SubscriptionErrorEmail from '@/components/emails/support-subscription-error';
import { Resend } from 'resend';
import { createElement } from 'react';

// resend will be initialized inside functions

interface SupportEmailData {
  messages: { role: string; content: string }[];
  summary: string;
  contactInfo: {
    name: string,
    email: string;
    additionalInfo: string;
    locale: 'en' | 'fr';
  };
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const DEFAULT_SUPPORT_SENDER = 'support@eu.updates.qunt-edge.vercel.app'
const DEFAULT_SUPPORT_TEAM = 'support@qunt-edge.vercel.app'

function normalizeEmail(email?: string | null): string | null {
  if (!email) return null
  const normalized = email.trim().toLowerCase()
  return EMAIL_REGEX.test(normalized) ? normalized : null
}

function getSupportMailConfig() {
  const senderEmail = normalizeEmail(process.env.SUPPORT_EMAIL) ?? DEFAULT_SUPPORT_SENDER
  const teamEmail = normalizeEmail(process.env.SUPPORT_TEAM_EMAIL) ?? DEFAULT_SUPPORT_TEAM

  return {
    from: `Qunt Edge Support <${senderEmail}>`,
    to: teamEmail,
  }
}

export async function sendSupportEmail({ messages, summary, contactInfo }: SupportEmailData) {
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is missing');
    return { success: false, error: 'Email service not configured' };
  }
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const mailConfig = getSupportMailConfig()
    const ccEmail = normalizeEmail(contactInfo.email)

    const { data, error } = await resend.emails.send({
      from: mailConfig.from,
      to: [mailConfig.to],
      ...(ccEmail ? { cc: [ccEmail] } : {}),
      subject: contactInfo.locale === 'fr' ? 'Nouvelle demande de support' : 'New Support Request',
      react: createElement(SupportRequestEmail, { locale: contactInfo.locale, messages, contactInfo, summary }),
    });

    if (error) {
      console.error('Error sending email:', error);
      return { success: false, error: 'Failed to send support request' };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

interface SubscriptionErrorEmailData {
  contactInfo: {
    email: string;
    additionalInfo: string;
  };
}

export async function sendSubscriptionErrorEmail({ contactInfo }: SubscriptionErrorEmailData) {
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is missing');
    return { success: false, error: 'Email service not configured' };
  }
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const mailConfig = getSupportMailConfig()

    const { data, error } = await resend.emails.send({
      from: mailConfig.from,
      to: [mailConfig.to],
      subject: 'Error creating subscription',
      react: createElement(SubscriptionErrorEmail, { contactInfo }),
    });

    if (error) {
      console.error('Error sending email:', error);
      return { success: false, error: 'Failed to send support request' };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}
