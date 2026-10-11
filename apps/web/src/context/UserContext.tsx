'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type UserContextType = {
  user: User | null;
  loading: boolean;
};

const UserContext = createContext<UserContextType>({ user: null, loading: true });

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // 1. Try Supabase Auth directly
        const { data: { user: sbUser } } = await supabase.auth.getUser();
        if (sbUser) {
          setUser({
            id: sbUser.id,
            name: sbUser.user_metadata?.name || sbUser.email?.split('@')[0] || 'Merchant',
            email: sbUser.email || '',
            role: sbUser.user_metadata?.role || 'merchant',
          });
          setLoading(false);
          return;
        }

        // 2. Fallback to /api/dashboard/me
        const res = await fetch(`/api/dashboard/me`, { credentials: 'include' });
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            setUser(json.data);
          }
        }
      } catch (err) {
        console.warn('User fetch notice:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
