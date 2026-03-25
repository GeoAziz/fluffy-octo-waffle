'use client';

import { useEffect, useRef, useState, use } from 'react';
import { useAuth } from '@/components/providers';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, orderBy, doc, updateDoc, limit, getDocs } from 'firebase/firestore';
import type { Message, Conversation, Listing } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Loader2, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { format } from 'date-fns';
import { cn, toDateSafe } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import Image from 'next/image';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { conversationStatusLabel, getConversationStatus, type ConversationStatus } from '@/lib/conversation-status';

const ChatSkeleton = () => (
    <Card className="h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between gap-4 border-b">
            <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-md" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-32" />
                </div>
            </div>
            <Skeleton className="h-10 w-10 rounded-full" />
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="flex items-end gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="p-3 rounded-lg bg-secondary space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-24" />
                </div>
            </div>
            <div className="flex items-end gap-2 justify-end">
                <div className="p-3 rounded-lg bg-primary/10 space-y-2">
                     <Skeleton className="h-4 w-56" />
                </div>
            </div>
        </CardContent>
        <CardFooter className="border-t p-4">
            <div className="w-full flex items-center gap-2">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 w-10" />
            </div>
        </CardFooter>
    </Card>
);


export default function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { user } = useAuth();
    const { toast } = useToast();
    const [conversation, setConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const [, setComposerState] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle');
    const [status, setStatus] = useState<ConversationStatus>('new');
    const [similarListings, setSimilarListings] = useState<Listing[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (!user) return;
        setLoading(true);

        const convoRef = doc(db, 'conversations', id);
        const convoUnsubscribe = onSnapshot(convoRef, (doc) => {
            if (doc.exists()) {
                const convoData = { id: doc.id, ...doc.data() } as Conversation;
                if (!convoData.participantIds.includes(user.uid)) {
                    setConversation(null);
                    return;
                }
                setConversation(convoData);
                setStatus(getConversationStatus(convoData, user.uid));
                
                // Load similar properties (Strategic Enhancement)
                if (convoData.listingId) {
                  fetchSimilarProperties(convoData.listingId);
                }
            } else {
                setConversation(null);
            }
        }, async (error) => {
            const permissionError = new FirestorePermissionError({ path: convoRef.path, operation: 'get' }, error);
            errorEmitter.emit('permission-error', permissionError);
            setLoading(false);
        });

        const messagesColRef = collection(db, 'conversations', id, 'messages');
        const messagesQuery = query(messagesColRef, orderBy('timestamp', 'asc'));
        const messagesUnsubscribe = onSnapshot(messagesQuery, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
            setMessages(msgs);
            setLoading(false);
        }, async (error) => {
            const permissionError = new FirestorePermissionError({ path: messagesColRef.path, operation: 'list' }, error);
            errorEmitter.emit('permission-error', permissionError);
            setLoading(false);
        });

        return () => {
            convoUnsubscribe();
            messagesUnsubscribe();
        };
    }, [id, user]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user || !conversation) return;

        setSending(true);
        setComposerState('sending');
        setNewMessage('');

        try {
            const response = await fetch('/api/messages/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ conversationId: id, text: newMessage }),
            });

            if (!response.ok) {
                const payload = await response.json().catch(() => ({}));
                throw new Error(payload?.error || 'Send failed');
            }

            setStatus('responded');
            setComposerState('sent');
        } catch {
            setComposerState('failed');
            toast({ variant: 'destructive', title: 'Send failed', description: 'Message could not be sent. Retry when ready.' });
        } finally {
            setSending(false);
        }
    };

    const fetchSimilarProperties = async (listingId: string) => {
        try {
            const listingsRef = collection(db, 'listings');
            const listingsQuery = query(listingsRef, limit(3));
            const snapshot = await getDocs(listingsQuery);
            const listings = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() } as Listing))
                .filter(listing => listing.id !== listingId)
                .slice(0, 2);
            setSimilarListings(listings);
        } catch (error) {
            console.error('Error fetching similar properties:', error);
        }
    };

    if (loading) return <ChatSkeleton />;
    if (!conversation) return <Card className="h-full flex items-center justify-center p-8 text-center"><p>Secure conversation link expired or unauthorized.</p></Card>
    
    const otherParticipantId = conversation.participantIds.find(id => id !== user?.uid);
    const otherParticipant = otherParticipantId ? conversation.participants[otherParticipantId] : null;
    const isSeller = user?.uid === Object.keys(conversation.participants).find(id => id !== user?.uid); // simplified check

    return (
        <div className="h-full grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-4">
            <Card className="h-full flex flex-col border-none shadow-xl bg-card/50 backdrop-blur-sm overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between gap-4 border-b bg-muted/10">
                    <Link href={`/listings/${conversation.listingId}`} className="flex items-center gap-3 overflow-hidden group">
                        <div className="relative h-12 w-12 flex-shrink-0">
                            <Image
                                src={conversation.listingImage || 'https://picsum.photos/seed/conversation/100/100'}
                                alt={conversation.listingTitle}
                                fill
                                className="rounded-md object-cover shadow-sm"
                            />
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="truncate font-black uppercase tracking-tight text-xs group-hover:text-accent transition-colors">{conversation.listingTitle}</p>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest truncate">
                                Secure Protocol with {otherParticipant?.displayName}
                            </p>
                        </div>
                    </Link>
                    {otherParticipant && (
                        <Avatar className="h-10 w-10 border hidden sm:flex">
                            <AvatarImage src={otherParticipant.photoURL} />
                            <AvatarFallback>{otherParticipant.displayName.charAt(0)}</AvatarFallback>
                        </Avatar>
                    )}
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
                    <Alert variant="default" className="border-accent/30 bg-accent/5">
                        <Sparkles className="h-4 w-4 text-accent" />
                        <AlertTitle className="text-accent font-black uppercase text-[10px] tracking-widest">Protocol Reminder</AlertTitle>
                        <AlertDescription className="text-accent/80 text-[11px] font-medium leading-relaxed">
                            Verify documentation signals before finalizing site visits. Never make payments without independent legal audit.
                        </AlertDescription>
                    </Alert>

                    {messages.map(msg => {
                        const isSender = msg.senderId === user?.uid;
                        const participant = isSender ? null : (conversation.participants[msg.senderId] || null);
                        const messageTimestamp = toDateSafe(msg.timestamp);

                        return (
                            <div key={msg.id} className={cn("flex items-end gap-2", isSender && "justify-end")}>
                                {!isSender && participant && (
                                    <Avatar className="h-8 w-8 border self-start shadow-sm">
                                        <AvatarImage src={participant.photoURL} />
                                        <AvatarFallback>{participant.displayName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                )}
                                <div className={cn(
                                    "max-w-xs md:max-w-md lg:max-w-xl p-4 rounded-2xl shadow-sm",
                                    isSender ? "bg-primary text-white rounded-tr-none" : "bg-white border rounded-tl-none"
                                )}>
                                    <p className="text-sm font-medium" style={{whiteSpace: 'pre-wrap'}}>{msg.text}</p>
                                    {messageTimestamp ? (
                                        <p className={cn("text-[9px] font-black uppercase mt-2 text-right opacity-60")}>
                                            {format(messageTimestamp, 'p')}
                                        </p>
                                    ) : null}
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </CardContent>
                <CardFooter className="border-t p-4 bg-muted/5">
                    <div className="w-full space-y-4">
                        {/* Suggested Follow-ups (Strategic Enhancement) */}
                        {!isSeller && messages.length > 0 && messages[messages.length - 1].senderId !== user?.uid && (
                          <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-bottom-2">
                            {["I'd like to schedule a visit.", "Are documents ready?", "Is price negotiable?"].map(preset => (
                              <button key={preset} onClick={() => { setNewMessage(preset); }} className="px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-black uppercase tracking-widest hover:bg-accent/20 transition-all">
                                {preset}
                              </button>
                            ))}
                          </div>
                        )}

                        <form onSubmit={handleSendMessage} className="w-full flex items-center gap-3">
                            <Input 
                                value={newMessage}
                                onChange={(e) => { setNewMessage(e.target.value); setComposerState('idle'); }}
                                placeholder="Type your message pulse..."
                                disabled={sending}
                                className="h-12 bg-background font-medium rounded-xl shadow-inner"
                                autoComplete="off"
                            />
                            <Button type="submit" size="icon" className="h-12 w-12 rounded-xl bg-primary shadow-glow shrink-0" disabled={sending || !newMessage.trim()}>
                                {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                            </Button>
                        </form>
                    </div>
                </CardFooter>
            </Card>

            <div className="space-y-4">
              <Card className="border-none shadow-xl">
                  <CardHeader>
                      <div className="flex items-center justify-between">
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Registry Status</p>
                          <Badge variant="outline" className="text-[9px]">{conversationStatusLabel[status]}</Badge>
                      </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                      <div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Target Resource</p>
                          <Link href={`/listings/${conversation.listingId}`} className="text-xs font-black uppercase hover:underline text-primary">
                              {conversation.listingTitle}
                          </Link>
                      </div>
                      <div className="rounded-xl border border-border/40 bg-muted/20 p-4">
                          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-2">Trust SLA</p>
                          <p className="text-[11px] font-medium text-foreground/80 leading-relaxed italic">Most sellers acknowledge pulses within 24h. Maintain identity transparency.</p>
                      </div>
                      <div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-2">Protocol Status</p>
                          <Select value={status} onValueChange={(v: ConversationStatus) => {
                            const ref = doc(db, 'conversations', id);
                            updateDoc(ref, { status: v });
                          }}>
                              <SelectTrigger className="w-full h-10 font-bold text-xs uppercase"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                  <SelectItem value="new" className="text-xs font-bold uppercase">NEW</SelectItem>
                                  <SelectItem value="responded" className="text-xs font-bold uppercase">ACTIVE</SelectItem>
                                  <SelectItem value="closed" className="text-xs font-bold uppercase">ARCHIVED</SelectItem>
                              </SelectContent>
                          </Select>
                      </div>
                  </CardContent>
              </Card>

              {/* Similar Properties (Strategic Enhancement) */}
              {similarListings.length > 0 && (
                <div className="space-y-3 animate-in fade-in duration-700">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground pl-1">Related Assets</h3>
                  {similarListings.map(listing => (
                    <Link key={listing.id} href={`/listings/${listing.id}`} className="block group">
                      <Card className="border-none shadow-md overflow-hidden bg-background/50 hover:shadow-lg transition-all">
                        <CardContent className="p-0 flex items-center">
                          <div className="relative h-16 w-16 flex-shrink-0">
                            <Image src={listing.images[0]?.url} alt="" fill className="object-cover" />
                          </div>
                          <div className="p-3 overflow-hidden">
                            <p className="text-[10px] font-black uppercase truncate group-hover:text-accent transition-colors">{listing.title}</p>
                            <p className="text-[10px] font-bold text-primary">KES {listing.price.toLocaleString()}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>
        </div>
    );
}
