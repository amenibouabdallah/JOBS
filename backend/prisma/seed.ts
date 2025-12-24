import { PrismaClient, UserRole, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Check if admin already exists
  const existingAdmin = await prisma.user.findFirst({
    where: { role: UserRole.ADMIN },
  });

  if (existingAdmin) {
    console.log('⚠️  Admin user already exists:', existingAdmin.email);
    return;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash('admin123', 10);

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: 'zvid@jobs2k26.com',
      password: hashedPassword,
      role: UserRole.ADMIN,
      status: UserStatus.APPROVED,
      agreedTerms: true,
      isOAuth: false,
    },
  });

  // Create Admin profile
  await prisma.admin.create({
    data: {
      userId: admin.id,
      permissions: ['*'], // Full permissions
    },
  });

  console.log('✅ Admin user created successfully!');
  console.log('📧 Email: admin@jobs2k26.com');
  console.log('🔑 Password: admin123');
  console.log('⚠️  Please change the password after first login!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
