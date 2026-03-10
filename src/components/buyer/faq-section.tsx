'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: "What exactly are Trust Badges?",
    answer: "Trust Badges (Gold, Silver, Bronze) are visual signals that represent the completeness and verification status of a listing's documentation. A Gold badge means the seller has provided a verified Title Deed, Survey Map, and Identity Proof which have been cross-checked by our team."
  },
  {
    question: "Does a 'Gold' badge guarantee legal title?",
    answer: "No. While we perform administrative reviews of the documents provided, our verification is not a legal guarantee. We strongly advise every buyer to engage a registered surveyor and a qualified lawyer to perform independent due diligence before making any payment."
  },
  {
    question: "How do I contact a seller?",
    answer: "You can contact a seller directly through our secure messaging system. Simply click 'Contact Seller' on any listing page. We keep a record of all conversations to ensure community safety and platform trust."
  },
  {
    question: "What should I do if I find a suspicious listing?",
    answer: "We take community safety seriously. If you spot a listing that looks fraudulent or has conflicting information, use the 'Report Listing' button. Our trust team will investigate and, if necessary, flag the listing as 'Suspicious' or remove it entirely."
  },
  {
    question: "How long does the verification process take?",
    answer: "Once a seller uploads their evidence, our team typically completes the review within 24-48 business hours. During this time, the listing status will remain 'Pending'."
  }
];

export function FaqSection() {
  return (
    <section className="bg-background py-24 md:py-32">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-black uppercase tracking-tighter md:text-5xl">Common Questions</h2>
          <p className="mt-4 text-muted-foreground">Everything you need to know about transacting on Kenya Land Trust.</p>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="rounded-2xl border bg-muted/20 px-6 overflow-hidden transition-all hover:bg-muted/30">
              <AccordionTrigger className="text-left font-black uppercase tracking-tight hover:no-underline py-6">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="pb-6 text-base text-muted-foreground leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}