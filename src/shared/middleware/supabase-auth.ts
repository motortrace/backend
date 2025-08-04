import { Request, Response, NextFunction } from "express";
import { supabase } from "../utils/supabaseClient"; // you already have this client

export async function requireSupabaseAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" });
  }

  const token = authHeader.slice(7); // remove "Bearer "

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data?.user) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  (req as any).user = data.user; // Supabase user object
  next();
}
