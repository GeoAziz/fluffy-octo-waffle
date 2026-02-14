import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const LAST_UPDATED = '2026-02-10';

const sections = [
  { id: 'information-we-collect', title: 'Information We Collect' },
  { id: 'how-we-use-information', title: 'How We Use Information' },
  { id: 'ai-processing', title: 'AI Processing' },
  { id: 'information-sharing', title: 'Information Sharing' },
  { id: 'data-security', title: 'Data Security' },
] as const;

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto max-w-5xl py-10 px-4" id="top">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Privacy Policy</CardTitle>
          <p className="text-sm text-muted-foreground">
            Last updated:{' '}
            <time dateTime={LAST_UPDATED} className="font-medium text-foreground">
              {LAST_UPDATED}
            </time>
          </p>
          <div className="rounded-md border bg-muted/30 p-4 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground mb-2">Plain-language summary</p>
            <ul className="list-disc ml-5 space-y-1">
              <li>We collect account, listing, and support details you submit.</li>
              <li>We use this data to run the marketplace and support your activity.</li>
              <li>AI analysis is advisory and does not replace legal or financial advice.</li>
              <li>We apply reasonable safeguards but no system is risk-free.</li>
            </ul>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <nav aria-label="Privacy policy table of contents" className="rounded-md border bg-muted/30 p-4">
            <p className="text-sm font-semibold mb-2">On this page</p>
            <ul className="grid gap-1 text-sm sm:grid-cols-2">
              {sections.map((section, index) => (
                <li key={section.id}>
                  <a href={`#${section.id}`} className="hover:underline">
                    {index + 1}. {section.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="prose prose-stone dark:prose-invert max-w-none space-y-6">
            <section id="information-we-collect">
              <h2 className="text-xl font-semibold">1. Information We Collect</h2>
              <p>
                We collect information you provide directly to us, such as when you create an account, create or modify your profile, upload listing information and evidence documents, or otherwise communicate with us. This information may include your name, email, phone number, and any files you upload.
              </p>
            </section>
            <section id="how-we-use-information">
              <h2 className="text-xl font-semibold">2. How We Use Information</h2>
              <p>
                We may use the information we collect to provide, maintain, and improve our services, including to process transactions, develop new features, provide customer support, and authenticate users. We also use the content of uploaded documents to provide AI-powered analysis and summaries as part of our platform&apos;s features.
              </p>
            </section>
            <section id="ai-processing">
              <h2 className="text-xl font-semibold">3. AI Processing</h2>
              <p>
                When you upload listing materials, we may process them with AI systems to generate summaries, suggest trust badges, and identify potential risks. These outputs are advisory and are not used as a sole basis for legal or financial decisions.
              </p>
            </section>
            <section id="information-sharing">
              <h2 className="text-xl font-semibold">4. Information Sharing</h2>
              <p>
                We do not share your private information with third parties except as necessary to provide our services (such as with our cloud and AI service providers), to comply with the law, or to protect our rights. Publicly visible information on an approved listing, such as the property details and seller&apos;s name, will be accessible to visitors.
              </p>
            </section>
            <section id="data-security">
              <h2 className="text-xl font-semibold">5. Data Security</h2>
              <p>
                We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access, disclosure, alteration, and destruction.
              </p>
            </section>
          </div>

          <div className="text-sm">
            <a href="#top" className="text-muted-foreground hover:underline">
              Back to top
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
