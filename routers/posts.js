import express from 'express';
import { index, show, create, update, destroy } from '../controllers/posts.js';
import { validatePostBody } from '../middlewares/validatePostBody.js';

const router = express.Router();

router.get('/', index);
router.get('/:id', show);
router.post('/', validatePostBody('create'), create);
router.put('/:id', validatePostBody('update'), update);
router.patch('/:id', validatePostBody('patch'), update);
router.delete('/:id', destroy);

export default router;