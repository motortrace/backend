import { Router } from 'express';
import { authenticateSupabaseToken } from './authSupabase.middleware';
import { AuthSupabaseController } from './authSupabase.controller';
import { AuthSupabaseService } from './authSupabase.service';
import prisma from '../../../infrastructure/database/prisma';
import { emailService } from '../../../shared/utils/email.helper';
import { otpService } from '../../../shared/utils/otp.helper';

const router = Router();

// Dependency Injection - Create instances
const authService = new AuthSupabaseService();
const authController = new AuthSupabaseController(authService, emailService, otpService, prisma);

// Bind controller methods to preserve 'this' context
router.post('/signup', authController.signUp.bind(authController));
router.post('/login', authController.signIn.bind(authController));
router.post('/logout', authenticateSupabaseToken, authController.signOut.bind(authController));
router.get('/header', authenticateSupabaseToken, authController.getHeader.bind(authController));

// New route
router.get('/me', authenticateSupabaseToken, authController.getMe.bind(authController));

// Profile routes
router.get('/profile', authenticateSupabaseToken, authController.getProfile.bind(authController));
router.put('/profile', authenticateSupabaseToken, authController.updateProfile.bind(authController));

// Onboarding route
router.post('/onboarding', authenticateSupabaseToken, authController.completeOnboarding.bind(authController));

// Google authentication route
router.post('/google', authController.googleAuth.bind(authController));

// Test endpoint (remove this after debugging)
router.get('/test', (req, res) => {
  res.json({ message: 'Auth routes are working!' });
});

router.delete('/delete-account', authenticateSupabaseToken, authController.deleteAccount.bind(authController));

// Password reset routes
router.post('/forgot-password', authController.requestPasswordReset.bind(authController));
router.post('/verify-otp', authController.verifyOTP.bind(authController));
router.post('/reset-password', authController.resetPassword.bind(authController));
router.post('/change-password', authenticateSupabaseToken, authController.changePassword.bind(authController));
router.post('/verify-reset-token', authController.verifyResetToken.bind(authController));

export default router;
