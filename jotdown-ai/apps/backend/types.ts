
import type { FastifyRequest } from 'fastify';

// Define user payload coming from Supabase JWT
export interface SupabaseUser {
  id: string;         // Supabase UID
  email?: string;
  role?: string;      // Optional: 'admin', 'user', etc.
  plan?: 'free' | 'pro' | 'enterprise'; // Optional: for rate limits
}

// Extend FastifyRequest with `user`
export interface AuthenticatedRequest extends FastifyRequest {
  user: SupabaseUser;
}

// Recording metadata type (optional use in DB logic)
export interface Recording {
  id: string;
  user_id: string;
  file_url: string;
  transcript: string;
  created_at: Date;
}

