'use client';

import React from 'react';
import { useI18n } from '@/locales/client';
import { UnifiedPageShell, UnifiedSurface } from '@/components/layout/unified-page-shell';

function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-2xl font-semibold text-fg-primary">{title}</h2>
      <div className="space-y-2 text-fg-muted">{children}</div>
    </section>
  );
}

export function TermsPageClient() {
  const t = useI18n();

  return (
    <UnifiedPageShell widthClassName="max-w-none" className="py-8">
      <UnifiedSurface className="space-y-8">
        <LegalSection title={t('terms.sections.companyInfo.title')}>
          <p>{t('terms.sections.companyInfo.content')}</p>
          <p>
            {t('terms.sections.companyInfo.contact')}
            <a href="mailto:contact@qunt-edge.com" className="text-fg-primary underline underline-offset-4">
              contact@qunt-edge.com
            </a>
          </p>
        </LegalSection>

        <LegalSection title={t('terms.sections.services.title')}>
          <p>{t('terms.sections.services.content')}</p>
        </LegalSection>

        <LegalSection title={t('terms.sections.userAccounts.title')}>
          <p>{t('terms.sections.userAccounts.content')}</p>
        </LegalSection>

        <LegalSection title={t('terms.sections.subscriptionPayments.title')}>
          <p>{t('terms.sections.subscriptionPayments.content')}</p>
          <h3 className="pt-2 text-lg font-semibold text-fg-primary">{t('terms.sections.subscriptionPayments.storageClarification')}</h3>
          <p>{t('terms.sections.subscriptionPayments.fairUse')}</p>
          <h3 className="pt-2 text-lg font-semibold text-fg-primary">{t('terms.sections.subscriptionPayments.lifetimePlan.title')}</h3>
          <p>{t('terms.sections.subscriptionPayments.lifetimePlan.description')}</p>
          <ul className="list-disc pl-5">
            <li>{t('terms.sections.subscriptionPayments.lifetimePlan.condition1')}</li>
            <li>{t('terms.sections.subscriptionPayments.lifetimePlan.condition2')}</li>
            <li>{t('terms.sections.subscriptionPayments.lifetimePlan.condition3')}</li>
            <li>{t('terms.sections.subscriptionPayments.lifetimePlan.condition4')}</li>
            <li>{t('terms.sections.subscriptionPayments.lifetimePlan.condition5')}</li>
            <li>{t('terms.sections.subscriptionPayments.lifetimePlan.condition6')}</li>
          </ul>
        </LegalSection>

        <LegalSection title={t('terms.sections.intellectualProperty.title')}>
          <p>{t('terms.sections.intellectualProperty.content')}</p>
        </LegalSection>

        <LegalSection title={t('terms.sections.dataProtection.title')}>
          <p>{t('terms.sections.dataProtection.content')}</p>
          <p>{t('terms.sections.dataProtection.dataExport')}</p>
        </LegalSection>

        <LegalSection title={t('terms.sections.liability.title')}>
          <p>{t('terms.sections.liability.content')}</p>
        </LegalSection>

        <LegalSection title={t('terms.sections.termination.title')}>
          <p>{t('terms.sections.termination.content')}</p>
        </LegalSection>

        <LegalSection title={t('terms.sections.serviceAvailability.title')}>
          <p>{t('terms.sections.serviceAvailability.description')}</p>
          <ul className="list-disc pl-5">
            <li>{t('terms.sections.serviceAvailability.condition1')}</li>
            <li>{t('terms.sections.serviceAvailability.condition2')}</li>
            <li>{t('terms.sections.serviceAvailability.condition3')}</li>
          </ul>
          <p>{t('terms.sections.serviceAvailability.notice')}</p>
        </LegalSection>

        <LegalSection title={t('terms.sections.governingLaw.title')}>
          <p>{t('terms.sections.governingLaw.content')}</p>
        </LegalSection>

        <LegalSection title={t('terms.sections.changesTerms.title')}>
          <p>{t('terms.sections.changesTerms.content')}</p>
        </LegalSection>

        <p className="border-t border-white/10 pt-5 text-xs uppercase tracking-[0.12em] text-fg-muted">
          {t('terms.lastUpdated')}
          {new Date().toISOString().split('T')[0]}
        </p>
      </UnifiedSurface>
    </UnifiedPageShell>
  );
}
