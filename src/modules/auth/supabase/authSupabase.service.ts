import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { IAuthSupabaseService } from './authSupabase.types';

export class AuthSupabaseService implements IAuthSupabaseService {
  private readonly supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY in environment variables');
    }

    this.supabase = createClient(supabaseUrl, supabaseAnonKey);
  }

  async signUp(email: string, password: string, role?: string): Promise<any> {
    const { data, error } = await this.supabase.auth.signUp({ 
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
  }

  async signIn(email: string, password: string): Promise<{ user: any; session: any }> {
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    
    // Return both user and session data
    return {
      user: data.user,
      session: data.session
    };
  }

  async getUser(token: string): Promise<any> {
    const { data, error } = await this.supabase.auth.getUser(token);
    if (error) throw new Error(error.message);
    return data.user;
  }

  async signOut(): Promise<boolean> {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw new Error(error.message);
    return true;
  }

  async validateToken(token: string): Promise<any> {
    try {
      const { data, error } = await this.supabase.auth.getUser(token);
      if (error) throw new Error(error.message);
      return data.user;
    } catch (error: any) {
      // Try to refresh the token if it's expired
      if (error.message?.includes('JWT')) {
        try {
          const { data, error: refreshError } = await this.supabase.auth.refreshSession();
          if (refreshError) throw new Error(refreshError.message);
          return data.user;
        } catch (refreshErr: any) {
          throw new Error('Token is invalid and cannot be refreshed');
        }
      }
      throw error;
    }
  }

  async getSession(): Promise<any> {
    const { data, error } = await this.supabase.auth.getSession();
    if (error) throw new Error(error.message);
    return data.session;
  }

  async getAccessToken(): Promise<string | undefined> {
    const { data, error } = await this.supabase.auth.getSession();
    if (error) throw new Error(error.message);
    return data.session?.access_token;
  }

  async updateUserRole(userId: string, role: string): Promise<any> {
    const { data, error } = await this.supabase.auth.admin.updateUserById(userId, {
      user_metadata: { role }
    });
    if (error) throw new Error(error.message);
    return data.user;
  }

  async googleSignIn(idToken: string, role: string = 'customer'): Promise<{ user: any; session: any }> {
    const { data, error } = await this.supabase.auth.signInWithIdToken({
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
  }

  async deleteUser(userId: string): Promise<any> {
    const { data, error } = await this.supabase.auth.admin.deleteUser(userId);
    if (error) throw new Error(error.message);
    return data;
  }

  async deleteUserData(userId: string, tableName: string): Promise<any> {
    const { data, error } = await this.supabase
      .from(tableName)
      .delete()
      .eq('user_id', userId);
    
    if (error) throw new Error(error.message);
    return data;
  }

  async softDeleteUser(userId: string, tableName: string = 'profiles'): Promise<any> {
    const { data, error } = await this.supabase
      .from(tableName)
      .update({ 
        is_deleted: true, 
        deleted_at: new Date().toISOString() 
      })
      .eq('user_id', userId);
    
    if (error) throw new Error(error.message);
    return data;
  }

  async completeUserDeletion(userId: string, relatedTables: string[] = []): Promise<{ success: boolean; message: string }> {
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
  }

  async resetPassword(email: string): Promise<any> {
    const { data, error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password`,
    });
    
    if (error) throw new Error(error.message);
    return data;
  }

  async updatePassword(token: string, newPassword: string): Promise<any> {
    const { data, error } = await this.supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) throw new Error(error.message);
    return data.user;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<any> {
    // First verify current password by attempting to sign in
    const { data: signInData, error: signInError } = await this.supabase.auth.signInWithPassword({
      email: '', // We'll need to get this from the current user
      password: currentPassword
    });
    
    if (signInError) throw new Error('Current password is incorrect');
    
    // Update password
    const { data, error } = await this.supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) throw new Error(error.message);
    return data.user;
  }

  async verifyResetToken(token: string): Promise<any> {
    const { data, error } = await this.supabase.auth.getUser(token);
    if (error) throw new Error(error.message);
    return data.user;
  }
}

// Export singleton instance for backward compatibility
export const authSupabaseService = new AuthSupabaseService();
