import { Router } from 'express';
import images from './images';
import files from './files';

const router = Router();

router.use('/image', images);
router.use('/files', files);

export default router;