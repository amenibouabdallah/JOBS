// Generate JE accounts for Jobs26
// Run: npx ts-node src/scripts/generate-jes.ts
import { PrismaClient, UserRole, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface JEData {
  name: string;
  email: string | null;
}

export interface GeneratedCredential {
  name: string;
  email: string;
  password: string;
  code: string;
  userId: number;
  jeId: number;
  generatedAt: string;
}

async function generateJEs() {
  try {
    // Read the je-names.json file
    let namesPath = path.join(__dirname, 'je-names.json');

    // If running from dist folder, look in src folder instead
    if (!fs.existsSync(namesPath)) {
      namesPath = path.join(process.cwd(), 'src', 'scripts', 'je-names.json');
    }

    if (!fs.existsSync(namesPath)) {
      throw new Error(`je-names.json file not found. Looked in: ${namesPath}`);
    }

    const namesData = fs.readFileSync(namesPath, 'utf8');
    const jeNames: JEData[] = JSON.parse(namesData);

    console.log(`Found ${jeNames.length} JE names to process...`);

    const generatedCredentials: GeneratedCredential[] = [];

    for (const jeData of jeNames) {
      const jeName = jeData.name;

      // Skip JEs without email
      if (!jeData.email) {
        console.log(`⚠️  Skipping ${jeName} - No email provided`);
        continue;
      }

      const email = jeData.email;

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        console.log(`⚠️  User with email ${email} already exists, skipping...`);
        continue;
      }

      // Generate temporary password and unique JE code
      const tempPassword = generateTempPassword();
      const jeCode = generateJECode(jeName);
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      // Create user account
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role: UserRole.JE,
          status: UserStatus.CREATED, // Will need to complete registration
        },
      });

      // Create JE profile
      const jeProfile = await prisma.jE.create({
        data: {
          userId: user.id,
          name: jeName,
          code: jeCode,
          phone: '', // To be filled during registration
        },
      });

      // Store credentials for generated.json
      generatedCredentials.push({
        name: jeName,
        email: email,
        password: tempPassword,
        code: jeCode,
        userId: user.id,
        jeId: jeProfile.id,
        generatedAt: new Date().toISOString(),
      });

      console.log(`✅ Created JE: ${jeName}`);
      console.log(`   📧 Email: ${email}`);
      console.log(`   🔑 Temp Password: ${tempPassword}`);
      console.log(`   🔢 JE Code: ${jeCode}`);
      console.log(`   🆔 User ID: ${user.id}`);
      console.log(`   🏢 JE ID: ${jeProfile.id}`);
      console.log('');
    }

    // Save generated credentials to file
    if (generatedCredentials.length > 0) {
      let generatedPath = path.join(__dirname, 'generated-jes.json');

      // If running from dist folder, save in src folder instead
      if (__dirname.includes('dist')) {
        generatedPath = path.join(
          process.cwd(),
          'src',
          'scripts',
          'generated-jes.json',
        );
      }

      fs.writeFileSync(
        generatedPath,
        JSON.stringify(generatedCredentials, null, 2),
      );
      console.log(`📄 Generated credentials saved to: ${generatedPath}`);
      
      // Also create a CSV file for easy import
      const csvPath = generatedPath.replace('.json', '.csv');
      const csvContent = [
        'Name,Email,Password,Code,User ID,JE ID,Generated At',
        ...generatedCredentials.map(cred => 
          `"${cred.name}","${cred.email}","${cred.password}","${cred.code}",${cred.userId},${cred.jeId},"${cred.generatedAt}"`
        )
      ].join('\n');
      
      fs.writeFileSync(csvPath, csvContent);
      console.log(`📊 CSV credentials saved to: ${csvPath}`);
    }

    console.log(
      `🎉 JE generation completed! Generated ${generatedCredentials.length} new JEs.`,
    );

    return {
      created: generatedCredentials.length,
      credentials: generatedCredentials,
    };
  } catch (error) {
    console.error('❌ Error generating JEs:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

function generateTempPassword(): string {
  // Generate a secure temporary password
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `Jobs26${password}`;
}

function generateJECode(jeName: string): string {
  // Generate a unique code based on JE name
  const words = jeName.split(/\s+/);
  let code = '';
  
  // Take first 2-3 characters from each word
  for (const word of words) {
    if (word.toLowerCase() === 'junior' || word.toLowerCase() === 'entreprise') {
      continue; // Skip common words
    }
    code += word.substring(0, Math.min(3, word.length)).toUpperCase();
  }
  
  // If code is too short, pad with year
  if (code.length < 4) {
    code += '26';
  }
  
  // Add random numbers to ensure uniqueness
  const randomSuffix = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  return code.substring(0, 6) + randomSuffix;
}

// Run the script
if (require.main === module) {
  generateJEs()
    .then((result) => {
      console.log(`\n🎯 Summary: ${result.created} JEs created successfully!`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

export { generateJEs };
