import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const email = 'Jeanne.dark@test.mail';
  const password = 'Test123!';

  // Vérifier si l'utilisateur existe
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.log(
      `✅ L'utilisateur ${email} existe déjà (ID: ${existingUser.id})`
    );
    return;
  }

  // Créer l'utilisateur
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: hashedPassword,
    },
  });

  console.log(`✅ Utilisateur créé: ${user.email} (ID: ${user.id})`);
  console.log(`📧 Email: ${email}`);
  console.log(`🔑 Password: ${password}`);
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
