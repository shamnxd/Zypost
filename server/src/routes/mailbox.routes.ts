import { Router } from 'express';
import {
  createMailbox,
  getMailboxes,
  resetPassword,
  deleteMailbox,
} from '../controllers/mailbox.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/', createMailbox);
router.get('/', getMailboxes);
router.put('/:id/reset-password', resetPassword);
router.delete('/:id', deleteMailbox);

export default router;
