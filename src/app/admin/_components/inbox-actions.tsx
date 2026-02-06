'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { markContactMessageStatus, markListingReportStatus } from '@/app/actions';
import { CheckCircle, Loader2, Mail, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function ContactMessageActions({ messageId, currentStatus }: { messageId: string, currentStatus: string }) {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const router = useRouter();

    const handleUpdateStatus = () => {
        startTransition(async () => {
            try {
                const newStatus = currentStatus === 'new' ? 'handled' : 'new';
                await markContactMessageStatus(messageId, newStatus);
                toast({
                    title: 'Success',
                    description: `Message marked as ${newStatus}.`,
                });
                router.refresh(); // Re-fetches server-side data
            } catch (error) {
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: 'Failed to update message status.',
                });
            }
        });
    };
    
    const isHandled = currentStatus === 'handled';

    return (
        <>
            <Button size="sm" variant="outline" disabled>
                <Mail className="mr-2 h-4 w-4"/> Reply
            </Button>
            <Button size="sm" variant="outline" onClick={handleUpdateStatus} disabled={isPending}>
                 {isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                 ) : isHandled ? (
                    <RotateCcw className="mr-2 h-4 w-4"/> 
                 ) : (
                    <CheckCircle className="mr-2 h-4 w-4"/>
                 )}
                 {isHandled ? 'Mark as New' : 'Mark Handled'}
            </Button>
        </>
    );
}

export function ListingReportActions({ reportId, currentStatus }: { reportId: string, currentStatus: string }) {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const router = useRouter();

    const handleUpdateStatus = () => {
        startTransition(async () => {
            try {
                const newStatus = currentStatus === 'new' ? 'handled' : 'new';
                await markListingReportStatus(reportId, newStatus);
                toast({
                    title: 'Success',
                    description: `Report marked as ${newStatus}.`,
                });
                router.refresh();
            } catch (error) {
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: 'Failed to update report status.',
                });
            }
        });
    };

    const isHandled = currentStatus === 'handled';

    return (
        <Button size="sm" variant="outline" onClick={handleUpdateStatus} disabled={isPending}>
            {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
            ) : isHandled ? (
                <RotateCcw className="mr-2 h-4 w-4"/>
            ) : (
                <CheckCircle className="mr-2 h-4 w-4"/>
            )}
            {isHandled ? 'Mark as New' : 'Mark Handled'}
        </Button>
    );
}
