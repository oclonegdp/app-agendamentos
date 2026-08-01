const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
require('dotenv').config();

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error('Missing database connection string');
  process.exit(1);
}

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

(async () => {
  await client.connect();
  const email = 'admin@teste.com';
  const password = '123';

  const existing = await client.query('select id from public."User" where email = $1', [email]);
  if (existing.rows.length) {
    console.log('Usuário já existe.');
    await client.end();
    return;
  }

  const companyRes = await client.query(
    'insert into public."Company" (id, slug, name, address, phone, email) values ($1, $2, $3, $4, $5, $6) returning id',
    ['company-test', 'empresa-teste', 'Empresa Teste', 'Rua do Teste, 123', '(11) 99999-9999', 'contato@empresa-teste.com']
  );

  const companyId = companyRes.rows[0].id;
  const hashed = await bcrypt.hash(password, 10);

  await client.query(
    'insert into public."User" (id, email, password, role, "companyId") values ($1, $2, $3, $4, $5)',
    [crypto.randomUUID(), email, hashed, 'ADMIN', companyId]
  );

  console.log('Usuário criado com sucesso:', { email, password, companyId });
  await client.end();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
