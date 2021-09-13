import { Router } from 'express';
import { getPostComments } from '../controllers/comment.js';
import { auth, user } from '../middlewares/index.js';

const router = Router();

router.get('/:id', user, auth, getPostComments);


export default router;
