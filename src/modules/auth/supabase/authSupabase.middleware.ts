import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { AuthenticatedRequest } from '../../../shared/types/auth.types';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY in environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const authenticateSupabaseToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Missing Authorization header' });

    const token = authHeader.replace('Bearer ', '').trim();
    if (!token) return res.status(401).json({ error: 'Invalid token format' });

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) return res.status(401).json({ error: 'Invalid or expired token' });

    const user = data.user;

    // Attach minimal user info to req.user
    req.user = {
      id: user.id,
      email: user.email || undefined,
      role: user.user_metadata?.role,  // You decide where to keep role; if in metadata
    };

    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(500).json({ error: 'Authentication failed' });
  }
};
