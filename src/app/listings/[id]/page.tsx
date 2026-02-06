import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getListingById } from '@/lib/data';
import { TrustBadge } from '@/components/trust-badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  FileText,
  ShieldCheck,
  ShieldAlert,
  FileCheck,
  FileClock,
  HelpCircle,
} from 'lucide-react';
import type { BadgeStatus } from '@/lib/types';

const badgeInfo = {
  TrustedSignal: {
    icon: ShieldCheck,
    title: 'Trusted Signal',
    description:
      "Multiple pieces of evidence have been submitted and reviewed by our team, providing a strong signal of this listing's authenticity.",
    color: 'text-success',
  },
  EvidenceReviewed: {
    icon: FileCheck,
    title: 'Evidence Reviewed',
    description:
      'Our team has performed a basic review of the submitted documents. We recommend buyers conduct their own due diligence.',
    color: 'text-accent',
  },
  EvidenceSubmitted: {
    icon: FileClock,
    title: 'Evidence Submitted',
    description:
      'The seller has uploaded one or more documents for verification. Our team has not reviewed them yet.',
    color: 'text-warning',
  },
  Suspicious: {
    icon: ShieldAlert,
    title: 'Suspicious Activity',
    description:
      'Our system or team has flagged this listing for inconsistencies or potentially fraudulent patterns. Please proceed with extreme caution.',
    color: 'text-destructive',
  },
  None: {
    icon: HelpCircle,
    title: 'No Evidence',
    description:
      'The seller has not yet submitted any documentation for this listing. The absence of evidence is a risk factor to consider.',
    color: 'text-muted-foreground',
  },
};

function BadgeExplanation({ status }: { status: BadgeStatus }) {
  const info = badgeInfo[status];
  const Icon = info.icon;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Icon className={`h-8 w-8 ${info.color}`} />
          <div>
            <CardTitle className="text-xl">{info.title}</CardTitle>
            <CardDescription>Trust Badge Explanation</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{info.description}</p>
      </CardContent>
    </Card>
  );
}

export default async function ListingDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const listing = await getListingById(params.id);

  if (!listing) {
    notFound();
  }

  const {
    title,
    location,
    price,
    description,
    image,
    imageHint,
    badge,
    seller,
    evidence,
  } = listing;

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 md:py-12">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:grid-cols-4">
        {/* Main Content */}
        <div className="md:col-span-2 lg:col-span-3">
          <Card className="overflow-hidden">
            <CardHeader className="p-0">
              <Image
                src={image}
                alt={title}
                width={1200}
                height={800}
                className="aspect-video w-full object-cover"
                data-ai-hint={imageHint}
                priority
              />
            </CardHeader>
            <CardContent className="p-6">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-primary md:text-4xl">
                    {title}
                  </h1>
                  <p className="mt-1 text-lg text-muted-foreground">
                    {location}
                  </p>
                </div>
                <TrustBadge status={badge} className="text-base px-4 py-2" />
              </div>

              <p className="text-4xl font-semibold text-primary mb-6">
                Ksh {price.toLocaleString()}
              </p>

              <Separator className="my-6" />

              <h2 className="text-2xl font-semibold tracking-tight mb-4">
                About this property
              </h2>
              <div className="prose prose-stone max-w-none text-foreground/90">
                <p>{description}</p>
              </div>

              <Separator className="my-6" />

              <h2 className="text-2xl font-semibold tracking-tight mb-4">
                Listed by
              </h2>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={seller.avatarUrl} alt={seller.name} />
                  <AvatarFallback>
                    {seller.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-lg font-medium">{seller.name}</p>
                  <Badge variant="secondary">Verified Seller</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Context Sidebar */}
        <div className="space-y-6 md:sticky md:top-24 h-min">
          <BadgeExplanation status={badge} />
          
          <Card>
            <CardHeader>
              <CardTitle>Uploaded Evidence</CardTitle>
              <CardDescription>Documents provided by the seller.</CardDescription>
            </CardHeader>
            <CardContent>
              {evidence.length > 0 ? (
                <ul className="space-y-3">
                  {evidence.map((doc) => (
                    <li key={doc.id} className="flex items-center gap-3">
                      <FileText className="h-5 w-5 flex-shrink-0 text-accent" />
                      <span className="text-sm font-medium text-foreground/90 truncate">{doc.name}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No evidence has been uploaded for this listing yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
