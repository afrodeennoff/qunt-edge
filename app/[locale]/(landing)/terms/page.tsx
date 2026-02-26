import { TermsPageClient } from './terms-page-client';

export const revalidate = 3600;

export default function TermsPage() {
  return <TermsPageClient />;
}
