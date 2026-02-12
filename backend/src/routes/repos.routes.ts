/*
- [ ] Create repos routes (src/routes/repos.routes.ts)
- [ ] Implement GET /api/repos (fetch all user repos from DB, protected)
- [ ] Implement GET /api/repos/:id (get specific repo details, protected)
- [ ] Implement POST /api/repos/sync (sync repos from GitHub to DB, protected):
  - [ ] Fetch repos from GitHub API
  - [ ] Compare with existing DB records
  - [ ] Insert new repos
  - [ ] Update existing repos (stars, forks, issues, etc.)
  - [ ] Return sync result
- [ ] Test repo endpoints
*/ 

import { Router } from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper';
import { requireAuth } from '../middleware/auth.middleware';
import * as reposController from '../controllers/repos.controller';

const reposRouter = Router();

reposRouter.get('/', requireAuth, ctrlWrapper(reposController.getRepos));
reposRouter.post('/sync', requireAuth, ctrlWrapper(reposController.syncRepos));
reposRouter.get('/:id', requireAuth, ctrlWrapper(reposController.getRepoById));

export default reposRouter;