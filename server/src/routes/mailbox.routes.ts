import { Router } from 'express';
import {
  createMailbox,
  getMailboxes,
  resetPassword,
  deleteMailbox,
  dovecotAuth,
} from '../controllers/mailbox.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Public route used by local Dovecot service for HTTP auth
router.post('/dovecot-auth', dovecotAuth);

router.use(authMiddleware);

router.post('/', createMailbox);
router.get('/', getMailboxes);
router.put('/:id/reset-password', resetPassword);
router.delete('/:id', deleteMailbox);

export default router;
