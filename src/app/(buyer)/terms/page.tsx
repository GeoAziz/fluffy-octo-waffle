import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const LAST_UPDATED = '2026-02-10';

const sections = [
  { id: 'introduction', title: 'Introduction' },
  { id: 'user-responsibilities', title: 'User Responsibilities' },
  { id: 'disclaimers-limitation', title: 'Disclaimers and Limitation of Liability' },
  { id: 'ai-tools', title: 'Use of AI-Assisted Tools' },
  { id: 'governing-law', title: 'Governing Law' },
] as const;

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto max-w-5xl py-10 px-4" id="top">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Terms of Service</CardTitle>
          <p className="text-sm text-muted-foreground">
            Last updated:{' '}
            <time dateTime={LAST_UPDATED} className="font-medium text-foreground">
              {LAST_UPDATED}
            </time>
          </p>
          <div className="rounded-md border bg-muted/30 p-4 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground mb-2">Plain-language summary</p>
            <ul className="list-disc ml-5 space-y-1">
              <li>You are responsible for lawful use and truthful listing information.</li>
              <li>The platform is provided “as-is” without title guarantees.</li>
              <li>Verification badges indicate documentation confidence, not legal certainty.</li>
              <li>AI outputs are advisory and must not replace professional advice.</li>
            </ul>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <nav aria-label="Terms of service table of contents" className="rounded-md border bg-muted/30 p-4">
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
            <section id="introduction">
              <h2 className="text-xl font-semibold">1. Introduction</h2>
              <p>
                Welcome to Kenya Land Trust. These are the terms and conditions governing your access to and use of the website Kenya Land Trust and its related sub-domains, sites, services, and tools. By using the Site, you hereby accept these terms and conditions and represent that you agree to comply with these terms and conditions.
              </p>
            </section>
            <section id="user-responsibilities">
              <h2 className="text-xl font-semibold">2. User Responsibilities</h2>
              <p>
                You are responsible for your use of the service and for any content you provide, including compliance with applicable laws, rules, and regulations. You should only provide content that you are comfortable sharing with others. Sellers are responsible for the accuracy and legality of the information and documents they upload for their listings.
              </p>
            </section>
            <section id="disclaimers-limitation">
              <h2 className="text-xl font-semibold">3. Disclaimers and Limitation of Liability</h2>
              <p>
                The services are provided "as-is." Kenya Land Trust makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties. While we provide a verification and approval process, this does not constitute a legal guarantee of title or the authenticity of a listing. Buyers are strongly advised to conduct their own independent due diligence before entering into any transaction.
              </p>
            </section>
            <section id="ai-tools">
              <h2 className="text-xl font-semibold">4. Use of AI-Assisted Tools</h2>
              <p>
                We use AI-assisted tools to summarize documents, suggest trust badges, and detect suspicious patterns. These tools provide advisory insights and may contain errors. Final review decisions may still include human judgment, and you should not treat AI outputs as legal or professional advice.
              </p>
            </section>
            <section id="governing-law">
              <h2 className="text-xl font-semibold">5. Governing Law</h2>
              <p>
                These Terms and Conditions shall be governed by and construed in accordance with the laws of the Republic of Kenya.
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
