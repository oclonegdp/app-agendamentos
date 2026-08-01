import bcrypt from 'bcryptjs';
import { prisma } from '../src/lib/prisma';

async function main() {
  const email = 'admin@teste.com';
  const password = '123';

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    console.log('Usuário padrão já existe.');
    return;
  }

  const company = await prisma.company.create({
    data: {
      slug: 'empresa-teste',
      name: 'Empresa Teste',
      address: 'Rua do Teste, 123',
      phone: '(11) 99999-9999',
      email: 'contato@empresa-teste.com',
    },
  });

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role: 'ADMIN',
      companyId: company.id,
    },
  });

  console.log('Usuário padrão criado com sucesso:', { email, password, companyId: company.id });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
