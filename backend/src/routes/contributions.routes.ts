import { Router } from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper';
import { requireAuth } from '../middleware/auth.middleware';
import * as contributionsController from '../controllers/contributions.controller';

const contributionsRouter = Router();

contributionsRouter.get('/', requireAuth, ctrlWrapper(contributionsController.getContributions));
contributionsRouter.post('/sync', requireAuth, ctrlWrapper(contributionsController.syncContributions));

export default contributionsRouter;
