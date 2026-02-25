import { UnifiedPageHeader, UnifiedPageShell, UnifiedSurface } from '@/components/layout/unified-page-shell';

export default function PrivacyPolicy() {
  return (
    <UnifiedPageShell widthClassName="max-w-5xl" className="py-8">
      <UnifiedPageHeader
        eyebrow="Legal"
        title="Privacy Policy"
        description="How we collect, use, and protect your account and trading data."
      />

      <UnifiedSurface className="space-y-8 text-fg-muted">
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-fg-primary">1. Introduction</h2>
          <p>
            Qunt Edge (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy.
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-fg-primary">2. Information We Collect</h2>
          <p>We collect information when you create an account, including:</p>
          <ul className="list-disc pl-5">
            <li>Email address</li>
            <li>Name</li>
            <li>Discord profile picture URL (if you sign up using Discord OAuth)</li>
          </ul>
          <p>We also collect and store trades data that you provide to us for analysis purposes.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-fg-primary">3. How We Use Your Information</h2>
          <p>We use the collected information for various purposes, including:</p>
          <ul className="list-disc pl-5">
            <li>Providing and maintaining our service</li>
            <li>Notifying you about changes to our service</li>
            <li>Allowing you to participate in interactive features of our service</li>
            <li>Providing customer support</li>
            <li>Gathering analysis or valuable information to improve our service</li>
            <li>Monitoring the usage of our service</li>
            <li>Detecting, preventing and addressing technical issues</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-fg-primary">4. Data Storage and Security</h2>
          <p>
            We use Supabase, a SOC 2 compliant service, to store your data. We implement appropriate data collection,
            storage and processing practices and security measures to protect against unauthorized access, alteration,
            disclosure or destruction of your personal information and data stored on our service.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-fg-primary">5. Cookies</h2>
          <p>
            We use &quot;cookies&quot; to collect information. Cookies are small data files stored on your hard drive by a website.
            We may use both session cookies and persistent cookies to provide you with a more personal and interactive experience.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-fg-primary">6. Third-Party Services</h2>
          <p>
            We do not use third-party analytics services. Our service may contain links to other sites that are not
            operated by us. We strongly advise you to review the privacy policy of every site you visit.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-fg-primary">7. GDPR Compliance</h2>
          <p>
            We comply with the General Data Protection Regulation (GDPR). You have the right to access, update or
            delete your personal information. Please contact us to exercise these rights.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-fg-primary">8. Changes to This Privacy Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new
            Privacy Policy on this page and updating the &quot;Last updated&quot; date.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-fg-primary">9. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at{" "}
            <a href="mailto:contact@qunt-edge.com" className="text-fg-primary underline underline-offset-4">
              contact@qunt-edge.com
            </a>
            .
          </p>
        </section>

        <p className="border-t border-white/10 pt-5 text-xs uppercase tracking-[0.12em] text-fg-muted">
          Last updated: {new Date().toISOString().split('T')[0]}
        </p>
      </UnifiedSurface>
    </UnifiedPageShell>
  );
}
