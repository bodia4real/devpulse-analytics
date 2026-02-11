import { Router } from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper';
import { requireAuth } from '../middleware/auth.middleware';
import * as authController from '../controllers/auth.controller';

const authRouter = Router();

authRouter.get('/github', ctrlWrapper(authController.redirectToGitHub));
authRouter.get('/github/callback', ctrlWrapper(authController.githubCallback));
authRouter.get('/me', requireAuth, ctrlWrapper(authController.getMe));
authRouter.post('/logout', requireAuth, ctrlWrapper(authController.logout));

export default authRouter;
