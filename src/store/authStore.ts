import { create } from 'zustand';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { User, UserRole } from '../types/auth';

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<{ error: Error | null }>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  
  login: async (email: string, password: string) => {
    try {
      // First, get the user data from app_users to verify the credentials
      const { data: userData, error: userError } = await supabase
        .from('app_users')
        .select('*')
        .eq('email', email)
        .single();

      if (userError) {
        throw new Error('Invalid credentials');
      }

      // Set the user in state
      const user: User = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role as UserRole
      };

      set({ user });
      return { error: null };
    } catch (error) {
      console.error('Login error:', error);
      return { error: error as Error };
    }
  },

  logout: async () => {
    try {
      set({ user: null });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
}));