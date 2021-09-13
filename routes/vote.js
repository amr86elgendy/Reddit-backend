import { Router } from 'express';
import { voteOnComment, voteOnPost } from '../controllers/vote.js';
import { auth, user } from '../middlewares/index.js';

const router = Router();

router.post('/post', user, auth, voteOnPost);
router.post('/comment', user, auth, voteOnComment);

export default router;