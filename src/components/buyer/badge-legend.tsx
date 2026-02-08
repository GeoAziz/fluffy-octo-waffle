'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, Gem, Trophy } from 'lucide-react';

/**
 * BadgeLegend - Explains what trust badges mean
 * Shows what Gold, Silver, and Bronze badges represent
 */
export function BadgeLegend() {
  const badges = [
    {
      name: 'Gold',
      icon: Trophy,
      color: 'text-yellow-600',
      description: 'Comprehensive documentation with verified legal title, survey maps, and multiple supporting documents',
    },
    {
      name: 'Silver',
      icon: Gem,
      color: 'text-gray-400',
      description: 'Good documentation with verified title deed and supporting documents, though not exhaustive',
    },
    {
      name: 'Bronze',
      icon: Award,
      color: 'text-orange-600',
      description: 'Basic documentation provided, verified but may have limited supporting evidence',
    },
  ];

  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader>
        <CardTitle className="text-lg">How Trust Badges Work</CardTitle>
        <CardDescription>
          Our badges reflect the quality and completeness of documentation provided by sellers.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {badges.map((badge) => {
            const Icon = badge.icon;
            return (
              <div key={badge.name} className="space-y-2 p-4 rounded-lg bg-muted/50 border">
                <div className="flex items-center gap-2">
                  <Icon className={`h-5 w-5 ${badge.color}`} />
                  <span className="font-semibold">{badge.name} Badge</span>
                </div>
                <p className="text-sm text-muted-foreground">{badge.description}</p>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded border border-blue-200 dark:border-blue-800">
          💡 <strong>Note:</strong> Badges indicate documentation quality, not a legal guarantee of title. Always conduct your own due diligence and consult with a lawyer before purchasing.
        </p>
      </CardContent>
    </Card>
  );
}
