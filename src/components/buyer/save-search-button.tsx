'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Bookmark, Loader2, CheckCircle2 } from 'lucide-react';
import type { SavedSearch } from '@/lib/types';
import { saveSearchAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/providers';
import { useRouter } from 'next/navigation';
import { ToastAction } from '../ui/toast';
import { cn } from '@/lib/utils';

interface SaveSearchButtonProps {
  filters: Omit<SavedSearch['filters'], 'name'>;
  disabled?: boolean;
}

export function SaveSearchButton({ filters, disabled }: SaveSearchButtonProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [searchName, setSearchName] = useState('');

  const handleSave = async () => {
    if (!searchName.trim()) {
      toast({ variant: 'destructive', title: 'Protocol Error', description: 'A registry name is required for the vault.' });
      return;
    }
    setIsSaving(true);
    try {
      const url = `${window.location.pathname}?${new URLSearchParams(window.location.search).toString()}`;
      await saveSearchAction({ name: searchName, filters, url });
      
      setIsSaved(true);
      toast({
        title: 'Registry Sync Complete',
        description: `Search "${searchName}" is now vaulted in your dashboard.`,
        action: <ToastAction altText="View Dashboard" onClick={() => router.push('/buyer/dashboard')}>View Vault</ToastAction>,
      });
      
      setTimeout(() => {
        setOpen(false);
        setSearchName('');
        setIsSaved(false);
      }, 1500);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Transmission Error',
        description: error.message || 'Could not commit the search to the vault.',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleTriggerClick = () => {
    if (!user) {
         toast({
            title: 'Authentication Required',
            description: 'You must provision an identity vault to save searches.',
            action: <Button variant="accent" size="sm" onClick={() => router.push('/login')}>Sign In</Button>
        });
        return;
    }
    setOpen(true);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          onClick={handleTriggerClick} 
          disabled={disabled}
          className={cn("h-14 px-6 gap-2 transition-all", isSaved && "border-success text-success")}
        >
          {isSaved ? <CheckCircle2 className="h-5 w-5 animate-scale-in" /> : <Bookmark className="h-5 w-5" />}
          <span className="font-black uppercase text-[10px] tracking-widest">{isSaved ? 'Vaulted' : 'Save Search'}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-black uppercase tracking-tight">Vault Search Protocol</DialogTitle>
          <DialogDescription className="text-xs font-medium">
            Assign a registry name to this filter configuration for instant recall from your dashboard.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Registry Name
            </Label>
            <Input
              id="name"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="h-12 font-bold"
              placeholder="e.g., Kajiado Residential Plots < 5M"
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave} disabled={isSaving || isSaved} className="w-full h-12 font-black uppercase text-xs tracking-widest shadow-glow">
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : isSaved ? <CheckCircle2 className="mr-2 h-4 w-4" /> : null}
            {isSaved ? 'Sync Complete' : 'Commit to Vault'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
