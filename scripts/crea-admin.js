// Uso: node scripts/crea-admin.js email@esempio.it "Nome"
// Crea un amministratore con password provvisoria (da cambiare al primo accesso).
const bcrypt = require('bcryptjs');
const { q, one, migrate, pool } = require('../src/db');
const { tempPassword } = require('../src/auth');

(async () => {
  const email = (process.argv[2] || '').toLowerCase();
  if (!email.includes('@')) { console.log('Uso: node scripts/crea-admin.js email "Nome"'); process.exit(1); }
  await migrate();
  if (await one('SELECT 1 FROM users WHERE lower(email)=$1', [email])) { console.log('Email già presente.'); process.exit(1); }
  const pw = tempPassword();
  await q("INSERT INTO users(email, password_hash, name, role, must_change_password) VALUES ($1,$2,$3,'admin',true)", [email, await bcrypt.hash(pw, 12), process.argv[3] || '']);
  console.log(`Amministratore creato: ${email}\nPassword provvisoria: ${pw}`);
  await pool.end();
})();
