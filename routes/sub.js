import { Router } from 'express';
import {
  createSub,
  getSub,
  ownSub,
  searchSubs,
  topSubs,
  upload,
  uploadSubImage,
} from '../controllers/sub.js';
import { auth, user } from '../middlewares/index.js';

const router = Router();

router.post('/', user, auth, createSub);
router.get('/top-subs', topSubs);
router.get('/:name', user, getSub);
router.get('/search/:name', searchSubs);
router.post(
  '/:name/image',
  user,
  auth,
  ownSub,
  upload.single('file'),
  uploadSubImage
);

export default router;
