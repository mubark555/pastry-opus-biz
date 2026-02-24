import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

export type AppRole = 'super_admin' | 'sales_admin' | 'kitchen' | 'delivery' | 'finance' | 'client' | 'demo_admin';

interface AuthState {
  user: User | null;
  session: Session | null;
  role: AppRole | null;
  isDemo: boolean;
  loading: boolean;
  profileClientId: string | null;
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  signInAsDemo: () => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    role: null,
    isDemo: false,
    loading: true,
    profileClientId: null,
  });

  const fetchRole = async (userId: string) => {
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .limit(1)
      .single();
    
    const role = (data?.role as AppRole) || null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('client_id')
      .eq('user_id', userId)
      .limit(1)
      .single();

    return { role, clientId: profile?.client_id || null };
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { role, clientId } = await fetchRole(session.user.id);
        setState({
          user: session.user,
          session,
          role,
          isDemo: role === 'demo_admin',
          loading: false,
          profileClientId: clientId,
        });
      } else {
        setState({ user: null, session: null, role: null, isDemo: false, loading: false, profileClientId: null });
      }
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { role, clientId } = await fetchRole(session.user.id);
        setState({
          user: session.user,
          session,
          role,
          isDemo: role === 'demo_admin',
          loading: false,
          profileClientId: clientId,
        });
      } else {
        setState(prev => ({ ...prev, loading: false }));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName }, emailRedirectTo: window.location.origin },
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const signInAsDemo = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email: 'demo@sweetops.app',
      password: 'demo123456',
    });
    return { error: error as Error | null };
  };

  return (
    <AuthContext.Provider value={{ ...state, signIn, signUp, signOut, signInAsDemo }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
