'use client';

import { Button } from '@/components/ui/button';
import { getOrCreateConversation } from '@/app/actions';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2, MessageSquare, LogIn } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Mail } from 'lucide-react';

interface ContactSellerButtonProps {
    listingId: string;
    isAuthenticated?: boolean;
}

export function ContactSellerButton({ listingId, isAuthenticated = true }: ContactSellerButtonProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const handleContact = async () => {
        if (!isAuthenticated) {
            // Redirect to login with return URL
            router.push(`/login?redirect=/listings/${listingId}`);
            return;
        }

        setIsLoading(true);
        try {
            const { conversationId } = await getOrCreateConversation(listingId);
            router.push(`/buyer/messages/${conversationId}`);
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message || 'Could not start conversation.',
            });
            setIsLoading(false);
        }
    };

    const handleGuestInquiry = () => {
        router.push(`/contact?listingId=${listingId}`);
    };

    // For unauthenticated users, show dropdown with options
    if (!isAuthenticated) {
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button className="w-full font-semibold gap-2" variant="default">
                        Sign in to Contact Seller
                        <LogIn className="h-4 w-4" />
                        <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuItem onClick={handleContact}>
                        <LogIn className="h-4 w-4 mr-2" />
                        <span>Sign in to message seller</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleGuestInquiry}>
                        <Mail className="h-4 w-4 mr-2" />
                        <span>Send inquiry as guest</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        );
    }

    // For authenticated users, show primary action
    return (
        <Button 
            onClick={handleContact} 
            disabled={isLoading} 
            className="w-full font-semibold" 
            variant="default"
            title="Start messaging with seller"
        >
            {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <MessageSquare className="mr-2 h-4 w-4" />
            )}
            Contact Seller
        </Button>
    );
}
