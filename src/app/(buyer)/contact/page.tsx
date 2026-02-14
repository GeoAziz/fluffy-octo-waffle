'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

type Topic = 'general' | 'technical' | 'listing' | 'verification';

type FieldErrors = {
  name?: string;
  email?: string;
  message?: string;
};

export default function ContactUsPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmationId, setConfirmationId] = useState<string | null>(null);
  const [expectedResponseHours, setExpectedResponseHours] = useState(24);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    topic: 'general' as Topic,
    message: '',
  });

  const validate = () => {
    const errors: FieldErrors = {};

    if (!formState.name.trim()) {
      errors.name = 'Name is required.';
    }

    const email = formState.email.trim();
    if (!email) {
      errors.email = 'Email is required.';
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      errors.email = 'Enter a valid email address.';
    }

    if (!formState.message.trim()) {
      errors.message = 'Message is required.';
    } else if (formState.message.trim().length < 10) {
      errors.message = 'Message should be at least 10 characters.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) {
      toast({
        variant: 'destructive',
        title: 'Please review highlighted fields',
        description: 'Fix the form errors and submit again.',
      });
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formState,
          name: formState.name.trim(),
          email: formState.email.trim(),
          message: formState.message.trim(),
        }),
      });

      const payload = await response.json().catch(() => ({ message: 'Failed to submit message.' }));

      if (!response.ok) {
        throw new Error(payload.message || 'Failed to submit message.');
      }

      const nextResponseHours = typeof payload.expectedResponseHours === 'number' ? payload.expectedResponseHours : 24;

      toast({
        title: 'Message sent',
        description: `Thanks for reaching out. We typically respond within ${nextResponseHours} hours.`,
      });
      setSubmitted(true);
      setConfirmationId(typeof payload.messageId === 'string' ? payload.messageId : null);
      setExpectedResponseHours(nextResponseHours);
      setFieldErrors({});
      setFormState({ name: '', email: '', topic: 'general', message: '' });
    } catch (error) {
      const details = error instanceof Error ? error.message : 'Unable to submit your message.';
      setSubmitted(false);
      setErrorMessage(details);
      toast({
        variant: 'destructive',
        title: 'Submission failed',
        description: details,
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
            <div aria-live="polite" className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-900 flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 mt-0.5" />
              <div>
                <p className="font-semibold">Message received</p>
                <p>
                  We have your request and sent a confirmation email. Typical response time is within {expectedResponseHours} hours.
                  {confirmationId ? ` Reference ID: ${confirmationId}.` : ''}
                </p>
              </div>
            </div>
          )}

          {errorMessage && (
            <div aria-live="assertive" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900 flex items-start gap-2">
              <AlertCircle className="h-5 w-5 mt-0.5" />
              <div>
                <p className="font-semibold">We couldn't send your message yet</p>
                <p>{errorMessage} Please retry in a moment. If this continues, email support@kenyalandtrust.com.</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                required
                aria-invalid={Boolean(fieldErrors.name)}
                placeholder="John Doe"
                value={formState.name}
                onChange={(event) => {
                  setSubmitted(false);
                  setErrorMessage('');
                  setConfirmationId(null);
                  setFormState((prev) => ({ ...prev, name: event.target.value }));
                  setFieldErrors((prev) => ({ ...prev, name: undefined }));
                }}
              />
              {fieldErrors.name && <p className="text-sm text-destructive">{fieldErrors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Your Email</Label>
              <Input
                id="email"
                type="email"
                required
                aria-invalid={Boolean(fieldErrors.email)}
                placeholder="you@example.com"
                value={formState.email}
                onChange={(event) => {
                  setSubmitted(false);
                  setErrorMessage('');
                  setConfirmationId(null);
                  setFormState((prev) => ({ ...prev, email: event.target.value }));
                  setFieldErrors((prev) => ({ ...prev, email: undefined }));
                }}
              />
              {fieldErrors.email && <p className="text-sm text-destructive">{fieldErrors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="topic">Topic</Label>
              <Select
                value={formState.topic}
                onValueChange={(value: Topic) => {
                  setSubmitted(false);
                  setErrorMessage('');
                  setConfirmationId(null);
                  setFormState((prev) => ({ ...prev, topic: value }));
                }}
              >
                <SelectTrigger id="topic">
                  <SelectValue placeholder="Select a topic" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General question</SelectItem>
                  <SelectItem value="technical">Technical issue</SelectItem>
                  <SelectItem value="listing">Listing issue</SelectItem>
                  <SelectItem value="verification">Trust question</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Choose a topic so your message is routed to the right support team faster.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                required
                aria-invalid={Boolean(fieldErrors.message)}
                placeholder="Tell us what you need help with..."
                className="min-h-[120px]"
                value={formState.message}
                onChange={(event) => {
                  setSubmitted(false);
                  setErrorMessage('');
                  setConfirmationId(null);
                  setFormState((prev) => ({ ...prev, message: event.target.value }));
                  setFieldErrors((prev) => ({ ...prev, message: undefined }));
                }}
              />
              {fieldErrors.message && <p className="text-sm text-destructive">{fieldErrors.message}</p>}
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
