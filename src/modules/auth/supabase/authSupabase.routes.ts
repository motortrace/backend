import { Router } from 'express';
import { authenticateSupabaseToken } from './authSupabase.middleware';
import { signUp, signIn, signOut } from './authSupabase.controller';

const router = Router();

router.post('/signup', signUp);
router.post('/login', signIn);
router.post('/logout', authenticateSupabaseToken, signOut);

export default router;
