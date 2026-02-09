import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../utils/errors';
import { createClient } from '@supabase/supabase-js';
import { supabaseConfig } from '../config';

const supabase = createClient(
    supabaseConfig.url!,
    supabaseConfig.anonKey!
);

export const authMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // 1. Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        throw new UnauthorizedError('No token provided');
    }

    // 2. Extract token (remove "Bearer " if present)
    const token = authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : authHeader;

    // 3. Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    // 4. Check if valid
    if (error || !user) {
        throw new UnauthorizedError('Invalid or expired token');
    }

    // 5. Attach user to request
    (req as any).user = user;

    // 6. Continue
    next();
};