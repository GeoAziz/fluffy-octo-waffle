'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getOrCreateConversation } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, MessageSquare } from 'lucide-react';

export function InquiryForm({ listingId }: { listingId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleChange = (field: 'name' | 'email' | 'message', value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      const { conversationId } = await getOrCreateConversation(listingId);
      toast({
        variant: 'success',
        title: 'Inquiry started',
        description: 'We opened a chat so you can follow up with the seller.',
      });
      router.push(`/messages/${conversationId}`);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Unable to start inquiry',
        description: error?.message || 'Please try again.',
      });
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="inquiry-name">Full name</Label>
        <Input
          id="inquiry-name"
          placeholder="Your name"
          value={formState.name}
          onChange={(event) => handleChange('name', event.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="inquiry-email">Email</Label>
        <Input
          id="inquiry-email"
          type="email"
          placeholder="you@example.com"
          value={formState.email}
          onChange={(event) => handleChange('email', event.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="inquiry-message">Message</Label>
        <Textarea
          id="inquiry-message"
          placeholder="Ask about documentation, access, and site visit availability."
          className="min-h-[120px]"
          value={formState.message}
          onChange={(event) => handleChange('message', event.target.value)}
        />
      </div>
      <Button type="submit" className="w-full" variant="accent" disabled={isLoading}>
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MessageSquare className="mr-2 h-4 w-4" />}
        Send inquiry
      </Button>
      <p className="text-xs text-muted-foreground">
        We will open a secure chat with the seller so you can continue the conversation.
      </p>
    </form>
  );
}
