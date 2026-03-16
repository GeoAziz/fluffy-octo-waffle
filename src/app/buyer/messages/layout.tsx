import { ConversationsList } from '@/components/chat/conversations-list';
import { Card, CardContent } from '@/components/ui/card';
import { BuyerPage } from '@/components/buyer/buyer-page';

/**
 * BuyerMessagesLayout — Authenticated buyer messaging shell.
 * Rendered inside src/app/buyer/layout.tsx (BUYER-role gated).
 * Shows the conversation list sidebar alongside the active conversation.
 */
export default function BuyerMessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
              <ConversationsList basePath="/buyer/messages" />
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
