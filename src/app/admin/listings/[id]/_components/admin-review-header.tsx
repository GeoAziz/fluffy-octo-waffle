'use client';

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { BadgeValue, Listing, ListingStatus } from '@/lib/types';
import { deleteListing, escalateListingAction, updateListing } from '@/app/actions';
import { Loader2, Trash2, ShieldCheck, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { TrustBadge } from '@/components/trust-badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const statusOptions: { value: ListingStatus; label: string }[] = [
  { value: 'approved', label: 'Approve' },
  { value: 'pending', label: 'Pending' },
  { value: 'rejected', label: 'Reject' },
];

const badgeOptions: BadgeValue[] = ['TrustedSignal', 'EvidenceReviewed', 'EvidenceSubmitted', 'Suspicious', 'None'];

const REASON_TEMPLATES = [
  "Title deed verified with Land Registry (Ref: #123). Image metadata matches location.",
  "EvidenceReviewed assigned: Ownership confirmed, but survey map requires updated beacons.",
  "Rejected: Documentation mismatch. PIN provided does not correspond to the listed owner.",
  "Rejected: Low-quality asset scans. Please provide high-resolution PDF proof.",
  "TrustedSignal: All 4 key documents vaulted and verified authentic."
];

const ESCALATION_OPTIONS = [
  { value: 'flag', label: 'Flag Listing' },
  { value: 'request_more_evidence', label: 'Request More Evidence' },
  { value: 'lock_seller', label: 'Lock Seller Account' },
] as const;

/**
 * AdminReviewActions - Critical moderation interface for updating trust signals.
 * Now requires mandatory reasoning and provides templates for velocity.
 */
