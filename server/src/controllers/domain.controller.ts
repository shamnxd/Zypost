import { Response, NextFunction } from 'express';
import dns from 'dns';
import { dbService } from '../config/dbService';
import { AuthRequest } from '../middlewares/auth.middleware';

export const addDomain = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const { domain } = req.body;

    if (!domain) {
      return res.status(400).json({ error: 'Domain name is required.' });
    }

    // Basic domain validation
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;
    if (!domainRegex.test(domain)) {
      return res.status(400).json({ error: 'Invalid domain format.' });
    }

    const existingDomain = await dbService.domains.findByDomain(domain);
    if (existingDomain) {
      return res.status(400).json({ error: 'This domain has already been added.' });
    }

    // Generate random verification token
    const token = Array.from({ length: 16 }, () => 
      Math.floor(Math.random() * 36).toString(36)
    ).join('');

    const newDomain = await dbService.domains.create({
      userId,
      domain: domain.toLowerCase(),
      verificationToken: token,
    });

    res.status(201).json(newDomain);
  } catch (error) {
    next(error);
  }
};

export const getDomains = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const domains = await dbService.domains.findByUser(userId);
    res.json(domains);
  } catch (error) {
    next(error);
  }
};

export const getDomainDetails = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const domain = await dbService.domains.findById(id);

    if (!domain) {
      return res.status(404).json({ error: 'Domain not found.' });
    }

    if (domain.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    res.json(domain);
  } catch (error) {
    next(error);
  }
};

export const verifyDomain = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { simulate } = req.query;
    const domain = await dbService.domains.findById(id);

    if (!domain) {
      return res.status(404).json({ error: 'Domain not found.' });
    }

    if (domain.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    if (domain.verified) {
      return res.json({ message: 'Domain is already verified.', domain });
    }

    const expectedRecord = `mail-manager-verification=${domain.verificationToken}`;

    if (simulate === 'true') {
      const updated = await dbService.domains.updateVerified(id, true);
      return res.json({
        success: true,
        message: 'Domain ownership verified successfully (Simulated).',
        domain: updated,
      });
    }

    try {
      console.log(`Checking TXT records for: ${domain.domain}`);
      const txtRecords = await dns.promises.resolveTxt(domain.domain);
      const flatRecords = txtRecords.flat();
      console.log('Found records:', flatRecords);

      const isVerified = flatRecords.some(
        (record) => record === expectedRecord || record.includes(expectedRecord)
      );

      if (isVerified) {
        const updated = await dbService.domains.updateVerified(id, true);
        return res.json({
          success: true,
          message: 'Domain ownership verified successfully.',
          domain: updated,
        });
      } else {
        return res.status(400).json({
          error: `Verification record not found. Expected: "${expectedRecord}"`,
          success: false,
        });
      }
    } catch (dnsError: any) {
      console.warn('DNS lookup failed:', dnsError.message);
      return res.status(400).json({
        error: `DNS lookup failed: ${dnsError.code || dnsError.message}. Make sure your TXT record is configured correctly or use Developer Simulation.`,
        success: false,
      });
    }
  } catch (error) {
    next(error);
  }
};

export const deleteDomain = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const domain = await dbService.domains.findById(id);

    if (!domain) {
      return res.status(404).json({ error: 'Domain not found.' });
    }

    if (domain.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    // Delete domain
    await dbService.domains.delete(id);
    // Cascade delete mailboxes
    await dbService.mailboxes.deleteManyByDomain(id);

    res.json({ message: 'Domain and all associated mailboxes deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
