import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { supabaseConfig } from '../config';
import { asyncHandler } from '../utils/asyncHandler';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const supabase = createClient(
    supabaseConfig.url!,
    supabaseConfig.anonKey!
);

// POST /api/auth/register
router.post('/register', asyncHandler(async (req, res) => {
    // Your code here
}));

// POST /api/auth/login
router.post('/login', asyncHandler(async (req, res) => {
    // Your code here
}));

// GET /api/auth/me (protected)
router.get('/me', authMiddleware, asyncHandler(async (req, res) => {
    // req.user is available here!
    res.json({ user: (req as any).user });
}));

// POST /api/auth/logout
router.post('/logout', asyncHandler(async (req, res) => {
    // Your code here
}));

// POST /api/auth/refresh
router.post('/refresh', asyncHandler(async (req, res) => {
    // Your code here
}));

export default router;