import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY in environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const authSupabaseService = {
  async signUp(email: string, password: string, role?: string) {
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          role: role || 'customer' // Default to customer if no role specified
        }
      }
    });
    if (error) throw new Error(error.message);
    return data.user;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    
    // Return both user and session data
    return {
      user: data.user,
      session: data.session
    };
  },

  async getUser(token: string) {
    const { data, error } = await supabase.auth.getUser(token);
    if (error) throw new Error(error.message);
    return data.user;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
    return true;
  },

  // New method to validate and refresh tokens
  async validateToken(token: string) {
    try {
      const { data, error } = await supabase.auth.getUser(token);
      if (error) throw new Error(error.message);
      return data.user;
    } catch (error: any) {
      // Try to refresh the token if it's expired
      if (error.message?.includes('JWT')) {
        try {
          const { data, error: refreshError } = await supabase.auth.refreshSession();
          if (refreshError) throw new Error(refreshError.message);
          return data.user;
        } catch (refreshErr: any) {
          throw new Error('Token is invalid and cannot be refreshed');
        }
      }
      throw error;
    }
  },

  // Method to get session info (useful for debugging)
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw new Error(error.message);
    return data.session;
  },

  // Method to get current access token
  async getAccessToken() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw new Error(error.message);
    return data.session?.access_token;
  },

  // Method to update user role
  async updateUserRole(userId: string, role: string) {
    const { data, error } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: { role }
    });
    if (error) throw new Error(error.message);
    return data.user;
  }
};
