const fs = require('fs');
const { MongoClient } = require('mongodb');

const envPath = '/var/www/Zypost/server/.env';
let MONGO_URI = process.env.MONGODB_URI;

// Load MONGODB_URI dynamically from the server's secure .env file
if (!MONGO_URI && fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/^MONGODB_URI=(.+)$/m);
  if (match) {
    MONGO_URI = match[1].trim();
  }
}

async function sync() {
  if (!MONGO_URI) {
    console.error('Error: MONGODB_URI not found in environment or server .env file.');
    process.exit(1);
  }
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    const db = client.db('Zypost');
    
    // 1. Fetch and write verified domains for Postfix
    const domains = await db.collection('domains').find({ verified: true }).toArray();
    const domainContent = domains.map(d => `${d.domain} OK`).join('\n');
    fs.writeFileSync('/etc/postfix/virtual_domains', domainContent);
    
    // 2. Fetch and write active mailboxes for Postfix
    const mailboxes = await db.collection('mailboxes').find({ status: 'active' }).toArray();
    const postfixUserContent = mailboxes.map(m => {
      const username = m.email.split('@')[0];
      const domain = m.email.split('@')[1];
      return `${m.email} ${domain}/${username}/`;
    }).join('\n');
    fs.writeFileSync('/etc/postfix/virtual_users', postfixUserContent);
    
    // 3. Write active mailboxes with bcrypt password hashes for Dovecot
    // Format: email:{CRYPT}hash:uid:gid::home
    const dovecotUserContent = mailboxes.map(m => {
      const username = m.email.split('@')[0];
      const domain = m.email.split('@')[1];
      return `${m.email}:{CRYPT}${m.password}:5000:5000::/var/mail/vmail/${domain}/${username}`;
    }).join('\n');
    fs.writeFileSync('/etc/dovecot/users', dovecotUserContent);
    
    console.log('✅ Postfix and Dovecot configuration maps successfully synced!');
  } catch (err) {
    console.error('Error syncing maps:', err);
  } finally {
    await client.close();
  }
}
sync();
