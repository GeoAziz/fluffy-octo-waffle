import { ConversationsList } from '@/components/chat/conversations-list';
import { Card, CardContent } from '@/components/ui/card';
import { cookies } from 'next/headers';
import { adminAuth } from '@/lib/firebase-admin';
import { redirect } from 'next/navigation';
import { BuyerPage } from '@/components/buyer/buyer-page';

async function getAuthenticatedUser() {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('__session')?.value;
    if (!sessionCookie) return null;

    try {
        const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
        return decodedToken;
    } catch(e) {
        return null;
    }
}


export default async function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthenticatedUser();
  if (!user) {
    redirect('/login?redirect=/messages');
  }

  return (
    <BuyerPage
      title="Communication Hub"
      description="Secure end-to-end messaging with verified sellers and buyers."
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[calc(100vh-220px)]">
        {/* Inbox Sidebar */}
        <div className="md:col-span-4 lg:col-span-3 h-full overflow-hidden">
          <Card className="h-full border-none shadow-xl bg-card/50 backdrop-blur-sm">
            <CardContent className="p-0 h-full">
              <ConversationsList />
            </CardContent>
          </Card>
        </div>
        
        {/* Conversation View */}
        <div className="md:col-span-8 lg:col-span-9 h-full overflow-hidden">
          {children}
        </div>
      </div>
    </BuyerPage>
  );
}
