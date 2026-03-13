import type { UserProfile } from '@/lib/types';

type UserRole = UserProfile['role'];

export type WorkspaceLink = {
  href: string;
  label: string;
  description: string;
};

const BUYER_WORKSPACE: WorkspaceLink = {
  href: '/buyer/dashboard',
  label: 'Buyer Dashboard',
  description: 'Track saved listings, searches, and conversations.',
};

const SELLER_WORKSPACE: WorkspaceLink = {
  href: '/dashboard',
  label: 'Seller Workspace',
  description: 'Manage listings, evidence quality, and buyer inquiries.',
};

const ADMIN_WORKSPACE: WorkspaceLink = {
  href: '/admin',
  label: 'Admin Console',
  description: 'Moderate trust signals, risk flags, and platform controls.',
};

export function getPrimaryWorkspace(role?: UserRole | null): WorkspaceLink | null {
  if (!role) return null;
  if (role === 'ADMIN') return ADMIN_WORKSPACE;
  if (role === 'SELLER') return SELLER_WORKSPACE;
  return BUYER_WORKSPACE;
}

export function getWorkspaceSwitchTargets(role?: UserRole | null): WorkspaceLink[] {
  if (!role) return [];

  if (role === 'ADMIN') {
    return [ADMIN_WORKSPACE, SELLER_WORKSPACE, { href: '/explore', label: 'Buyer Experience', description: 'Browse the marketplace as buyers see it.' }];
  }

  if (role === 'SELLER') {
    return [SELLER_WORKSPACE, { href: '/explore', label: 'Buyer Experience', description: 'Browse public listings and trust badges.' }];
  }

  return [BUYER_WORKSPACE];
}

export function getRoleAwareDashboardPath(role?: UserRole | null): string {
  if (!role) return '/login';
  if (role === 'ADMIN') return '/admin';
  if (role === 'SELLER') return '/dashboard';
  return '/buyer/dashboard';
}

export function getDiscoveryNavLinks(role?: UserRole | null) {
  if (role === 'ADMIN') {
    return [
      { href: '/admin', label: 'Admin Console' },
      { href: '/admin/listings', label: 'Moderation Queue' },
      { href: '/explore', label: 'Buyer Experience' },
    ];
  }

  if (role === 'SELLER') {
    return [
      { href: '/dashboard', label: 'Seller Workspace' },
      { href: '/dashboard/listings', label: 'My Listings' },
      { href: '/explore', label: 'Buyer Experience' },
    ];
  }

  return [
    { href: '/explore', label: 'Browse Listings' },
    { href: '/trust', label: 'How It Works' },
    { href: '/contact', label: 'About' },
  ];
}
