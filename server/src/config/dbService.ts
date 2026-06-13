import fs from 'fs';
import path from 'path';
import { useMongo } from './db';
import { UserModel } from '../models/User';
import { DomainModel } from '../models/Domain';
import { MailboxModel } from '../models/Mailbox';

// JSON database configuration
const DATA_DIR = path.join(__dirname, '../../data');

const getJsonPath = (filename: string) => path.join(DATA_DIR, filename);

const readJsonFile = (filename: string): any[] => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const filepath = getJsonPath(filename);
  if (!fs.existsSync(filepath)) {
    fs.writeFileSync(filepath, JSON.stringify([]));
    return [];
  }
  try {
    const content = fs.readFileSync(filepath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading database file ${filename}:`, error);
    return [];
  }
};

const writeJsonFile = (filename: string, data: any[]): void => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(getJsonPath(filename), JSON.stringify(data, null, 2), 'utf8');
};

const generateObjectId = (): string => {
  return Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
};

// Unified DB Service Interface
export const dbService = {
  users: {
    async create(data: { name: string; email: string; passwordHash: string }) {
      if (useMongo) {
        const user = new UserModel({
          name: data.name,
          email: data.email,
          password: data.passwordHash,
        });
        const saved = await user.save();
        return saved.toObject();
      } else {
        const users = readJsonFile('users.json');
        const newUser = {
          _id: generateObjectId(),
          name: data.name,
          email: data.email.toLowerCase(),
          password: data.passwordHash,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        users.push(newUser);
        writeJsonFile('users.json', users);
        return newUser;
      }
    },

    async findByEmail(email: string) {
      if (useMongo) {
        const user = await UserModel.findOne({ email: email.toLowerCase() });
        return user ? user.toObject() : null;
      } else {
        const users = readJsonFile('users.json');
        const user = users.find((u) => u.email === email.toLowerCase());
        return user || null;
      }
    },

    async findById(id: string) {
      if (useMongo) {
        const user = await UserModel.findById(id);
        return user ? user.toObject() : null;
      } else {
        const users = readJsonFile('users.json');
        const user = users.find((u) => u._id === id);
        return user || null;
      }
    },
  },

  domains: {
    async create(data: { userId: string; domain: string; verificationToken: string }) {
      if (useMongo) {
        const domain = new DomainModel({
          userId: data.userId,
          domain: data.domain.toLowerCase(),
          verificationToken: data.verificationToken,
          verified: false,
        });
        const saved = await domain.save();
        return saved.toObject();
      } else {
        const domains = readJsonFile('domains.json');
        const newDomain = {
          _id: generateObjectId(),
          userId: data.userId,
          domain: data.domain.toLowerCase(),
          verificationToken: data.verificationToken,
          verified: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        domains.push(newDomain);
        writeJsonFile('domains.json', domains);
        return newDomain;
      }
    },

    async findByUser(userId: string) {
      if (useMongo) {
        const list = await DomainModel.find({ userId });
        return list.map((d) => d.toObject());
      } else {
        const domains = readJsonFile('domains.json');
        return domains.filter((d) => d.userId === userId);
      }
    },

    async findByDomain(domainName: string) {
      if (useMongo) {
        const dom = await DomainModel.findOne({ domain: domainName.toLowerCase() });
        return dom ? dom.toObject() : null;
      } else {
        const domains = readJsonFile('domains.json');
        const dom = domains.find((d) => d.domain === domainName.toLowerCase());
        return dom || null;
      }
    },

    async findById(id: string) {
      if (useMongo) {
        const dom = await DomainModel.findById(id);
        return dom ? dom.toObject() : null;
      } else {
        const domains = readJsonFile('domains.json');
        const dom = domains.find((d) => d._id === id);
        return dom || null;
      }
    },

    async updateVerified(id: string, verified: boolean) {
      if (useMongo) {
        const dom = await DomainModel.findByIdAndUpdate(
          id,
          { verified },
          { new: true }
        );
        return dom ? dom.toObject() : null;
      } else {
        const domains = readJsonFile('domains.json');
        const index = domains.findIndex((d) => d._id === id);
        if (index === -1) return null;
        domains[index].verified = verified;
        domains[index].updatedAt = new Date().toISOString();
        writeJsonFile('domains.json', domains);
        return domains[index];
      }
    },

    async delete(id: string) {
      if (useMongo) {
        await DomainModel.findByIdAndDelete(id);
        return true;
      } else {
        let domains = readJsonFile('domains.json');
        const initialLen = domains.length;
        domains = domains.filter((d) => d._id !== id);
        writeJsonFile('domains.json', domains);
        return domains.length < initialLen;
      }
    },
  },

  mailboxes: {
    async create(data: { userId: string; domainId: string; email: string; passwordHash: string }) {
      if (useMongo) {
        const mailbox = new MailboxModel({
          userId: data.userId,
          domainId: data.domainId,
          email: data.email.toLowerCase(),
          password: data.passwordHash,
          status: 'active',
        });
        const saved = await mailbox.save();
        return saved.toObject();
      } else {
        const mailboxes = readJsonFile('mailboxes.json');
        const newMailbox = {
          _id: generateObjectId(),
          userId: data.userId,
          domainId: data.domainId,
          email: data.email.toLowerCase(),
          password: data.passwordHash,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        mailboxes.push(newMailbox);
        writeJsonFile('mailboxes.json', mailboxes);
        return newMailbox;
      }
    },

    async findByUser(userId: string) {
      if (useMongo) {
        const list = await MailboxModel.find({ userId });
        return list.map((m) => m.toObject());
      } else {
        const mailboxes = readJsonFile('mailboxes.json');
        return mailboxes.filter((m) => m.userId === userId);
      }
    },

    async findByEmail(email: string) {
      if (useMongo) {
        const mb = await MailboxModel.findOne({ email: email.toLowerCase() });
        return mb ? mb.toObject() : null;
      } else {
        const mailboxes = readJsonFile('mailboxes.json');
        const mb = mailboxes.find((m) => m.email === email.toLowerCase());
        return mb || null;
      }
    },

    async findById(id: string) {
      if (useMongo) {
        const mb = await MailboxModel.findById(id);
        return mb ? mb.toObject() : null;
      } else {
        const mailboxes = readJsonFile('mailboxes.json');
        const mb = mailboxes.find((m) => m._id === id);
        return mb || null;
      }
    },

    async updatePassword(id: string, passwordHash: string) {
      if (useMongo) {
        const mb = await MailboxModel.findByIdAndUpdate(
          id,
          { password: passwordHash },
          { new: true }
        );
        return mb ? mb.toObject() : null;
      } else {
        const mailboxes = readJsonFile('mailboxes.json');
        const index = mailboxes.findIndex((m) => m._id === id);
        if (index === -1) return null;
        mailboxes[index].password = passwordHash;
        mailboxes[index].updatedAt = new Date().toISOString();
        writeJsonFile('mailboxes.json', mailboxes);
        return mailboxes[index];
      }
    },

    async delete(id: string) {
      if (useMongo) {
        await MailboxModel.findByIdAndDelete(id);
        return true;
      } else {
        let mailboxes = readJsonFile('mailboxes.json');
        const initialLen = mailboxes.length;
        mailboxes = mailboxes.filter((m) => m._id !== id);
        writeJsonFile('mailboxes.json', mailboxes);
        return mailboxes.length < initialLen;
      }
    },

    async deleteManyByDomain(domainId: string) {
      if (useMongo) {
        await MailboxModel.deleteMany({ domainId });
        return true;
      } else {
        let mailboxes = readJsonFile('mailboxes.json');
        mailboxes = mailboxes.filter((m) => m.domainId !== domainId);
        writeJsonFile('mailboxes.json', mailboxes);
        return true;
      }
    },
  },
};
