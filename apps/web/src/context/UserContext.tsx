'use client';

import { createContext, useContext, useState, useEffect } from 'react';

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
    const fetchUser = async (retries = 3) => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/dashboard/me`, {
          credentials: 'include',
        });
        
        if (res.ok) {
          const json = await res.json();
          setUser(json.data);
          setLoading(false);
        } else {
          // If 401 or other status, stop retrying and set loading false
          setLoading(false);
        }
      } catch (err: any) {
        if (retries > 0) {
          setTimeout(() => fetchUser(retries - 1), 1000);
        } else {
          console.warn('Failed to fetch user (Server might be restarting).');
          setLoading(false);
        }
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
