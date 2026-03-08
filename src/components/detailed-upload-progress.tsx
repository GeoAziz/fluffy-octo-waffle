'use client';

import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Loader2, ShieldCheck, Wifi, Activity, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DetailedUploadProgressProps {
  progress: number;
  filesCount: number;
  totalSize: number; // in bytes
  isComplete?: boolean;
}

export function DetailedUploadProgress({ progress, filesCount, totalSize, isComplete }: DetailedUploadProgressProps) {
  const [uploadSpeed, setUploadSpeed] = useState(0);
  const [eta, setEta] = useState(0);
  const [phase, setPhase] = useState<'uploading' | 'verifying' | 'completed'>('uploading');

  useEffect(() => {
    if (progress < 100) {
      setPhase('uploading');
      // Simulate varying upload speed for visual fidelity
      const interval = setInterval(() => {
        const baseSpeed = 450; // KB/s
        const variance = Math.random() * 150 - 75;
        setUploadSpeed(Math.max(100, Math.floor(baseSpeed + variance)));
      }, 1000);

      // Estimate ETA
      const remainingBytes = totalSize * (1 - progress / 100);
      const remainingSeconds = remainingBytes / (uploadSpeed * 1024 || 1);
      setEta(Math.max(1, Math.floor(remainingSeconds)));

      return () => clearInterval(interval);
    } else if (progress === 100 && !isComplete) {
      setPhase('verifying');
    } else if (isComplete) {
      setPhase('completed');
    }
  }, [progress, totalSize, uploadSpeed, isComplete]);

  return (
    <Card className="border-accent/20 bg-accent/5 backdrop-blur-sm overflow-hidden animate-in fade-in duration-500">
      <CardContent className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10">
              {phase === 'uploading' ? (
                <Activity className="h-5 w-5 text-accent animate-pulse" />
              ) : phase === 'verifying' ? (
                <ShieldCheck className="h-5 w-5 text-warning animate-bounce" />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-success" />
              )}
            </div>
            <div>
              <h4 className="text-sm font-black uppercase tracking-tight text-foreground">
                {phase === 'uploading' ? 'Transmission Active' : phase === 'verifying' ? 'Security Handshake' : 'Vault Secured'}
              </h4>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                {filesCount} {filesCount === 1 ? 'Asset' : 'Assets'} — {(totalSize / (1024 * 1024)).toFixed(2)} MB Total
              </p>
            </div>
          </div>
          <Badge className={cn(
            "font-black text-[10px] tracking-widest border-none h-6 px-3",
            phase === 'uploading' ? "bg-accent text-white" : phase === 'verifying' ? "bg-warning text-white" : "bg-success text-white"
          )}>
            {progress}% {phase === 'verifying' && ' VERIFYING'}
          </Badge>
        </div>

        <div className="space-y-3">
          <Progress value={progress} className="h-2.5 bg-background/50 border border-border/40" />
          
          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="flex flex-col gap-1">
              <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                <Wifi className="h-2.5 w-2.5" /> Bitrate
              </span>
              <span className="text-xs font-bold text-foreground">
                {phase === 'uploading' ? `${uploadSpeed} KB/s` : phase === 'verifying' ? 'Checking...' : 'Synced'}
              </span>
            </div>
            
            <div className="flex flex-col gap-1 border-x border-border/40 px-4">
              <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                <Clock className="h-2.5 w-2.5" /> ETA
              </span>
              <span className="text-xs font-bold text-foreground">
                {phase === 'uploading' ? `${eta}s Remaining` : phase === 'verifying' ? 'Verifying...' : 'Complete'}
              </span>
            </div>

            <div className="flex flex-col gap-1 text-right">
              <span className="flex items-center gap-1.5 justify-end text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                <ShieldCheck className="h-2.5 w-2.5" /> Integrity
              </span>
              <span className="text-xs font-bold text-foreground truncate">
                {phase === 'completed' ? 'Verified (SHA-256)' : 'Pending Pulse'}
              </span>
            </div>
          </div>
        </div>

        {phase === 'completed' && (
          <div className="rounded-lg bg-success/10 border border-success/20 p-3 flex items-center gap-3 animate-in slide-in-from-top-2 duration-500">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <p className="text-[11px] font-bold text-success uppercase tracking-wide">
              Evidence successfully vaulted. Awaiting admin review.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
