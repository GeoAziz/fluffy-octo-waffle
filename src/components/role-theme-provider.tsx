'use client';

import { useState, useEffect } from 'react';

export function RoleThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const checkRole = async () => {
      try {
        const response = await fetch('/api/auth/session');
        if (response.ok) {
          const data = await response.json();
          setRole(data.role?.toLowerCase() || null);
        }
      } catch (e) {
        console.error('Failed to fetch user role:', e);
      }
    };
    checkRole();
  }, []);

  useEffect(() => {
    if (mounted && role) {
      document.documentElement.setAttribute('data-role', role);
    } else if (mounted) {
      document.documentElement.removeAttribute('data-role');
    }
  }, [role, mounted]);

  return <>{children}</>;
}
