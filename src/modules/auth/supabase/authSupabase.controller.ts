// src/modules/auth/authSupabase.controller.ts
import { Request, Response } from 'express';
import { authSupabaseService } from './authSupabase.service';

export async function signUp(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const data = await authSupabaseService.signUp(email, password);
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
    res.status(200).json({ message: 'Login successful', data });
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
