import { ConversationsList } from '@/components/chat/conversations-list';
import { Card, CardContent } from '@/components/ui/card';
import { SellerPage } from '@/components/seller/seller-page';

/**
 * SellerMessagesLayout — Seller messaging shell.
 * Rendered inside src/app/(seller)/layout.tsx (SELLER/ADMIN-role gated).
 * Shows the conversation list sidebar alongside the active conversation.
 */
export default function SellerMessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SellerPage
      title="Messages"
      description="Communicate with buyers interested in your listings."
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[calc(100vh-200px)]">
        {/* Inbox Sidebar */}
        <div className="md:col-span-4 lg:col-span-3 h-full overflow-hidden">
          <Card className="h-full border-none shadow-xl bg-card/50 backdrop-blur-sm">
            <CardContent className="p-0 h-full">
              <ConversationsList basePath="/dashboard/messages" />
            </CardContent>
          </Card>
        </div>

        {/* Conversation View */}
        <div className="md:col-span-8 lg:col-span-9 h-full overflow-hidden">
          {children}
        </div>
      </div>
    </SellerPage>
  );
}
