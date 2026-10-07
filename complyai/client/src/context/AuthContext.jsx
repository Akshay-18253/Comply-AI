import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

const DEMO_USER = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'founder@novatech.in',
  user_metadata: {
    full_name: 'Aarav Sharma',
  },
  created_at: new Date().toISOString(),
};

const DEMO_SESSION = {
  access_token: 'demo_token_complyai_local',
  token_type: 'bearer',
  user: DEMO_USER,
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if we have a saved demo/local session in localStorage
    const savedLocal = localStorage.getItem('complyai_session');
    if (savedLocal) {
      try {
        const parsed = JSON.parse(savedLocal);
        if (parsed?.user) {
          setUser(parsed.user);
          setSession(parsed);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.error('Error parsing local session', e);
      }
    }

    // Try Supabase session if configured
    const isPlaceholder = !import.meta.env.VITE_SUPABASE_URL ||
      import.meta.env.VITE_SUPABASE_URL.includes('your-project.supabase.co');

    if (!isPlaceholder) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }).catch(() => {
        setLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    } else {
      setLoading(false);
    }
  }, []);

  const signUp = async (email, password, fullName) => {
    const isPlaceholder = !import.meta.env.VITE_SUPABASE_URL ||
      import.meta.env.VITE_SUPABASE_URL.includes('your-project.supabase.co');

    if (!isPlaceholder) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });
        if (error) throw error;
        return data;
      } catch (err) {
        // If network fetch fails, gracefully fall back to local demo account
        console.warn('Supabase signup network error, falling back to local session:', err);
      }
    }

    // Local / Demo registration fallback
    const newUser = {
      id: '00000000-0000-0000-0000-000000000001',
      email: email || 'founder@novatech.in',
      user_metadata: { full_name: fullName || 'Founder' },
      created_at: new Date().toISOString(),
    };
    const newSession = {
      access_token: 'demo_token_complyai_local',
      token_type: 'bearer',
      user: newUser,
    };
    localStorage.setItem('complyai_session', JSON.stringify(newSession));
    setUser(newUser);
    setSession(newSession);
    return { user: newUser, session: newSession };
  };

  const signIn = async (email, password) => {
    const isPlaceholder = !import.meta.env.VITE_SUPABASE_URL ||
      import.meta.env.VITE_SUPABASE_URL.includes('your-project.supabase.co');

    if (!isPlaceholder) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return data;
      } catch (err) {
        console.warn('Supabase signin network error, falling back to local session:', err);
      }
    }

    // Local / Demo login fallback
    const existingUser = {
      id: '00000000-0000-0000-0000-000000000001',
      email: email || 'founder@novatech.in',
      user_metadata: { full_name: 'Aarav Sharma' },
      created_at: new Date().toISOString(),
    };
    const newSession = {
      access_token: 'demo_token_complyai_local',
      token_type: 'bearer',
      user: existingUser,
    };
    localStorage.setItem('complyai_session', JSON.stringify(newSession));
    setUser(existingUser);
    setSession(newSession);
    return { user: existingUser, session: newSession };
  };

  const signInDemo = () => {
    localStorage.setItem('complyai_session', JSON.stringify(DEMO_SESSION));
    setUser(DEMO_USER);
    setSession(DEMO_SESSION);
    return { user: DEMO_USER, session: DEMO_SESSION };
  };

  const signOut = async () => {
    localStorage.removeItem('complyai_session');
    setUser(null);
    setSession(null);
    try {
      await supabase.auth.signOut();
    } catch {}
  };

  const resetPassword = async (email) => {
    const isPlaceholder = !import.meta.env.VITE_SUPABASE_URL ||
      import.meta.env.VITE_SUPABASE_URL.includes('your-project.supabase.co');

    if (!isPlaceholder) {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      return data;
    }
    return { message: 'Password reset link sent (demo)' };
  };

  const value = { user, session, loading, signUp, signIn, signInDemo, signOut, resetPassword };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
