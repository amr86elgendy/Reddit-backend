import { Router } from 'express';
import { getUserSubmissions } from '../controllers/user.js';
import { user } from '../middlewares/index.js';

const router = Router();

router.get('/:username', user, getUserSubmissions);

export default router;
