'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { Listing, BadgeStatus } from '@/lib/types';
import { updateListingBadge, getAiSummary, checkSuspiciousPatterns } from '@/app/actions';
import { Separator } from '@/components/ui/separator';
import { Bot, Sparkles, AlertTriangle, FileText, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const badgeOptions: { value: BadgeStatus; label: string }[] = [
  { value: 'TrustedSignal', label: 'Trusted Signal' },
  { value: 'EvidenceReviewed', label: 'Evidence Reviewed' },
  { value: 'EvidenceSubmitted', label: 'Evidence Submitted' },
  { value: 'Suspicious', label: 'Suspicious' },
  { value: 'None', label: 'None' },
];

export function AdminActions({ listing }: { listing: Listing }) {
  const [currentBadge, setCurrentBadge] = useState<BadgeStatus>(listing.badge);
  const [isSaving, setIsSaving] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [summaries, setSummaries] = useState<Record<string, string>>(
    listing.evidence.reduce((acc, doc) => {
        if(doc.summary) {
            acc[doc.id] = doc.summary;
        }
        return acc;
    }, {} as Record<string, string>)
  );
  const [suspicionResult, setSuspicionResult] = useState<{ isSuspicious: boolean; reason: string } | null>(null);
  const { toast } = useToast();

  const handleSaveBadge = async () => {
    setIsSaving(true);
    try {
      await updateListingBadge(listing.id, currentBadge);
      toast({
        title: 'Success',
        description: 'Trust badge has been updated.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update badge.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSummarize = async (docId: string, docContent: string) => {
    setIsSummarizing(docId);
    try {
      const result = await getAiSummary(docContent);
      setSummaries(prev => ({...prev, [docId]: result.summary}));
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'AI Error',
        description: 'Failed to generate summary.',
      });
    } finally {
        setIsSummarizing(null);
    }
  }

  const handleSuspicionCheck = async () => {
    setIsChecking(true);
    setSuspicionResult(null);
    try {
        const descriptions = listing.evidence.map(e => e.content);
        if (descriptions.length === 0) {
            toast({ variant: 'destructive', title: 'Error', description: 'No evidence to check.' });
            return;
        }
        const result = await checkSuspiciousPatterns(descriptions);
        setSuspicionResult({ isSuspicious: result.isSuspicious, reason: result.reason || 'No specific reason provided.' });

    } catch(error) {
        toast({
            variant: 'destructive',
            title: 'AI Error',
            description: 'Failed to run suspicion check.',
        });
    } finally {
        setIsChecking(false);
    }
  }


  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Manage Trust Badge</CardTitle>
          <CardDescription>Assign a trust signal to this listing.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup value={currentBadge} onValueChange={(value: BadgeStatus) => setCurrentBadge(value)}>
            {badgeOptions.map(({ value, label }) => (
              <div key={value} className="flex items-center space-x-2">
                <RadioGroupItem value={value} id={`badge-${value}`} />
                <Label htmlFor={`badge-${value}`}>{label}</Label>
              </div>
            ))}
          </RadioGroup>
          <Button onClick={handleSaveBadge} disabled={isSaving || currentBadge === listing.badge}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Badge
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot /> AI Assistant Tools
          </CardTitle>
          <CardDescription>Use GenAI to accelerate your review process.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2"><Sparkles className="text-accent h-4 w-4"/>Evidence Summarization</h4>
            {listing.evidence.length > 0 ? (
                <div className="space-y-3">
                {listing.evidence.map(doc => (
                    <div key={doc.id}>
                        <div className="flex items-center gap-2 mb-2">
                            <FileText className="h-4 w-4 flex-shrink-0" />
                            <p className="text-sm font-medium truncate flex-1">{doc.name}</p>
                             <Button size="sm" variant="outline" onClick={() => handleSummarize(doc.id, doc.content)} disabled={!!isSummarizing}>
                                {isSummarizing === doc.id ? <Loader2 className="h-4 w-4 animate-spin"/> : "Summarize"}
                            </Button>
                        </div>
                        {summaries[doc.id] && (
                             <div className="text-xs text-muted-foreground p-2 bg-secondary rounded-md ml-6">{summaries[doc.id]}</div>
                        )}
                    </div>
                ))}
                </div>
            ) : <p className="text-sm text-muted-foreground">No evidence to summarize.</p>}
          </div>
          <Separator />
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2"><AlertTriangle className="text-warning h-4 w-4"/>Suspicious Pattern Detection</h4>
            <Button className="w-full" onClick={handleSuspicionCheck} disabled={isChecking}>
                {isChecking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Check for Suspicious Patterns"}
            </Button>
             {suspicionResult && (
                <div className={`mt-4 p-3 rounded-md border ${suspicionResult.isSuspicious ? 'border-destructive/50 bg-destructive/10' : 'border-success/50 bg-success/10'}`}>
                    <p className={`font-bold ${suspicionResult.isSuspicious ? 'text-destructive' : 'text-success'}`}>
                        {suspicionResult.isSuspicious ? 'Result: Suspicious' : 'Result: Not Suspicious'}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">{suspicionResult.reason}</p>
                </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
