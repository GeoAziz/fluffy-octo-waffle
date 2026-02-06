import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function ReportListingPage() {
  return (
    <div className="container mx-auto max-w-2xl py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Report a Listing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            If you believe a listing is fraudulent, misleading, or violates our terms, please let us know. Provide the Listing ID and a reason for your report.
          </p>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="listingId">Listing ID or URL</Label>
              <Input id="listingId" placeholder="e.g., fpx7qY2v..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Report</Label>
              <Textarea id="reason" placeholder="Describe why you are reporting this listing..." className="min-h-[120px]" />
            </div>
          </div>
          <Button variant="destructive">Submit Report</Button>
        </CardContent>
      </Card>
    </div>
  );
}
