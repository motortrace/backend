import { Request, Response } from 'express';
import { authSupabaseService } from './authSupabase.service';
import { AuthenticatedRequest } from '../../../shared/types/auth.types';
import prisma from '../../../infrastructure/database/prisma';
import emailService from '../../../shared/utils/email.helper';
import otpService from '../../../shared/utils/otp.helper';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

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

     // Get customerId if user is a customer
     let customerId = null;
     const userRole = (data.user as any)?.user_metadata?.role || 'customer';
     if (userRole === 'customer') {
       try {
         const userProfile = await prisma.userProfile.findUnique({
           where: { supabaseUserId: data.user?.id },
           include: { customer: true }
         });
         customerId = userProfile?.customer?.id || null;
         console.log('🔍 Customer ID found:', customerId);
       } catch (customerError) {
         console.warn('⚠️ Could not fetch customer ID:', customerError);
         // Don't fail the login if customer lookup fails
         customerId = null;
       }
     }

     // Store successful login activity (don't fail login if this fails)
     try {
       await prisma.loginActivity.create({
         data: {
           userId: data.user?.id || '',
           action: 'LOGIN_SUCCESS',
           deviceInfo: req.headers['user-agent'] || 'Unknown',
           ipAddress: req.ip || req.connection?.remoteAddress || 'Unknown',
           userAgent: req.headers['user-agent'] || 'Unknown',
           location: 'Unknown' // Could be enhanced with IP geolocation service
         }
       });
       console.log('✅ Login activity recorded');
     } catch (activityError: any) {
       console.warn('⚠️ Could not record login activity (non-critical):', activityError?.message || activityError);
     }

     // Create or update user session (don't fail login if this fails)
     try {
       const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
       const expiresAt = new Date();
       expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour session

       await prisma.userSession.upsert({
         where: { sessionId: sessionId },
         update: {
           lastActivity: new Date(),
           expiresAt: expiresAt
         },
         create: {
           userId: data.user?.id || '',
           sessionId: sessionId,
           deviceInfo: req.headers['user-agent'] || 'Unknown',
           ipAddress: req.ip || req.connection?.remoteAddress || 'Unknown',
           userAgent: req.headers['user-agent'] || 'Unknown',
           location: 'Unknown',
           isActive: true,
           lastActivity: new Date(),
           expiresAt: expiresAt
         }
       });
       console.log('✅ User session created/updated');
     } catch (sessionError: any) {
       console.warn('⚠️ Could not create user session (non-critical):', sessionError?.message || sessionError);
     }

     // Return user data with flattened metadata used by mobile app
     res.status(200).json({
       message: 'Login successful',
       data: {
         user: {
           id: data.user?.id,
           email: data.user?.email,
           role: userRole,
           isRegistrationComplete: (data.user as any)?.user_metadata?.isRegistrationComplete === true,
           customerId: customerId
         },
         access_token: data.session?.access_token,
         refresh_token: data.session?.refresh_token,
         expires_at: data.session?.expires_at
       }
     });
   } catch (error: any) {
     // Store failed login attempt
     try {
       await prisma.loginActivity.create({
         data: {
           userId: 'unknown', // We don't know the user ID for failed logins
           action: 'LOGIN_FAILED',
           deviceInfo: req.headers['user-agent'] || 'Unknown',
           ipAddress: req.ip || req.connection?.remoteAddress || 'Unknown',
           userAgent: req.headers['user-agent'] || 'Unknown',
           location: 'Unknown',
           reason: error.message || 'Login failed'
         }
       });
     } catch (activityError) {
       console.warn('⚠️ Could not record failed login activity:', activityError);
     }

     res.status(400).json({ error: error.message || 'Login failed' });
   }
 }

