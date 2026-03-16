'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/providers';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import type { Conversation } from '@/lib/types';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';
import { Badge } from '@/components/ui/badge';
import { conversationStatusLabel, getConversationStatus } from '@/lib/conversation-status';

/**
 * ConversationsList - Enhanced Inbox Sidebar
 * Features "Awaiting response" badges and sender-aware snippets.
 */
export function ConversationsList() {
    const { user, loading: authLoading } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const pathname = usePathname();

    useEffect(() => {
        if (!user) return;
        setLoading(true);

        const q = query(
            collection(db, 'conversations'), 
            where('participantIds', 'array-contains', user.uid),
            orderBy('updatedAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const convos = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Conversation));
            setConversations(convos);
            setLoading(false);
        }, async (error) => {
            const permissionError = new FirestorePermissionError({
                path: 'conversations',
                operation: 'list',
            }, error);
            errorEmitter.emit('permission-error', permissionError);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);
    
    if (loading || authLoading) {
        return (
            <div className="p-4 space-y-4">
                {Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
            </div>
        )
    }

    const getOtherParticipant = (convo: Conversation) => {
        const otherId = convo.participantIds.find(id => id !== user?.uid);
        return otherId ? convo.participants[otherId] : null;
    }

    return (
        <div className="h-full overflow-y-auto">
            <div className="p-4 border-b bg-muted/30">
              <h2 className="text-sm font-black uppercase tracking-widest text-primary">Secure Inboxes</h2>
            </div>
            {conversations.length === 0 ? (
                <p className="p-8 text-center text-xs font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">No active signals yet. Start a conversation from any listing.</p>
            ) : (
                <nav className="flex flex-col">
                    {conversations.map(convo => {
                        const otherParticipant = getOtherParticipant(convo);
                        if (!otherParticipant) return null;
                        const isActive = pathname.includes(convo.id);
                        const status = getConversationStatus(convo, user?.uid);
                        const lastMsgFromMe = convo.lastMessage?.senderId === user?.uid;
                        const needsAction = !lastMsgFromMe && status !== 'closed';

                        return (
                            <Link href={`/messages/${convo.id}`} key={convo.id} className={cn(
                                "flex items-center gap-3 p-4 border-b transition-all hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
                                isActive && "bg-accent/5 border-l-4 border-l-accent pl-3"
                            )}>
                                <div className="relative h-12 w-12 flex-shrink-0">
                                    <Image
                                        src={convo.listingImage || 'https://picsum.photos/seed/property/100/100'}
                                        alt={convo.listingTitle}
                                        fill
                                        className="rounded-lg object-cover shadow-sm"
                                    />
                                    {needsAction && (
                                      <span className="absolute -top-1 -right-1 h-3 w-3 bg-risk rounded-full border-2 border-background animate-pulse" />
                                    )}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <div className="flex justify-between items-start gap-2 mb-0.5">
                                        <p className="font-bold text-sm truncate leading-tight">{convo.listingTitle}</p>
                                        {convo.lastMessage?.timestamp && (
                                            <p className="text-[9px] font-black uppercase text-muted-foreground flex-shrink-0">
                                                {formatDistanceToNow(typeof convo.lastMessage.timestamp.toDate === 'function' ? convo.lastMessage.timestamp.toDate() : new Date(convo.lastMessage.timestamp), { addSuffix: false })}
                                            </p>
                                        )}
                                    </div>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight mb-1">
                                        Agent: {otherParticipant.displayName}
                                    </p>
                                    <div className="flex items-center justify-between gap-2">
                                      <p className="text-xs text-foreground/70 truncate italic flex-1">
                                          {lastMsgFromMe && <span className="font-black text-[9px] uppercase not-italic mr-1 opacity-60">You:</span>}
                                          {convo.lastMessage?.text || 'Identity pulse initiated...'}
                                      </p>
                                      {needsAction && (
                                        <Badge variant="risk" className="h-4 px-1.5 text-[8px] font-black uppercase tracking-tighter shrink-0">
                                          Awaiting You
                                        </Badge>
                                      )}
                                    </div>
                                </div>
                            </Link>
                        )
                    })}
                </nav>
            )}
        </div>
    )
}
