import { generateInvoicePDF } from '../lib/pdf';

async function main() {
  const [,, invoiceNumberArg, nameArg] = process.argv;
  if (!invoiceNumberArg || !nameArg) {
    console.error('Usage: ts-node src/scripts/generate-invoice.ts <invoiceNumber> <name>');
    process.exit(1);
  }
  const filePath = await generateInvoicePDF({
    invoiceNumber: invoiceNumberArg,
    invoiceReference: invoiceNumberArg,
    name: nameArg,
    participant: { role: 'PARTICIPANT' },
    unitPriceHT: 1,
    vatPercent: 0,
  });
  console.log('Invoice generated at:', filePath);
}

main().catch((e) => { console.error(e); process.exit(1); });
