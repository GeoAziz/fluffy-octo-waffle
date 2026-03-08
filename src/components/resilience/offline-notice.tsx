'use client';

import { useNetworkStatus } from './network-status-provider';
import { WifiOff, AlertCircle, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

/**
 * OfflineNotice - Appears at the top of the screen when connection is lost.
 */
export function OfflineNotice() {
  const { isOnline } = useNetworkStatus();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShow(true);
    } else {
      // Small delay before hiding after coming back online
      const timer = setTimeout(() => setShow(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  if (!show && isOnline) return null;

  return (
    <div 
      className={cn(
        "fixed top-0 left-0 right-0 z-[100] flex items-center justify-center p-2 transition-all duration-500 transform",
        !isOnline ? "translate-y-0" : "-translate-y-full opacity-0"
      )}
    >
      <div className={cn(
        "flex items-center gap-3 px-4 py-2 rounded-full shadow-lg border animate-in slide-in-from-top-4 duration-500",
        !isOnline ? "bg-risk text-white border-risk" : "bg-success text-white border-success"
      )}>
        {!isOnline ? (
          <>
            <WifiOff className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Connection Lost — Working Offline</span>
          </>
        ) : (
          <>
            <AlertCircle className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Back Online — Syncing Data</span>
          </>
        )}
      </div>
    </div>
  );
}
