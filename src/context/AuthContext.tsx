import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { AppRole, Profile } from '@/types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: AppRole | null;
  permissions: string[];
  loading: boolean;
  signOut: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  role: null,
  permissions: [],
  loading: true,
  signOut: async () => { },
  fetchProfile: async () => { },
  hasPermission: () => false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (userId: string) => {
    try {
      // Explicitly select columns to avoid PostgREST 406 ambiguity
      // when many tables have foreign keys referencing profiles(user_id)
      const [profileRes, roleRes] = await Promise.all([
        supabase.from('profiles')
          .select('id, user_id, full_name, email, avatar_url, is_active, created_at, updated_at')
          .eq('user_id', userId)
          .maybeSingle(),
        supabase.from('user_roles').select('id, user_id, role').eq('user_id', userId).maybeSingle(),
      ]);

      if (profileRes.data) setProfile(profileRes.data as unknown as Profile);
      if (roleRes.data) {
        const userRole = (roleRes.data as unknown as { role: AppRole }).role;
        setRole(userRole);

        // Fetch permissions for this role
        const { data: perms } = await supabase
          .from('role_permissions' as any)
          .select('permissions(name)')
          .eq('role', userRole) as any;

        if (perms) {
          setPermissions(perms.map((p: any) => p.permissions.name));
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await (supabase.from('activity_logs') as any).insert([{
            user_id: session.user.id,
            action: 'LOGIN',
            entity_type: 'auth',
            created_at: new Date().toISOString()
          }] as any);
          setTimeout(() => fetchUserData(session.user.id), 0);
        } else {
          setProfile(null);
          setRole(null);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setRole(null);
  };

  const fetchProfile = async () => {
    if (user) await fetchUserData(user.id);
  };

  const hasPermission = (permission: string) => {
    return role === 'admin' || role === 'superadmin' || permissions.includes(permission);
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, role, permissions, loading, signOut, fetchProfile, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};
