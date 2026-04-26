import prisma from '../src/config/prisma.js';
import { hashPassword } from '../src/utils/authUtils.js';

async function main() {
  const adminEmail = 'tarekjamiladnan007@gmail.com';
  const adminPassword = 'Adnan1234';
  const annotatorEmail = 'annotator@test.com';
  const annotatorPassword = 'Test1234';
  
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (!existingAdmin) {
      // Hash the password
      const hashedPassword = await hashPassword(adminPassword);

      // Create User with ADMIN role
      const user = await prisma.user.create({
        data: {
          email: adminEmail,
          name: 'Admin User',
          phone: '03001234567',
          password: hashedPassword,
          role: 'ADMIN'
        }
      });

      console.log(`✓ Admin user created:`, user.email);

      // Create Admin record
      const admin = await prisma.admin.create({
        data: {
          email: adminEmail
        }
      });

      console.log(`✓ Admin record created:`, admin.adminID);
    } else {
      console.log(`✓ Admin user ${adminEmail} already exists`);
    }

    // Check if annotator already exists
    const existingAnnotator = await prisma.user.findUnique({
      where: { email: annotatorEmail }
    });

    if (!existingAnnotator) {
      // Hash the password
      const hashedPassword = await hashPassword(annotatorPassword);

      // Create User with ANNOTATOR role
      const user = await prisma.user.create({
        data: {
          email: annotatorEmail,
          name: 'Test Annotator',
          phone: '03009876543',
          password: hashedPassword,
          role: 'ANNOTATOR'
        }
      });

      console.log(`✓ Annotator user created:`, user.email);

      // Create Annotator record
      const annotator = await prisma.annotator.create({
        data: {
          email: annotatorEmail,
          workArea: 'Test Area'
        }
      });

      console.log(`✓ Annotator record created:`, annotator.annotatorID);
    } else {
      console.log(`✓ Annotator user ${annotatorEmail} already exists`);
    }

    console.log(`\n✅ Database seeded successfully!`);
    console.log(`\n📋 Test Accounts:`);
    console.log(`\n   ADMIN:`);
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log(`\n   ANNOTATOR:`);
    console.log(`   Email: ${annotatorEmail}`);
    console.log(`   Password: ${annotatorPassword}`);

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
