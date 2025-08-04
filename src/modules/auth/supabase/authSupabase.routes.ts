import { Router } from 'express';
import { authenticateSupabaseToken } from './authSupabase.middleware';
import { signUp, signIn, signOut, getMe, completeOnboarding, googleAuth } from './authSupabase.controller';

const router = Router();

router.post('/signup', signUp);
router.post('/login', signIn);
router.post('/logout', authenticateSupabaseToken, signOut);

// New route
router.get('/me', authenticateSupabaseToken, getMe);

// Onboarding route
router.post('/onboarding', authenticateSupabaseToken, completeOnboarding);

// Google authentication route
router.post('/google', googleAuth);

// Test endpoint (remove this after debugging)
router.get('/test', (req, res) => {
  res.json({ message: 'Auth routes are working!' });
});

export default router;
