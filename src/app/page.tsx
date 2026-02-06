import Image from 'next/image';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getListings } from '@/lib/data';
import { TrustBadge } from '@/components/trust-badge';

export default async function ListingsPage() {
  const listings = await getListings();

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary md:text-5xl">
          Secure Your Piece of Kenya
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-foreground/80">
          Browse verified land listings with transparent trust signals.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {listings.map((listing) => (
          <Card
            key={listing.id}
            className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
          >
            <CardHeader className="relative p-0">
              <Link href={`/listings/${listing.id}`} className="block">
                <Image
                  src={listing.image}
                  alt={listing.title}
                  width={600}
                  height={400}
                  className="aspect-[3/2] w-full object-cover"
                  data-ai-hint={listing.imageHint}
                />
              </Link>
              <div className="absolute top-3 right-3">
                <TrustBadge status={listing.badge} />
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-4">
              <Link href={`/listings/${listing.id}`}>
                <CardTitle className="mb-2 text-xl font-medium tracking-tight hover:text-accent">
                  {listing.title}
                </CardTitle>
              </Link>
              <CardDescription className="text-base text-muted-foreground">
                {listing.location}
              </CardDescription>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex justify-between items-center">
              <p className="text-2xl font-semibold text-primary">
                Ksh {listing.price.toLocaleString()}
              </p>
              <Button asChild variant="outline">
                <Link href={`/listings/${listing.id}`}>View</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