export function AdminReviewActions({ listing }: { listing: Listing }) {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStatus, setCurrentStatus] = useState<ListingStatus>(
    listing.status
  );
  const [currentBadge, setCurrentBadge] = useState<BadgeValue | null>(
    listing.badge
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const [adminReason, setAdminReason] = useState(listing.adminNotes || '');
  const [isEscalating, setIsEscalating] = useState(false);
  
  // Track if badge was just assigned for animation
  const [badgeJustIssued, setBadgeJustIssued] = useState(false);

  const isChanged = currentStatus !== listing.status || currentBadge !== listing.badge;
  const isBadgeChange = currentBadge !== listing.badge;

  const handleSave = async () => {
    if (!adminReason.trim()) {
      toast({
        variant: 'destructive',
        title: 'Reason Required',
        description: 'Please provide a reason for the change in the review notes.',
      });
      return;
    }

    setIsSaving(true);
    try {
      await updateListing(listing.id, {
        status: currentStatus,
        badge: currentBadge || 'None',
        adminNotes: adminReason,
        rejectionReason: currentStatus === 'rejected' ? adminReason : null,
      });
      
      if (isBadgeChange && currentBadge !== 'None') {
        setBadgeJustIssued(true);
        setTimeout(() => setBadgeJustIssued(false), 2000);
      }

      toast({
        title: 'Review Updated',
        description: `Listing status: ${currentStatus}, Badge: ${currentBadge}`,
      });
      router.refresh();
      setConfirmOpen(false);
    } catch {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Failed to update review details. Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteListing(listing.id);
      toast({
        title: 'Listing Removed',
        description: 'Property listing and evidence deleted permanently.',
      });
      router.push('/admin/listings');
    } catch {
      toast({
        variant: 'destructive',
        title: 'Deletion Failed',
        description: 'Could not remove the listing.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEscalation = async (escalation: (typeof ESCALATION_OPTIONS)[number]['value']) => {
    if (!adminReason.trim()) {
      toast({
        variant: 'destructive',
        title: 'Reason Required',
        description: 'Add escalation notes before executing this workflow.',
      });
      return;
    }

    setIsEscalating(true);
    try {
      await escalateListingAction(listing.id, escalation, adminReason);
      toast({
        title: 'Escalation Executed',
        description: `Workflow updated: ${escalation.replaceAll('_', ' ')}`,
      });
      router.refresh();
    } catch {
      toast({
        variant: 'destructive',
        title: 'Escalation Failed',
        description: 'Unable to apply escalation workflow. Please retry.',
      });
    } finally {
      setIsEscalating(false);
    }
  };

  return (
    <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
      {badgeJustIssued && (
        <div className="flex items-center gap-2 text-success font-bold text-[10px] uppercase tracking-widest animate-in fade-in slide-in-from-right-4 duration-300">
          <ShieldCheck className="h-4 w-4" />
          Signal Updated
        </div>
      )}

      <div className="flex items-center gap-2 rounded-lg bg-background border p-1 shadow-sm">
        <Select
          value={currentStatus}
          onValueChange={(v: ListingStatus) => setCurrentStatus(v)}
        >
          <SelectTrigger className="w-[110px] h-9 border-none bg-transparent focus:ring-0" aria-label="Set listing status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map(({ value, label }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="w-px h-6 bg-border mx-1" />

        <Select
          value={currentBadge || 'None'}
          onValueChange={(v: BadgeValue) => setCurrentBadge(v)}
        >
          <SelectTrigger className="w-[160px] h-9 border-none bg-transparent focus:ring-0" aria-label="Assign trust badge">
            <SelectValue placeholder="Trust Badge" />
          </SelectTrigger>
          <SelectContent>
            {badgeOptions.map((badge) => (
              <SelectItem key={badge} value={badge}>
                <div className="flex items-center gap-2">
                  <TrustBadge badge={badge} showTooltip={false} className="h-5" />
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <AlertDialog open={isConfirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogTrigger asChild>
          <Button
            disabled={isSaving || !isChanged}
            variant={isChanged ? "accent" : "outline"}
            className={cn("min-w-[120px] font-bold h-11 transition-all", isChanged && "animate-pulse")}
          >
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isBadgeChange ? 'Assign Signal' : 'Update Review'}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-accent" />
              Confirm High-Stakes Action
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4 pt-2">
              <p className="text-sm">You are about to modify the trust signal for this listing. This impacts buyer confidence and search visibility.</p>
              
              <div className="space-y-2">
                <Label htmlFor="review-reason" className="text-foreground font-bold text-xs uppercase tracking-wider">
                  Review Notes & Reason (Mandatory)
                </Label>
                <Textarea
                  id="review-reason"
                  placeholder="Summarize your verification findings..."
                  value={adminReason}
                  onChange={(e) => setAdminReason(e.target.value)}
                  className="min-h-[100px] text-sm bg-muted/20"
                />
                <p className="text-[10px] text-muted-foreground italic">
                  * This reason will be logged in the audit trail and shared with the seller.
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Standard Templates</Label>
                <div className="flex flex-wrap gap-1.5">
                  {REASON_TEMPLATES.map((tmpl, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setAdminReason(tmpl)}
                      className="text-[9px] font-bold px-2 py-1 bg-muted rounded border hover:bg-accent/10 hover:border-accent/30 transition-all truncate max-w-[180px]"
                    >
                      {tmpl}
                    </button>
                  ))}
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setAdminReason(listing.adminNotes || '')}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleSave} 
              disabled={!adminReason.trim() || isSaving}
              className="bg-accent text-white hover:bg-accent/90"
            >
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Commit Review Pulse'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            disabled={isDeleting}
            className="h-11 w-11 text-risk hover:bg-risk-light hover:text-risk transition-colors"
            aria-label="Delete listing"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-risk flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Irreversible Deletion
            </AlertDialogTitle>
            <AlertDialogDescription>
              This listing and all associated verification documents will be purged from the registry. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-risk text-white hover:bg-risk/90">
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Execute Permanent Deletion'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex items-center gap-2 rounded-lg border bg-background p-1">
        {ESCALATION_OPTIONS.map((option) => (
          <Button
            key={option.value}
            size="sm"
            variant="outline"
            disabled={isEscalating}
            className="h-9 text-[10px] font-black uppercase tracking-widest"
            onClick={() => handleEscalation(option.value)}
          >
            {isEscalating ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : null}
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
