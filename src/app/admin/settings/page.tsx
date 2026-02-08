import { AdminPage } from '../_components/admin-page';
import { SettingsForm } from '@/components/admin/SettingsForm';

export default function SettingsPage() {
    return (
        <AdminPage
            title="Settings"
            description="Manage platform settings and configurations."
            breadcrumbs={[{ href: '/admin', label: 'Dashboard' }, { href: '/admin/settings', label: 'Settings' }]}
        >
            <SettingsForm />
        </AdminPage>
    );
}
