'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { Listing } from '@/lib/types';
import { getAiSummary, checkSuspiciousPatterns } from '@/app/actions';
import {
  Bot,
  Sparkles,
  AlertTriangle,
  FileText,
  Loader2,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import { TrustBadge } from '@/components/trust-badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export function AiTools({ listing }: { listing: Listing }) {
  const [isSummarizing, setIsSummarizing] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [summaries, setSummaries] = useState<Record<string, string>>(
    listing.evidence.reduce((acc, doc) => {
      if (doc.summary) {
        acc[doc.id] = doc.summary;
      }
      return acc;
    }, {} as Record<string, string>)
  );
  const [suspicionResult, setSuspicionResult] = useState<{
    isSuspicious: boolean;
    reason?: string;
  } | null>(null);
  const { toast } = useToast();

  const handleSummarize = useCallback(async (docId: string, docContent: string, isManual = false) => {
    setIsSummarizing(docId);
    try {
      const result = await getAiSummary(docContent, docId);
      setSummaries((prev) => ({ ...prev, [docId]: result.summary }));
      if (isManual) {
        toast({ title: 'AI Insight Refreshed', description: 'Updated summary is now active.' });
      }
    } catch (error) {
      if (isManual) {
        toast({
          variant: 'destructive',
          title: 'AI Insight Failed',
          description: error instanceof Error ? error.message : 'Could not process document.',
        });
      }
    } finally {
      setIsSummarizing(null);
    }
  }, [toast]);

  // Automatic background summarization for documents that don't have a summary
  useEffect(() => {
    const summarizeNext = async () => {
      const nextDoc = listing.evidence.find(d => !summaries[d.id] && d.content && d.content.length > 20);
      if (nextDoc && !isSummarizing) {
        await handleSummarize(nextDoc.id, nextDoc.content, false);
      }
    };
    void summarizeNext();
  }, [listing.evidence, summaries, isSummarizing, handleSummarize]);

  const handleSuspicionCheck = async () => {
    setIsChecking(true);
    setSuspicionResult(null);
    try {
      const descriptions = listing.evidence.map((e) => e.content).filter(Boolean);
      if (descriptions.length === 0) {
        toast({
          variant: 'destructive',
          title: 'No Content Found',
          description: 'Upload evidence with text content first.',
        });
        setIsChecking(false);
        return;
      }
      const result = await checkSuspiciousPatterns(descriptions);
      setSuspicionResult({
        isSuspicious: result.isSuspicious,
        reason: result.reason || 'Deep analysis complete. No high-risk anomalies detected across current documentation.',
      });
    } catch {
      toast({
        variant: 'destructive',
        title: 'Deep Analysis Error',
        description: 'Fraud detection engine encountered a network error. Retry when ready.',
      });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <Card className="border-accent/20 bg-accent/5 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-black tracking-tight">
            <Bot className="h-5 w-5 text-accent" /> TRUST ENGINE
          </CardTitle>
          <div className="flex h-6 items-center gap-1.5 rounded-full bg-accent/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-accent border border-accent/20">
            {isChecking || isSummarizing ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                Thinking
              </>
            ) : (
              <>
                <CheckCircle2 className="h-3 w-3" />
                Live
              </>
            )}
          </div>
        </div>
        <CardDescription className="text-xs font-medium">
          GenAI-powered verification assistance and cross-document risk analysis.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Accordion
          type="multiple"
          defaultValue={['insights']}
          className="w-full"
        >
          {(listing.badgeSuggestion || listing.imageAnalysis?.isSuspicious || listing.aiRiskScore > 0) && (
            <AccordionItem value="insights" className="border-accent/10">
              <AccordionTrigger className="text-xs font-black uppercase tracking-widest text-accent hover:no-underline">
                High-Level Risk Pulse
              </AccordionTrigger>
              <AccordionContent className="pt-2 space-y-4">
                <div className="rounded-lg border border-accent/20 bg-background/50 p-3 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Composite Risk Confidence</span>
                    <span className={cn(
                      "text-xs font-black",
                      listing.aiRiskScore >= 70 ? "text-risk" : listing.aiRiskScore >= 30 ? "text-warning" : "text-success"
                    )}>
                      {listing.aiRiskScore}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div 
                      className={cn(
                        "h-full transition-all duration-1000",
                        listing.aiRiskScore >= 70 ? "bg-risk" : listing.aiRiskScore >= 30 ? "bg-warning" : "bg-success"
                      )} 
                      style={{ width: `${listing.aiRiskScore}%` }} 
                    />
                  </div>
                </div>

                {listing.badgeSuggestion && (
                  <div className="space-y-2">
                    <h4 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      <Sparkles className="h-3.5 w-3.5 text-accent" />
                      Suggested Tier
                    </h4>
                    <div className="rounded-lg border bg-background/80 p-3 shadow-sm transition-all hover:border-accent/30">
                      <TrustBadge badge={listing.badgeSuggestion.badge} showTooltip={false} className="mb-2 h-5" />
                      <p className="text-xs text-muted-foreground leading-relaxed italic">
                        &quot;{listing.badgeSuggestion.reason}&quot;
                      </p>
                    </div>
                  </div>
                )}

                {listing.imageAnalysis?.isSuspicious && (
                  <div className="rounded-lg border border-risk/20 bg-risk-light p-3 shadow-sm">
                    <div className="flex items-center gap-2 mb-1.5">
                      <AlertTriangle className="h-4 w-4 text-risk" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-risk">Visual Anomaly Detected</span>
                    </div>
                    <p className="text-xs font-medium text-risk/90 leading-relaxed">
                      {listing.imageAnalysis.reason}
                    </p>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          )}

          <AccordionItem value="documents" className="border-accent/10">
            <AccordionTrigger className="text-xs font-black uppercase tracking-widest text-accent hover:no-underline">
              Granular Document Insights
            </AccordionTrigger>
            <AccordionContent className="pt-2">
              {listing.evidence.length > 0 ? (
                <div className="space-y-4">
                  {listing.evidence.map((doc) => (
                    <div key={doc.id} className="space-y-2 group/doc">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                          <span className="truncate text-[11px] font-bold text-foreground/80 uppercase tracking-tight" title={doc.name}>
                            {doc.name}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 hover:bg-accent/10"
                          onClick={() => handleSummarize(doc.id, doc.content, true)}
                          disabled={isSummarizing === doc.id}
                          title="Regenerate summary"
                        >
                          <RefreshCw className={cn("h-3.5 w-3.5 text-accent", isSummarizing === doc.id && "animate-spin")} />
                        </Button>
                      </div>
                      
                      {isSummarizing === doc.id ? (
                        <div className="space-y-1.5 pl-5">
                          <Skeleton className="h-3 w-full" />
                          <Skeleton className="h-3 w-4/5" />
                        </div>
                      ) : summaries[doc.id] ? (
                        <div className="ml-5 rounded-md border border-accent/10 bg-background/40 p-2.5 shadow-inner animate-in fade-in duration-500">
                          <p className="text-[11px] leading-relaxed text-muted-foreground font-medium">
                            {summaries[doc.id]}
                          </p>
                        </div>
                      ) : (
                        <div className="ml-5 py-1 flex items-center gap-2 text-risk/60">
                          <AlertTriangle className="h-3 w-3" />
                          <p className="text-[10px] italic font-medium">AI analysis currently unavailable.</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-2 text-[11px] text-muted-foreground italic">
                  No evidence vaulted for deep inspection.
                </p>
              )}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="fraud" className="border-none">
            <AccordionTrigger className="text-xs font-black uppercase tracking-widest text-accent hover:no-underline">
              Deep Multi-Document Analysis
            </AccordionTrigger>
            <AccordionContent className="pt-2">
              <p className="text-[10px] text-muted-foreground font-medium mb-4 leading-relaxed">
                Scan all evidence simultaneously to identify hidden contradictions, PIN mismatches, or altered stamps across files.
              </p>
              <Button
                className="w-full h-10 bg-accent text-white font-bold text-xs uppercase tracking-widest shadow-md hover:shadow-lg transition-all"
                onClick={handleSuspicionCheck}
                disabled={isChecking || listing.evidence.length === 0}
              >
                {isChecking ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  'Transmit Deep Scanner Pulse'
                )}
              </Button>
              {suspicionResult && (
                <div
                  className={cn(
                    "mt-4 rounded-lg border p-3 animate-in slide-in-from-top-2 duration-300",
                    suspicionResult.isSuspicious
                      ? 'border-risk/30 bg-risk-light shadow-risk/10'
                      : 'border-success/30 bg-success/5 shadow-success/10'
                  )}
                >
                  <p
                    className={cn(
                      "text-[10px] font-black uppercase tracking-widest mb-1.5",
                      suspicionResult.isSuspicious ? 'text-risk' : 'text-success'
                    )}
                  >
                    Result: {suspicionResult.isSuspicious ? 'Suspicious Correlation' : 'Verification Clear'}
                  </p>
                  <p className="text-xs font-medium text-foreground/80 leading-relaxed">
                    {suspicionResult.reason}
                  </p>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
