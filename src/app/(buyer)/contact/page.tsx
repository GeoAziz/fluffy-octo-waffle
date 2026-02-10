'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2 } from 'lucide-react';

type Topic = 'general' | 'technical' | 'listing' | 'verification';

export default function ContactUsPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    topic: 'general' as Topic,
    message: '',
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formState.name || !formState.email || !formState.message) {
      toast({
        variant: 'destructive',
        title: 'Missing information',
        description: 'Please complete your name, email, and message.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to submit message.' }));
        throw new Error(error.message || 'Failed to submit message.');
      }

      toast({
        title: 'Message sent',
        description: 'Thanks for reaching out. We usually respond within 24 hours.',
      });
      setSubmitted(true);
      setFormState({ name: '', email: '', topic: 'general', message: '' });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Submission failed',
        description: error instanceof Error ? error.message : 'Unable to submit your message.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl py-10 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Contact Us</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            Have a question or need help? Fill out the form and our team will get back to you.
            <span className="font-medium text-foreground"> Typical response time: within 24 hours.</span>
          </p>

          {submitted && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-900 flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 mt-0.5" />
              <div>
                <p className="font-semibold">Message received</p>
                <p>
                  We have your request and sent a confirmation email. If urgent, include your listing ID and contact phone in a follow-up message.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={formState.name}
                onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Your Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formState.email}
                onChange={(event) => setFormState((prev) => ({ ...prev, email: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="topic">Topic</Label>
              <Select
                value={formState.topic}
                onValueChange={(value: Topic) => setFormState((prev) => ({ ...prev, topic: value }))}
              >
                <SelectTrigger id="topic">
                  <SelectValue placeholder="Select a topic" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General question</SelectItem>
                  <SelectItem value="technical">Technical issue</SelectItem>
                  <SelectItem value="listing">Listing issue</SelectItem>
                  <SelectItem value="verification">Trust & verification question</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Your message..."
                className="min-h-[120px]"
                value={formState.message}
                onChange={(event) => setFormState((prev) => ({ ...prev, message: event.target.value }))}
              />
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
