import { useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { AuthContext, UserProfile, Organization, Role } from './AuthContext';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfileAndOrg(session.user.id, session.user.email ?? '');
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await loadProfileAndOrg(session.user.id, session.user.email ?? '');
        } else {
          setProfile(null);
          setOrganization(null);
          setRole(null);
          setLoading(false);
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProfileAndOrg = async (userId: string, email: string) => {
    try {
      // 1. Load or create user profile
      const { data: profileDataResult, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') throw profileError;
      
      let profileData = profileDataResult;
      
      if (!profileData) {
        // Auto-create profile if missing (e.g. added manually in Supabase Auth)
        const fullName = email.split('@')[0];
        const { data: newProfile, error: createError } = await supabase
          .from('users')
          .insert({
            id: userId,
            email: email,
            full_name: fullName,
          })
          .select()
          .single();
        
        if (createError) throw createError;
        profileData = newProfile;
      }
      
      if (profileData) {
        setProfile(profileData as UserProfile);
        setIsSuperAdmin(!!profileData.is_super_admin);
      }

      // 2. Load or create organization membership
      const { data: membershipDataResult, error: memError } = await supabase
        .from('memberships')
        .select(`
          role,
          organizations (*)
        `)
        .eq('user_id', userId)
        .limit(1)
        .maybeSingle();

      if (memError && memError.code !== 'PGRST116') throw memError;

      let membershipData = membershipDataResult;

      if (!membershipData || !membershipData.organizations) {
        // Auto-create default organization if missing
        const orgName = `${profileData?.full_name || 'My'}'s Workspace`;
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .insert({
            name: orgName,
            slug: `${orgName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Math.random().toString(36).substring(2, 7)}`,
          })
          .select()
          .single();

        if (orgError) throw orgError;

        if (orgData) {
          const { data: newMembership, error: createMemError } = await supabase
            .from('memberships')
            .insert({
              user_id: userId,
              organization_id: orgData.id,
              role: 'owner',
            })
            .select(`
              role,
              organizations (*)
            `)
            .single();
          
          if (createMemError) throw createMemError;
          membershipData = newMembership;
        }
      }

      if (membershipData && membershipData.organizations) {
        const org = Array.isArray(membershipData.organizations) 
          ? membershipData.organizations[0] 
          : membershipData.organizations;
        
        console.log('Successfully loaded organization member profile');
        setOrganization(org as Organization);
        setRole(membershipData.role as Role);
      } else {
        console.warn('User has no organization memberships. Workspace set to null.');
        setOrganization(null);
        setRole(null);
      }
    } catch (error) {
      console.error('CRITICAL: Failed to load or initialize workspace context.', error);
      // Ensure we don't block the UI forever
      setOrganization(null);
      setRole(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;

    if (authData.user) {
      const userId = authData.user.id;
      
      const { error: profileError } = await supabase.from('users').insert({
        id: userId,
        email,
        full_name: fullName,
      });

      if (profileError) throw profileError;

      const orgName = `${fullName}'s Workspace`;
      const { data: orgData, error: orgError } = await supabase.from('organizations').insert({
        name: orgName,
        slug: `${orgName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Math.random().toString(36).substring(2, 7)}`,
      }).select().single();

      if (orgError) throw orgError;

      if (orgData) {
        const { error: memError } = await supabase.from('memberships').insert({
          user_id: userId,
          organization_id: orgData.id,
          role: 'owner',
        });
        
        if (memError) throw memError;
        
        await loadProfileAndOrg(userId, email);
      }
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const refreshAuth = async () => {
    if (user) {
      await loadProfileAndOrg(user.id, user.email ?? '');
    }
  };

  const value = {
    user,
    profile,
    organization,
    role,
    session,
    loading,
    isAdmin: role === 'owner' || role === 'admin' || !!profile?.is_super_admin,
    isManager: role === 'owner' || role === 'admin' || role === 'manager' || !!profile?.is_super_admin,
    isSuperAdmin,
    signIn,
    signUp,
    signOut,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
