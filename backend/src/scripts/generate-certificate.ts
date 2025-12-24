import { generateCertificatePDF } from '../lib/pdf';

async function main() {
  const [,, idArg, nameArg] = process.argv;
  if (!idArg || !nameArg) {
    console.error('Usage: ts-node src/scripts/generate-certificate.ts <participantId> <name>');
    process.exit(1);
  }
  const id = Number(idArg);
  const filePath = await generateCertificatePDF(nameArg, id);
  console.log('Certificate generated at:', filePath);
}

main().catch((e) => { console.error(e); process.exit(1); });