export async function signOut(req: Request, res: Response) {
   try {
     // Get user from request if available (authenticated request)
     const userId = (req as any).user?.id;

     if (userId) {
       // Record logout activity
       try {
         await prisma.loginActivity.create({
           data: {
             userId: userId,
             action: 'LOGOUT',
             deviceInfo: req.headers['user-agent'] || 'Unknown',
             ipAddress: req.ip || req.connection?.remoteAddress || 'Unknown',
             userAgent: req.headers['user-agent'] || 'Unknown',
             location: 'Unknown'
           }
         });
         console.log('✅ Logout activity recorded');
       } catch (activityError) {
         console.warn('⚠️ Could not record logout activity:', activityError);
       }

       // Deactivate user sessions (optional - could be done based on session token)
       try {
         // For now, we'll just mark recent sessions as inactive
         // In a production app, you'd invalidate the specific session
         await prisma.userSession.updateMany({
           where: {
             userId: userId,
             isActive: true,
             lastActivity: {
               lt: new Date(Date.now() - 24 * 60 * 60 * 1000) // Older than 24 hours
             }
           },
           data: {
             isActive: false
           }
         });
         console.log('✅ Old user sessions deactivated');
       } catch (sessionError) {
         console.warn('⚠️ Could not deactivate user sessions:', sessionError);
       }
     }

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

    // Load profile from Prisma
    const userProfile = await prisma.userProfile.findUnique({
      where: { supabaseUserId: req.user.id },
      select: {
        name: true,
        phone: true,
        profileImage: true,
        isRegistrationComplete: true
      }
    });

    // For now, we'll return Supabase user data plus Prisma profile data
    console.log('🔍 Supabase user:', supabaseUser);
    res.json({
      user: {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
        // Additional Supabase user data
        emailConfirmed: supabaseUser?.email_confirmed_at ? true : false,
        createdAt: supabaseUser?.created_at,
        lastSignIn: supabaseUser?.last_sign_in_at,
        // Prisma profile data
        fullName: userProfile?.name || undefined,
        phone: userProfile?.phone || undefined,
        profileImage: userProfile?.profileImage || undefined,
        isRegistrationComplete: userProfile?.isRegistrationComplete ?? false
      },
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

    const { name, contact, profileImageUrl } = req.body;

    console.log('📝 Onboarding data:', { name, contact, profileImageUrl });

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
          profileImage: profileImageUrl || null,
          isRegistrationComplete: true
        },
        create: {
          supabaseUserId: req.user.id,
          name,
          phone: contact,
          profileImage: profileImageUrl || null,
          isRegistrationComplete: true
        }
      });

      console.log('✅ User profile saved:', userProfile);

      // If user is a customer, create customer record
      let customer = null;
      if (req.user.role === 'customer') {
        customer = await prisma.customer.upsert({
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

      // Also mark registration complete in Supabase user metadata so login returns it
      try {
        await supabaseAdmin.auth.admin.updateUserById(req.user.id, {
          user_metadata: {
            ...(typeof (req.user as any).user_metadata === 'object' ? (req.user as any).user_metadata : {}),
            isRegistrationComplete: true,
            name,
            phone: contact,
            profileImageUrl: profileImageUrl || null
          }
        });
        console.log('✅ Supabase user metadata updated with registration completion');
      } catch (metaErr) {
        console.warn('⚠️ Failed to update Supabase user metadata:', metaErr);
      }

      // Get customerId for the response
      const customerId = customer?.id || null;

      const response = {
        message: 'Onboarding completed successfully',
        user: {
          id: req.user.id,
          email: req.user.email,
          role: req.user.role,
          name,
          contact,
          profileImageUrl,
          isRegistrationComplete: true,
          customerId: customerId
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

// Get user header data (name and profile image)
export async function getHeader(req: AuthenticatedRequest, res: Response) {
  try {
    console.log('🔍 Header request received for user:', req.user?.id);

    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Get user profile from database
    const userProfile = await prisma.userProfile.findUnique({
      where: { supabaseUserId: req.user.id },
      select: {
        id: true,
        name: true,
        profileImage: true,
        isRegistrationComplete: true
      }
    });

    if (!userProfile) {
      return res.status(404).json({
        error: 'User profile not found',
        message: 'Please complete your profile setup'
      });
    }

    // Get customerId if user is a customer
    let customerId = null;
    if (req.user.role === 'customer') {
      try {
        const customer = await prisma.customer.findFirst({
          where: { userProfileId: userProfile.id }
        });
        customerId = customer?.id || null;
        console.log('🔍 Customer ID found in header:', customerId);
      } catch (customerError) {
        console.warn('⚠️ Could not fetch customer ID in header:', customerError);
      }
    }

    // Build absolute profile image URL for mobile clients (Android emulator cannot resolve localhost)
    const apiBaseUrl = process.env.API_BASE_URL || `${req.protocol}://${req.get('host')}`;
    const isMobileClient = req.headers['x-client-type'] === 'mobile';
    const normalizeImageUrl = (imagePath: string | null | undefined): string | null => {
      if (!imagePath) return null;
      if (imagePath.startsWith('http')) {
        // For mobile clients, replace 127.0.0.1 with the API host IP so they can access Supabase storage
        if (isMobileClient && imagePath.includes('127.0.0.1')) {
          const host = req.get('host')?.split(':')[0] || '10.0.2.2';
          return imagePath.replace('127.0.0.1', host);
        }
        return imagePath;
      }
      const base = apiBaseUrl;
      const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
      return `${base}${path}`;
    };

    const response = {
      success: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
        fullname: userProfile.name || 'User',
        profile_image: normalizeImageUrl(userProfile.profileImage),
        isRegistrationComplete: userProfile.isRegistrationComplete,
        customerId: customerId
      },
      message: 'User header data retrieved successfully'
    };

    // console.log('✅ Header data sent:', { 
    //   fullname: response.user.fullname,
    //   hasImage: !!response.user.profile_image 
    // });

    res.json(response);
  } catch (error: any) {
    console.error('❌ Header error:', error);
    res.status(500).json({ 
      error: 'Could not retrieve user header data',
      message: error.message 
    });
  }
}

// Get full profile (name, phone, image)
export async function getProfile(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const userProfile = await prisma.userProfile.findUnique({
      where: { supabaseUserId: req.user.id },
      select: {
        name: true,
        phone: true,
        profileImage: true,
        isRegistrationComplete: true
      }
    });

    console.log('🔍 User profile:', userProfile);

    if (!userProfile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const apiBaseUrl = process.env.API_BASE_URL || `${req.protocol}://${req.get('host')}`;
    const isMobileClient = req.headers['x-client-type'] === 'mobile';
    const normalizeImageUrl = (imagePath: string | null | undefined): string | null => {
      if (!imagePath) return null;
      if (imagePath.startsWith('http')) {
        // For mobile clients, replace 127.0.0.1 with the API host IP so they can access Supabase storage
        if (isMobileClient && imagePath.includes('127.0.0.1')) {
          const host = req.get('host')?.split(':')[0] || '10.0.2.2';
          return imagePath.replace('127.0.0.1', host);
        }
        return imagePath;
      }
      const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
      return `${apiBaseUrl}${path}`;
    };

    return res.json({
      success: true,
      profile: {
        fullName: userProfile.name || '',
        phoneNumber: userProfile.phone || '',
        profileImageUrl: normalizeImageUrl(userProfile.profileImage),
        isRegistrationComplete: userProfile.isRegistrationComplete
      }
    });
  } catch (error: any) {
    console.error('❌ getProfile error:', error);
    return res.status(500).json({ error: 'Failed to load profile', message: error.message });
  }
}

// Update profile (name, phone, image)
export async function updateProfile(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { name, phone, profileImageUrl } = req.body as { name?: string; phone?: string; profileImageUrl?: string | null };

    const updated = await prisma.userProfile.upsert({
      where: { supabaseUserId: req.user.id },
      update: {
        name: name ?? undefined,
        phone: phone ?? undefined,
        profileImage: profileImageUrl === undefined ? undefined : (profileImageUrl || null)
      },
      create: {
        supabaseUserId: req.user.id,
        name: name || '',
        phone: phone || '',
        profileImage: profileImageUrl || null,
        isRegistrationComplete: true
      }
    });

    const apiBaseUrl = process.env.API_BASE_URL || `${req.protocol}://${req.get('host')}`;
    const isMobileClient = req.headers['x-client-type'] === 'mobile';
    const normalizeImageUrl = (imagePath: string | null | undefined): string | null => {
      if (!imagePath) return null;
      if (imagePath.startsWith('http')) {
        // For mobile clients, replace 127.0.0.1 with the API host IP so they can access Supabase storage
        if (isMobileClient && imagePath.includes('127.0.0.1')) {
          const host = req.get('host')?.split(':')[0] || '10.0.2.2';
          return imagePath.replace('127.0.0.1', host);
        }
        return imagePath;
      }
      const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
      return `${apiBaseUrl}${path}`;
    };

    return res.json({
      success: true,
      profile: {
        fullName: updated.name || '',
        phoneNumber: updated.phone || '',
        profileImageUrl: normalizeImageUrl(updated.profileImage),
        isRegistrationComplete: updated.isRegistrationComplete
      }
    });
  } catch (error: any) {
    console.error('❌ updateProfile error:', error);
    return res.status(500).json({ error: 'Failed to update profile', message: error.message });
  }
}

// Google authentication
export async function googleAuth(req: Request, res: Response) {
   try {
     const { idToken, role = 'customer' } = req.body;

     if (!idToken) {
       return res.status(400).json({ error: 'Google ID token is required' });
     }

     console.log('🔍 Google auth request received:', { role });

     // Use Supabase to verify the Google ID token
     const data = await authSupabaseService.googleSignIn(idToken, role);

     console.log('✅ Google auth successful:', {
       userId: data.user?.id,
       email: data.user?.email,
       hasSession: !!data.session
     });

     // Get customerId if user is a customer
     let customerId = null;
     const userRole = data.user?.user_metadata?.role || role;
     if (userRole === 'customer') {
       try {
         const userProfile = await prisma.userProfile.findUnique({
           where: { supabaseUserId: data.user?.id },
           include: { customer: true }
         });
         customerId = userProfile?.customer?.id || null;
         console.log('🔍 Customer ID found for Google auth:', customerId);
       } catch (customerError) {
         console.warn('⚠️ Could not fetch customer ID for Google auth:', customerError);
       }
     }

     // Store successful Google login activity (don't fail login if this fails)
     try {
       await prisma.loginActivity.create({
         data: {
           userId: data.user?.id || '',
           action: 'LOGIN_SUCCESS',
           deviceInfo: req.headers['user-agent'] || 'Unknown',
           ipAddress: req.ip || req.connection?.remoteAddress || 'Unknown',
           userAgent: req.headers['user-agent'] || 'Unknown',
           location: 'Unknown'
         }
       });
       console.log('✅ Google login activity recorded');
     } catch (activityError: any) {
       console.warn('⚠️ Could not record Google login activity (non-critical):', activityError?.message || activityError);
     }

     // Create or update user session for Google auth (don't fail login if this fails)
     try {
       const sessionId = `google_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
       const expiresAt = new Date();
       expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour session

       await prisma.userSession.upsert({
         where: { sessionId: sessionId },
         update: {
           lastActivity: new Date(),
           expiresAt: expiresAt
         },
         create: {
           userId: data.user?.id || '',
           sessionId: sessionId,
           deviceInfo: req.headers['user-agent'] || 'Unknown',
           ipAddress: req.ip || req.connection?.remoteAddress || 'Unknown',
           userAgent: req.headers['user-agent'] || 'Unknown',
           location: 'Unknown',
           isActive: true,
           lastActivity: new Date(),
           expiresAt: expiresAt
         }
       });
       console.log('✅ Google user session created/updated');
     } catch (sessionError: any) {
       console.warn('⚠️ Could not create Google user session (non-critical):', sessionError?.message || sessionError);
     }

     res.json({
       message: 'Google authentication successful',
       data: {
         user: {
           id: data.user?.id,
           email: data.user?.email,
           role: userRole,
           isRegistrationComplete: data.user?.user_metadata?.isRegistrationComplete || false,
           customerId: customerId
         },
         access_token: data.session?.access_token,
         refresh_token: data.session?.refresh_token,
         expires_at: data.session?.expires_at
       }
     });
   } catch (error: any) {
     console.error('❌ Google auth error:', error);
     res.status(400).json({
       error: 'Google authentication failed',
       message: error.message
     });
   }
 }

export async function deleteAccount(req: AuthenticatedRequest, res: Response) {
  try {
    console.log('🔍 Delete account request received for user:', req.user?.id);

    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const userId = req.user.id;

    // Start a transaction to ensure data consistency
    await prisma.$transaction(async (prismaTransaction) => {
      console.log('🗑️ Starting account deletion process...');

      // 1. Get user profile to check if exists and get related IDs
      const userProfile = await prismaTransaction.userProfile.findUnique({
        where: { supabaseUserId: userId },
        include: {
          customer: true,
          // Add other relations as needed based on your schema
        }
      });

      if (userProfile) {
        console.log('📋 User profile found, deleting related data...');

        // 2. Delete customer-related data if user is a customer
        if (userProfile.customer) {
          console.log('🏷️ Deleting customer-related records...');
          
          // Delete appointments (if you have this table)
          try {
            await prismaTransaction.appointment.deleteMany({
              where: { customerId: userProfile.customer.id }
            });
            console.log('✅ Appointments deleted');
          } catch (error) {
            console.warn('⚠️ No appointments to delete or table does not exist');
          }

          // Delete customer vehicles first (due to foreign key constraints)
          try {
            await prismaTransaction.vehicle.deleteMany({
              where: { customerId: userProfile.customer.id }
            });
            console.log('✅ Customer vehicles deleted');
          } catch (error) {
            console.warn('⚠️ No vehicles to delete or error occurred:', error);
          }

          // Delete customer record
          await prismaTransaction.customer.delete({
            where: { id: userProfile.customer.id }
          });
          console.log('✅ Customer record deleted');
        }

        // 4. Delete user profile
        await prismaTransaction.userProfile.delete({
          where: { id: userProfile.id }
        });
        console.log('✅ User profile deleted');
      } else {
        console.log('⚠️ No user profile found, proceeding with auth deletion only');
      }
    });

    // 5. Delete user from Supabase Auth (this should be done last)
    try {
      await authSupabaseService.deleteUser(userId);
      console.log('✅ User deleted from Supabase Auth');
    } catch (authError: any) {
      console.error('❌ Failed to delete user from Supabase Auth:', authError);
      // Even if Supabase deletion fails, we've already cleaned up the database
      // You might want to log this for manual cleanup later
      console.warn('⚠️ Database cleanup completed but Supabase Auth deletion failed');
    }

    console.log('✅ Account deletion completed successfully');

    res.json({
      success: true,
      message: 'Account deleted successfully',
      data: {
        deletedUserId: userId,
        deletedAt: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('❌ Account deletion error:', error);
    
    // Check if it's a Prisma transaction error
    if (error.code === 'P2025') {
      return res.status(404).json({
        error: 'User profile not found',
        message: 'Account may have already been deleted'
      });
    }

    res.status(500).json({
      error: 'Could not delete account',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

// Request password reset with custom email
export async function requestPasswordReset(req: Request, res: Response) {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false,
        error: 'Email is required' 
      });
    }

    console.log('🔍 Password reset request for:', email);

    // Check if user exists in Supabase
    try {
      // Try to get user from Supabase to verify they exist
      const { data: users, error } = await supabaseAdmin.auth.admin.listUsers();
      
      if (error) {
        console.error('❌ Error checking users:', error);
        return res.status(500).json({
          success: false,
          error: 'Unable to verify user account'
        });
      }

      const userExists = users.users.some(user => user.email === email.toLowerCase());
      
      if (!userExists) {
        console.log('❌ User not found:', email);
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // Generate OTP
      const otp = otpService.storeOTP(email);
      
      // Send email with OTP
      const emailHtml = emailService.generatePasswordResetEmail(otp, email);
      const emailText = emailService.generatePasswordResetText(otp, email);
      
      await emailService.sendEmail({
        to: email,
        subject: 'MotorTrace - Password Reset Code',
        html: emailHtml,
        text: emailText
      });

      console.log('✅ Password reset email sent to:', email);

      res.json({
        success: true,
        message: 'Password reset code sent to your email',
        data: {
          email,
          sentAt: new Date().toISOString(),
          expiresIn: 600 // 10 minutes in seconds
        }
      });

    } catch (error: any) {
      console.error('❌ Password reset error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to send password reset email',
        message: error.message
      });
    }

  } catch (error: any) {
    console.error('❌ Password reset request error:', error);
    res.status(400).json({
      success: false,
      error: 'Could not process password reset request',
      message: error.message
    });
  }
}

// Reset password with OTP verification
export async function resetPassword(req: Request, res: Response) {
  try {
    const { email, otp, newPassword } = req.body;
    
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ 
        success: false,
        error: 'Email, OTP, and new password are required' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long'
      });
    }

    console.log('🔍 Password reset request for:', email);

    // First verify the OTP
    const verification = otpService.verifyOTP(email, otp);
    
    if (!verification.valid) {
      return res.status(400).json({
        success: false,
        error: verification.message,
        data: {
          remainingAttempts: otpService.getRemainingAttempts(email)
        }
      });
    }

    // OTP is valid, now reset the password using Supabase
    try {
      // Get user by email to get their ID
      const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (listError) {
        throw new Error('Unable to find user account');
      }

      const user = users.users.find(u => u.email === email.toLowerCase());
      
      if (!user) {
        throw new Error('User not found');
      }

      // Update password using Supabase admin
      const { data, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
        password: newPassword
      });

      if (updateError) {
        throw new Error(updateError.message);
      }

      console.log('✅ Password reset successfully for:', email);

      res.json({
        success: true,
        message: 'Password updated successfully',
        data: {
          userId: user.id,
          email: user.email,
          updatedAt: new Date().toISOString()
        }
      });

    } catch (error: any) {
      console.error('❌ Password update error:', error);
      res.status(500).json({
        success: false,
        error: 'Could not update password',
        message: error.message
      });
    }

  } catch (error: any) {
    console.error('❌ Password reset error:', error);
    res.status(400).json({
      success: false,
      error: 'Could not reset password',
      message: error.message
    });
  }
}

// Change password (for authenticated users)
export async function changePassword(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        error: 'User not authenticated' 
      });
    }

    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false,
        error: 'Current password and new password are required' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 6 characters long'
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        error: 'New password must be different from current password'
      });
    }

    const user = await authSupabaseService.changePassword(currentPassword, newPassword);

    res.json({
      success: true,
      message: 'Password changed successfully',
      data: {
        userId: user?.id,
        changedAt: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('❌ Password change error:', error);
    res.status(400).json({
      success: false,
      error: 'Could not change password',
      message: error.message
    });
  }
}

// Verify OTP for password reset (non-consuming)
export async function verifyOTP(req: Request, res: Response) {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ 
        success: false,
        error: 'Email and OTP are required' 
      });
    }

    console.log('🔍 OTP verification request for:', email);

    // Do a non-consuming check so user can proceed to reset
    const verification = otpService.checkOTP(email, otp);

    if (verification.valid) {
      return res.json({
        success: true,
        message: 'OTP verified successfully',
        data: {
          email,
          verified: true,
          verifiedAt: new Date().toISOString()
        }
      });
    } else {
      return res.status(400).json({
        success: false,
        error: verification.message,
        data: {
          email,
          verified: false,
          remainingAttempts: otpService.getRemainingAttempts(email)
        }
      });
    }

  } catch (error: any) {
    console.error('❌ OTP verification error:', error);
    return res.status(500).json({
      success: false,
      error: 'Could not verify OTP',
      message: error.message
    });
  }
}

// Get login activity/history for the current user
export async function getLoginActivity(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Fetch real login activity from database
    const activities = await prisma.loginActivity.findMany({
      where: {
        userId: req.user.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50 // Limit to last 50 activities
    });

    // Transform the data to match the expected format
    const formattedActivities = activities.map((activity, index) => {
      const createdAt = new Date(activity.createdAt);
      const now = new Date();
      const diffMs = now.getTime() - createdAt.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      let timeString;
      if (diffHours < 1) {
        timeString = 'Just now';
      } else if (diffHours < 24) {
        timeString = `${Math.floor(diffHours)} hours ago`;
      } else if (diffDays < 7) {
        timeString = `${Math.floor(diffDays)} days ago`;
      } else {
        timeString = createdAt.toLocaleDateString();
      }

      // Extract device info from user agent
      let device = 'Unknown Device';
      const ua = activity.userAgent || '';
      if (ua.includes('iPhone')) device = 'iPhone';
      else if (ua.includes('iPad')) device = 'iPad';
      else if (ua.includes('Android')) device = 'Android Phone';
      else if (ua.includes('Mac')) device = 'MacBook';
      else if (ua.includes('Windows')) device = 'Windows PC';
      else if (ua.includes('Chrome') && !ua.includes('Mobile')) device = 'Chrome Browser';
      else if (ua.includes('Safari') && !ua.includes('Mobile')) device = 'Safari Browser';
      else if (ua.includes('Firefox')) device = 'Firefox Browser';

      return {
        id: index + 1,
        device: device,
        location: activity.location || 'Unknown',
        time: timeString,
        status: activity.action === 'LOGIN_SUCCESS' ? 'success' : activity.action === 'LOGIN_FAILED' ? 'failed' : 'unknown',
        ip: activity.ipAddress || 'Unknown',
        userAgent: activity.userAgent || 'Unknown'
      };
    });

    res.json({
      success: true,
      message: 'Login activity retrieved successfully',
      data: {
        activities: formattedActivities
      }
    });

  } catch (error: any) {
    console.error('❌ Get login activity error:', error);
    res.status(500).json({
      success: false,
      error: 'Could not retrieve login activity',
      message: error.message
    });
  }
}

// Get active sessions for the current user
export async function getActiveSessions(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Fetch real active sessions from database
    const sessions = await prisma.userSession.findMany({
      where: {
        userId: req.user.id,
        isActive: true,
        expiresAt: {
          gt: new Date() // Not expired
        }
      },
      orderBy: {
        lastActivity: 'desc'
      }
    });

    // Transform the data to match the expected format
    const formattedSessions = sessions.map((session) => {
      const lastActivity = new Date(session.lastActivity);
      const now = new Date();
      const diffMs = now.getTime() - lastActivity.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      let timeString;
      if (diffHours < 1) {
        timeString = 'Active now';
      } else if (diffHours < 24) {
        timeString = `${Math.floor(diffHours)} hours ago`;
      } else if (diffDays < 7) {
        timeString = `${Math.floor(diffDays)} days ago`;
      } else {
        timeString = lastActivity.toLocaleDateString();
      }

      // Extract device info from user agent
      let device = 'Unknown Device';
      const ua = session.userAgent || '';
      if (ua.includes('iPhone')) device = 'iPhone';
      else if (ua.includes('iPad')) device = 'iPad';
      else if (ua.includes('Android')) device = 'Android Phone';
      else if (ua.includes('Mac')) device = 'MacBook';
      else if (ua.includes('Windows')) device = 'Windows PC';
      else if (ua.includes('Chrome') && !ua.includes('Mobile')) device = 'Chrome Browser';
      else if (ua.includes('Safari') && !ua.includes('Mobile')) device = 'Safari Browser';
      else if (ua.includes('Firefox')) device = 'Firefox Browser';

      // Check if this is the current session (simplified check)
      const isCurrentSession = session.ipAddress === (req.ip || req.connection?.remoteAddress);

      return {
        id: session.id,
        device: device,
        location: session.location || 'Unknown',
        time: timeString,
        status: isCurrentSession ? 'current' : 'success',
        ip: session.ipAddress || 'Unknown',
        userAgent: session.userAgent || 'Unknown',
        lastActivity: session.lastActivity.toISOString()
      };
    });

    res.json({
      success: true,
      message: 'Active sessions retrieved successfully',
      data: {
        sessions: formattedSessions
      }
    });

  } catch (error: any) {
    console.error('❌ Get active sessions error:', error);
    res.status(500).json({
      success: false,
      error: 'Could not retrieve active sessions',
      message: error.message
    });
  }
}

// Logout from a specific session (terminate session)
export async function logoutSession(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required'
      });
    }

    // Terminate the specific session in the database
    const terminatedSession = await prisma.userSession.updateMany({
      where: {
        id: sessionId,
        userId: req.user.id, // Ensure user can only terminate their own sessions
        isActive: true
      },
      data: {
        isActive: false
      }
    });

    if (terminatedSession.count === 0) {
      return res.status(404).json({
        success: false,
        error: 'Session not found or already terminated'
      });
    }

    console.log(`🔐 Terminated session: ${sessionId} for user: ${req.user.id}`);

    res.json({
      success: true,
      message: 'Session terminated successfully',
      data: {
        terminatedSessionId: sessionId
      }
    });

  } catch (error: any) {
    console.error('❌ Logout session error:', error);
    res.status(500).json({
      success: false,
      error: 'Could not terminate session',
      message: error.message
    });
  }
}

// Verify reset token (legacy function for compatibility)
export async function verifyResetToken(req: Request, res: Response) {
   try {
     const { token } = req.body;

     if (!token) {
       return res.status(400).json({
         success: false,
         error: 'Token is required'
       });
     }

     const user = await authSupabaseService.verifyResetToken(token);

     res.json({
       success: true,
       message: 'Token is valid',
       data: {
         userId: user?.id,
         email: user?.email,
         isValid: true
       }
     });

   } catch (error: any) {
     console.error('❌ Token verification error:', error);
     res.status(400).json({
       success: false,
       error: 'Invalid or expired token',
       message: error.message
     });
   }
 }