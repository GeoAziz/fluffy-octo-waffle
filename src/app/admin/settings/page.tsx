import { AdminPage } from '../_components/admin-page';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';

export default function SettingsPage() {
    return (
        <AdminPage
            title="Settings"
            description="Manage platform settings and configurations."
            breadcrumbs={[{ href: '/admin', label: 'Dashboard' }, { href: '/admin/settings', label: 'Settings' }]}
        >
            <Card>
                <CardHeader>
                    <CardTitle>Platform Settings</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center text-center py-20 border-2 border-dashed rounded-lg">
                        <Settings className="h-16 w-16 text-muted-foreground" />
                        <p className="mt-4 text-muted-foreground">Configuration options coming soon.</p>
                    </div>
                </CardContent>
            </Card>
        </AdminPage>
    );
}
