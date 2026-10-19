import { Router } from 'express';
import { SiteController } from '../controllers/siteController.js';

const router = Router();

router.get('/', SiteController.list);
router.get('/:id', SiteController.getById);
router.post('/', SiteController.create);
router.patch('/:id', SiteController.update);
router.delete('/:id', SiteController.remove);

export default router;
