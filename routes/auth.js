import { Router } from 'express';
const router = Router();

import { login, logout, me, register } from '../controllers/auth.js';
import { auth, user } from '../middlewares/index.js'

router.post('/register', register);
router.post('/login', login);
router.get('/me', user, auth, me);
router.get('/logout', user, auth, logout);

export default router;