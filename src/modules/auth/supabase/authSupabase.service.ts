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
  },

  // Google sign-in method
  async googleSignIn(idToken: string, role: string = 'customer') {
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken
    });
    
    if (error) throw new Error(error.message);
    
    // Update user metadata with role after successful sign-in
    if (data.user) {
      try {
        await this.updateUserRole(data.user.id, role);
      } catch (roleError) {
        console.warn('Could not update user role:', roleError);
      }
    }
    
    return {
      user: data.user,
      session: data.session
    };
  },

  async deleteUser(userId: string) {
    const { data, error } = await supabase.auth.admin.deleteUser(userId);
    if (error) throw new Error(error.message);
    return data;
  },

  // Method to delete user data from custom tables (requires appropriate RLS policies)
  async deleteUserData(userId: string, tableName: string) {
    const { data, error } = await supabase
      .from(tableName)
      .delete()
      .eq('user_id', userId); // Assuming your table has a user_id column
    
    if (error) throw new Error(error.message);
    return data;
  },

  // Method to soft delete user (mark as deleted instead of removing)
  async softDeleteUser(userId: string, tableName: string = 'profiles') {
    const { data, error } = await supabase
      .from(tableName)
      .update({ 
        is_deleted: true, 
        deleted_at: new Date().toISOString() 
      })
      .eq('user_id', userId);
    
    if (error) throw new Error(error.message);
    return data;
  },

  // Method to completely remove user (auth + all related data)
  async completeUserDeletion(userId: string, relatedTables: string[] = []) {
    try {
      // Delete from related tables first
      for (const table of relatedTables) {
        await this.deleteUserData(userId, table);
      }
      
      // Finally delete the auth user
      await this.deleteUser(userId);
      
      return { success: true, message: 'User completely deleted' };
    } catch (error: any) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  },

  // Password reset methods
  async resetPassword(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password`,
    });
    
    if (error) throw new Error(error.message);
    return data;
  },

  async updatePassword(token: string, newPassword: string) {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) throw new Error(error.message);
    return data.user;
  },

  async changePassword(currentPassword: string, newPassword: string) {
    // First verify current password by attempting to sign in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: '', // We'll need to get this from the current user
      password: currentPassword
    });
    
    if (signInError) throw new Error('Current password is incorrect');
    
    // Update password
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) throw new Error(error.message);
    return data.user;
  },

  async verifyResetToken(token: string) {
    const { data, error } = await supabase.auth.getUser(token);
    if (error) throw new Error(error.message);
    return data.user;
  },

};
