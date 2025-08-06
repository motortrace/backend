import { Request, Response } from 'express';
import { authSupabaseService } from './authSupabase.service';
import { AuthenticatedRequest } from '../../../shared/types/auth.types';
import prisma from '../../../infrastructure/database/prisma';

export async function signUp(req: Request, res: Response) {
  try {
    const { email, password, role } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const data = await authSupabaseService.signUp(email, password, role);
    res.status(201).json({ message: 'User registered successfully', data });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Registration failed' });
  }
}

export async function signIn(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const data = await authSupabaseService.signIn(email, password);
    
    // Debug: Log what the service returned
    console.log('🔍 Service returned:', JSON.stringify(data, null, 2));
    
    // Return user data and session info including access token
    res.status(200).json({ 
      message: 'Login successful', 
      data: {
        user: data.user,
        access_token: data.session?.access_token,
        refresh_token: data.session?.refresh_token,
        expires_at: data.session?.expires_at
      }
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Login failed' });
  }
}

export async function signOut(req: Request, res: Response) {
  try {
    await authSupabaseService.signOut();
    res.status(200).json({ message: 'Signed out successfully' });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Sign out failed' });
  }
}

// Get current user profile
export async function getMe(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Get the full user data from Supabase
    const supabaseUser = await authSupabaseService.getUser(req.headers.authorization?.replace('Bearer ', '') || '');

    // For now, we'll return just the Supabase user data
    // TODO: Add Prisma profile lookup once client is properly generated
    res.json({
      user: {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
        // Include additional Supabase user data
        emailConfirmed: supabaseUser?.email_confirmed_at ? true : false,
        createdAt: supabaseUser?.created_at,
        lastSignIn: supabaseUser?.last_sign_in_at,
      },
      profile: null, // TODO: Add Prisma profile lookup
      message: 'User profile retrieved successfully'
    });
  } catch (error: any) {
    console.error('getMe error:', error);
    res.status(500).json({ 
      error: 'Could not retrieve user profile',
      message: error.message 
    });
  }
}

// Complete user onboarding
export async function completeOnboarding(req: AuthenticatedRequest, res: Response) {
  try {
    console.log('🔍 Onboarding request received:', {
      headers: req.headers,
      body: req.body,
      user: req.user
    });

    if (!req.user) {
      console.log('❌ No user found in request');
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { name, contact, profileImage } = req.body;

    console.log('📝 Onboarding data:', { name, contact, profileImage });

    // Validate required fields
    if (!name || !contact) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ error: 'Name and contact are required' });
    }

    // Save onboarding data to database
    try {
      // Create or update user profile
      const userProfile = await prisma.userProfile.upsert({
        where: { supabaseUserId: req.user.id },
        update: {
          name,
          phone: contact,
          profileImage: profileImage || null,
          isRegistrationComplete: true
        },
        create: {
          supabaseUserId: req.user.id,
          name,
          phone: contact,
          profileImage: profileImage || null,
          isRegistrationComplete: true
        }
      });

      console.log('✅ User profile saved:', userProfile);

      // If user is a customer, create customer record
      if (req.user.role === 'customer') {
        const customer = await prisma.customer.upsert({
          where: { userProfileId: userProfile.id },
          update: {
            name,
            email: req.user.email,
            phone: contact
          },
          create: {
            userProfileId: userProfile.id,
            name,
            email: req.user.email,
            phone: contact
          }
        });

        console.log('✅ Customer record saved:', customer);
      }

      const response = {
        message: 'Onboarding completed successfully',
        user: {
          id: req.user.id,
          email: req.user.email,
          role: req.user.role,
          name,
          contact,
          profileImage,
          isRegistrationComplete: true
        }
      };

      console.log('✅ Sending onboarding response:', response);
      res.json(response);
    } catch (dbError: any) {
      console.error('❌ Database error:', dbError);
      res.status(500).json({ 
        error: 'Database error during onboarding',
        message: dbError.message 
      });
    }
  } catch (error: any) {
    console.error('❌ Onboarding error:', error);
    res.status(500).json({ 
      error: 'Could not complete onboarding',
      message: error.message 
    });
  }
}

// Google authentication
export async function googleAuth(req: Request, res: Response) {
  try {
    const { idToken, role = 'customer' } = req.body;

    if (!idToken) {
      return res.status(400).json({ error: 'Google ID token is required' });
    }

    // TODO: Implement Google token verification with Supabase
    // For now, create a mock response
    const mockUser = {
      id: `google-${Date.now()}`,
      email: 'google-user@example.com',
      role: role,
      isRegistrationComplete: false
    };

    // TODO: Generate actual JWT token
    const mockToken = 'mock-jwt-token';

    res.json({
      message: 'Google authentication successful',
      data: {
        user: mockUser,
        access_token: mockToken,
        refresh_token: 'mock-refresh-token',
        expires_at: Date.now() + 3600000 // 1 hour from now
      }
    });
  } catch (error: any) {
    console.error('Google auth error:', error);
    res.status(500).json({ 
      error: 'Google authentication failed',
      message: error.message 
    });
  }
}
