import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto max-w-4xl py-10 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Terms of Service</CardTitle>
          <p className="text-sm text-muted-foreground">Last updated: 2026-02-10</p>
          <p className="text-sm text-muted-foreground">
            Summary: You are responsible for lawful platform use and listing accuracy, and AI outputs are advisory rather than legal guarantees.
          </p>
        </CardHeader>
        <CardContent className="prose prose-stone dark:prose-invert max-w-none space-y-6">
          <nav aria-label="Terms of service table of contents" className="not-prose rounded-md border bg-muted/30 p-4">
            <p className="text-sm font-semibold mb-2">On this page</p>
            <ul className="space-y-1 text-sm">
              <li><a href="#introduction" className="hover:underline">1. Introduction</a></li>
              <li><a href="#user-responsibilities" className="hover:underline">2. User Responsibilities</a></li>
              <li><a href="#disclaimers-limitation" className="hover:underline">3. Disclaimers and Limitation of Liability</a></li>
              <li><a href="#ai-tools" className="hover:underline">4. Use of AI-Assisted Tools</a></li>
              <li><a href="#governing-law" className="hover:underline">5. Governing Law</a></li>
            </ul>
          </nav>

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
        </CardContent>
      </Card>
    </div>
  );
}
