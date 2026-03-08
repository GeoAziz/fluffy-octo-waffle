import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const ListingCardSkeleton = () => (
    <Card>
        <CardHeader className="p-0">
            <Skeleton className="aspect-[3/2] w-full" />
        </CardHeader>
        <CardContent className="p-4 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/3 mt-2" />
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between items-center">
            <Skeleton className="h-7 w-2/5" />
            <Skeleton className="h-9 w-16" />
        </CardFooter>
    </Card>
);
