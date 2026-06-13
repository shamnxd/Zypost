import { Router } from 'express';
import {
  addDomain,
  getDomains,
  getDomainDetails,
  verifyDomain,
  deleteDomain,
} from '../controllers/domain.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/', addDomain);
router.get('/', getDomains);
router.get('/:id', getDomainDetails);
router.post('/:id/verify', verifyDomain);
router.delete('/:id', deleteDomain);

export default router;
