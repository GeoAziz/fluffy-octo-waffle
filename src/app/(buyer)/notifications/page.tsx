import { getAuthenticatedUser, getNotificationsForUser, markAllNotificationsAsReadAction } from '@/app/actions';
import { redirect } from 'next/navigation';
import { BuyerPage } from '@/components/buyer/buyer-page';
import { NotificationsClient } from '@/components/buyer/notifications-client';

export const dynamic = 'force-dynamic';

export default async function NotificationsPage() {
  const user = await getAuthenticatedUser();
  if (!user) {
    redirect('/login?redirect=/notifications');
  }

  if (user.role !== 'BUYER') {
    redirect('/dashboard');
  }

  const notifications = await getNotificationsForUser();

  return (
    <BuyerPage
      title="Notifications"
      description="Stay updated with inquiries, badge updates, flags, and system messages."
    >
      <NotificationsClient initialNotifications={notifications} />
    </BuyerPage>
  );
}
