import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { dbService } from '../config/dbService';
import { AuthRequest } from '../middlewares/auth.middleware';

export const createMailbox = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const { username, domainId, password } = req.body;

    if (!username || !domainId || !password) {
      return res.status(400).json({ error: 'Username, domainId, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    // Validate domain
    const domain = await dbService.domains.findById(domainId);
    if (!domain) {
      return res.status(404).json({ error: 'Domain not found.' });
    }

    if (domain.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    if (!domain.verified) {
      return res.status(400).json({ error: 'Domain must be verified before creating mailboxes.' });
    }

    // Clean username (lowercase, remove invalid characters)
    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '');
    if (!cleanUsername) {
      return res.status(400).json({ error: 'Invalid username format.' });
    }

    const email = `${cleanUsername}@${domain.domain}`;

    // Check unique email
    const existingMailbox = await dbService.mailboxes.findByEmail(email);
    if (existingMailbox) {
      return res.status(400).json({ error: `Mailbox with email ${email} already exists.` });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newMailbox = await dbService.mailboxes.create({
      userId,
      domainId,
      email,
      passwordHash,
    });

    res.status(201).json({
      _id: newMailbox._id,
      userId: newMailbox.userId,
      domainId: newMailbox.domainId,
      email: newMailbox.email,
      status: newMailbox.status,
      createdAt: newMailbox.createdAt,
    });
  } catch (error) {
    next(error);
  }
};

export const getMailboxes = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const list = await dbService.mailboxes.findByUser(userId);
    res.json(list);
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password is required and must be at least 6 characters.' });
    }

    const mailbox = await dbService.mailboxes.findById(id);
    if (!mailbox) {
      return res.status(404).json({ error: 'Mailbox not found.' });
    }

    if (mailbox.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const updated = await dbService.mailboxes.updatePassword(id, passwordHash);

    res.json({
      message: 'Mailbox password updated successfully.',
      mailbox: {
        _id: updated?._id,
        email: updated?.email,
        status: updated?.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMailbox = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const mailbox = await dbService.mailboxes.findById(id);

    if (!mailbox) {
      return res.status(404).json({ error: 'Mailbox not found.' });
    }

    if (mailbox.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    await dbService.mailboxes.delete(id);

    res.json({ message: 'Mailbox deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

export const dovecotAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user, pass } = req.body;

    if (!user || !pass) {
      return res.status(400).json({ error: 'fail' });
    }

    const mailbox = await dbService.mailboxes.findByEmail(user.toLowerCase());
    if (!mailbox || mailbox.status !== 'active') {
      res.setHeader('Password-State', 'invalid');
      return res.status(401).json({ error: 'fail' });
    }

    const isMatch = await bcrypt.compare(pass, mailbox.password);
    if (!isMatch) {
      res.setHeader('Password-State', 'invalid');
      return res.status(401).json({ error: 'fail' });
    }

    // Return custom header as expected by Dovecot HTTP Auth
    res.setHeader('Password-State', 'OK');
    res.setHeader('Auth-User', user);
    
    return res.status(200).json({ status: 'ok' });
  } catch (error) {
    next(error);
  }
};
