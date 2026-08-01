require('dotenv').config();
const { prisma } = require('./src/lib/prisma');

async function main() {
  await prisma.$connect();
  const result = await prisma.$queryRaw`SELECT current_database() as db`;
  console.log(result);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
