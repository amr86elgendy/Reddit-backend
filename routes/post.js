import { Router } from 'express';
import { commentOnPost, createPost, getPost, getPosts } from '../controllers/post.js';
import { auth, user } from '../middlewares/index.js';

const router = Router();

router.post('/', user, auth, createPost)
router.get('/', user, getPosts);
router.get('/:_id/:slug', user, getPost);
router.post('/:_id/:slug/comments', user, auth, commentOnPost);

export default router;