'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Trash2, Plus } from 'lucide-react';
import Link from 'next/link';
import { EmptyState } from '@/components/empty-state';
import type { SavedSearch } from '@/lib/types';

/**
 * Saved Searches Page
 * 
 * Dashboard view of all buyer's saved searches with:
 * - Search criteria summary
 * - New listings count since last visit
 * - Alert frequency controls
 * - One-click to browse or edit filters
 */
export default function SavedSearchesPage() {
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch saved searches from Firebase
    // This is a placeholder implementation
    setLoading(false);
  }, []);

  const handleDeleteSearch = (id: string) => {
    setSearches(searches.filter(s => s.id !== id));
    // TODO: Call server action to delete from Firebase
  };

  const handleEditSearch = () => {
    // TODO: Navigate to edit page or open modal
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Loading saved searches...</p>
        </div>
      </div>
    );
  }

  if (searches.length === 0) {
    return (
      <div className="space-y-8 py-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Saved Searches</h1>
          <p className="text-muted-foreground">Keep track of your property searches and get alerts for new listings</p>
        </div>

        <EmptyState
          icon="Search"
          title="No saved searches yet"
          description="Create a search to save your filters and get alerts when new properties matching your criteria are added."
          actions={[
            { label: 'Create Search', href: '/explore' }
          ]}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Saved Searches</h1>
          <p className="text-muted-foreground mt-1">You have {searches.length} saved searche{searches.length !== 1 ? 's' : ''}</p>
        </div>
        <Button asChild>
          <Link href="/explore">
            <Plus className="h-4 w-4 mr-2" />
            New Search
          </Link>
        </Button>
      </div>

      {/* Saved Searches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {searches.map((search) => (
          <Card key={search.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{search.name}</CardTitle>
                  <CardDescription className="mt-1">
                    {search.filters.query && `"${search.filters.query}"`}
                    {search.filters.county && ` in ${search.filters.county}`}
                  </CardDescription>
                </div>
                <Badge variant="outline">Active</Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Search Criteria Summary */}
              <div className="space-y-2 text-sm">
                {search.filters.landType && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Land Type:</span>
                    <span className="font-medium">{search.filters.landType}</span>
                  </div>
                )}
                {search.filters.minPrice || search.filters.maxPrice ? (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price Range:</span>
                    <span className="font-medium">
                      {search.filters.minPrice ? `KES ${search.filters.minPrice.toLocaleString()}` : 'Any'} - {search.filters.maxPrice ? `KES ${search.filters.maxPrice.toLocaleString()}` : 'Any'}
                    </span>
                  </div>
                ) : null}
                {search.filters.minArea || search.filters.maxArea ? (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Area:</span>
                    <span className="font-medium">
                      {search.filters.minArea ? `${search.filters.minArea}` : 'Any'} - {search.filters.maxArea ? `${search.filters.maxArea}` : 'Any'} acres
                    </span>
                  </div>
                ) : null}
              </div>

              {/* New Listings Info */}
              <div className="pt-2 border-t text-sm flex items-center justify-between">
                <span className="text-muted-foreground">New listings</span>
                <Badge variant="secondary">0</Badge>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <Link href={search.url}>
                    <Search className="h-4 w-4 mr-1" />
                    Browse
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={handleEditSearch}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteSearch(search.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
