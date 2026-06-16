
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

async function testLogin() {
  const prisma = new PrismaClient();
  const email = 'admin@intisar.com';
  const password = 'admin123';

  const user = await prisma.adminUser.findUnique({ where: { email } });
  if (!user) {
    console.log('User not found');
    return;
  }

  console.log('User found:', user.email);
  console.log('User status:', user.status);
  console.log('Stored hash:', user.passwordHash);

  const ok = await bcrypt.compare(password, user.passwordHash);
  console.log('Bcrypt compare result:', ok);

  await prisma.$disconnect();
}

testLogin();
