import { AdminPage } from '../_components/admin-page';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart } from 'lucide-react';

export default function AnalyticsPage() {
    return (
        <AdminPage
            title="Analytics"
            description="Detailed analytics and reports for the platform."
            breadcrumbs={[{ href: '/admin', label: 'Dashboard' }, { href: '/admin/analytics', label: 'Analytics' }]}
        >
            <Card>
                <CardHeader>
                    <CardTitle>Analytics Dashboard</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center text-center py-20 border-2 border-dashed rounded-lg">
                        <AreaChart className="h-16 w-16 text-muted-foreground" />
                        <p className="mt-4 text-muted-foreground">Advanced analytics coming soon.</p>
                    </div>
                </CardContent>
            </Card>
        </AdminPage>
    );
}
