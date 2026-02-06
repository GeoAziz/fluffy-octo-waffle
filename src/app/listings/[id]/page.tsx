import { notFound, redirect } from 'next/navigation';
import Image from 'next/image';
import { getListingById } from '@/lib/data';
import { StatusBadge } from '@/components/status-badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  FileText,
  ShieldCheck,
  ShieldAlert,
  ShieldQuestion,
  EyeOff,
} from 'lucide-react';
import { cookies } from 'next/headers';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import type { UserProfile } from '@/lib/types';


async function getAuthenticatedUser(): Promise<{uid: string, role: UserProfile['role']} | null> {
    const sessionCookie = cookies().get('__session')?.value;
    if (!sessionCookie) return null;

    try {
        const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
        const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
        if (!userDoc.exists) return null;
        
        const userProfile = userDoc.data() as UserProfile;
        return { uid: decodedToken.uid, role: userProfile.role };
    } catch(e) {
        return null;
    }
}


export default async function ListingDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const listing = await getListingById(params.id);
  const user = await getAuthenticatedUser();

  if (!listing) {
    notFound();
  }

  // Security check: Only show approved listings to the public.
  // The owner and admins can see listings in any state.
  const isOwner = user?.uid === listing.ownerId;
  const isAdmin = user?.role === 'ADMIN';

  if (listing.status !== 'approved' && !isOwner && !isAdmin) {
    return (
        <div className="container mx-auto max-w-7xl px-4 py-8 md:py-12">
            <div className="flex flex-col items-center justify-center text-center py-20">
                <EyeOff className="h-24 w-24 text-muted-foreground" />
                <h1 className="mt-8 text-3xl font-bold">Listing Not Available</h1>
                <p className="mt-4 text-lg text-muted-foreground">
                    This listing is currently under review or is otherwise unavailable.
                </p>
            </div>
        </div>
    )
  }

  const {
    title,
    location,
    price,
    description,
    image,
    imageHint,
    status,
    seller,
    evidence,
  } = listing;

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 md:py-12">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2">
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
                <StatusBadge status={status} className="text-base px-4 py-2" />
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
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Context Sidebar */}
        <div className="space-y-6 md:sticky md:top-24 h-min">
          <Card>
            <CardHeader>
              <CardTitle>Uploaded Evidence</CardTitle>
            </CardHeader>
            <CardContent>
              {evidence.length > 0 ? (
                <ul className="space-y-3">
                  {evidence.map((doc) => (
                    <li key={doc.id} className="flex items-center gap-3">
                      <FileText className="h-5 w-5 flex-shrink-0 text-accent" />
                      <span className="text-sm font-medium text-foreground/90 truncate" title={doc.name}>{doc.name}</span>
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
