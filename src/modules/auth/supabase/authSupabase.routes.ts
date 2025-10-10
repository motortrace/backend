import { Router } from 'express';
import { authenticateSupabaseToken } from './authSupabase.middleware';
import { signUp, signIn, signOut, getMe, completeOnboarding, googleAuth, getHeader, deleteAccount, requestPasswordReset, resetPassword, changePassword, verifyResetToken, verifyOTP, getProfile, updateProfile, getLoginActivity, getActiveSessions, logoutSession } from './authSupabase.controller';

const router = Router();

router.post('/signup', signUp);
router.post('/login', signIn);
router.post('/logout', authenticateSupabaseToken, signOut);
router.get('/header', authenticateSupabaseToken, getHeader);

// New route
router.get('/me', authenticateSupabaseToken, getMe);

// Profile routes
router.get('/profile', authenticateSupabaseToken, getProfile);
router.put('/profile', authenticateSupabaseToken, updateProfile);

// Onboarding route
router.post('/onboarding', authenticateSupabaseToken, completeOnboarding);

// Google authentication route
router.post('/google', googleAuth);

// Test endpoint (remove this after debugging)
router.get('/test', (req, res) => {
  res.json({ message: 'Auth routes are working!' });
});

router.delete('/delete-account', authenticateSupabaseToken, deleteAccount);

// Password reset routes
router.post('/forgot-password', requestPasswordReset);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);
router.post('/change-password', authenticateSupabaseToken, changePassword);
router.post('/verify-reset-token', verifyResetToken);

// Session management routes
router.get('/login-activity', authenticateSupabaseToken, getLoginActivity);
router.get('/active-sessions', authenticateSupabaseToken, getActiveSessions);
router.post('/logout-session', authenticateSupabaseToken, logoutSession);

export default router;
