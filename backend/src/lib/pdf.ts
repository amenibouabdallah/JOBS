import * as fs from 'fs';
import * as path from 'path';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const PDFDocument = require('pdfkit');

function ensureDirExists(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

export async function generateCertificatePDF(name: string, id: number): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const baseDir = path.resolve(process.cwd(), 'private', 'certificats');
      ensureDirExists(baseDir);

      const outputPath = path.join(baseDir, `certificat_${id}.pdf`);
      const doc = new PDFDocument({ size: 'A4', layout: 'landscape' });
      const writeStream = fs.createWriteStream(outputPath);
      doc.pipe(writeStream);

      const montserratFontPath = path.resolve(process.cwd(), 'config', 'fonts', 'Montserrat-Bold.ttf');
      if (fs.existsSync(montserratFontPath)) {
        doc.font(montserratFontPath);
      } else {
        doc.font('Helvetica-Bold');
      }

      const bgPath = path.resolve(process.cwd(), 'uploads', 'certif_bg_2k25.jpg');
      if (fs.existsSync(bgPath)) {
        doc.image(bgPath, 0, 0, { width: doc.page.width, height: doc.page.height });
      }

      doc.fontSize(32).fillColor('#6D1B1B').text(name, 30, 260, { align: 'center' });
      doc.end();
      writeStream.on('finish', () => resolve(outputPath));
      writeStream.on('error', (err) => reject(err));
    } catch (error) {
      reject(error);
    }
  });
}

export async function generateInvoicePDF(invoiceData: {
  invoiceNumber: string | number;
  invoiceReference: string | number;
  name: string;
  participant: { role: string };
  jeName?: string | null;
  cin?: string | null;
  unitPriceHT: number;
  vatPercent: number;
}): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const invoicesDir = path.resolve(process.cwd(), 'private', 'factures');
      ensureDirExists(invoicesDir);
      const outputPath = path.join(invoicesDir, `FJOBS-${invoiceData.invoiceNumber}.pdf`);
      const doc = new PDFDocument({ margin: 30 });
      const writeStream = fs.createWriteStream(outputPath);
      doc.pipe(writeStream);

      const logoPath = path.resolve(process.cwd(), 'public', 'assets', 'LOGO-JE-Tunisia.png');
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 30, 20, { width: 100 });
      }

      doc
        .font('Helvetica-Bold')
        .fontSize(20)
        .text('Confédération Tunisienne des Junior Entreprises', 140, 30, { width: 400 })
        .font('Helvetica-Bold')
        .fontSize(12)
        .text('Campus universitaire, La Manouba', 140, doc.y)
        .text('2010 Manouba, Tunisie', 140, doc.y);

      const detailsStartY = 120;
      doc
        .font('Helvetica-Bold')
        .fontSize(12)
        .text('Date de la facture : ' + new Date().toLocaleDateString('fr-TN'), 30, detailsStartY)
        .text(`Référence : FJOBS-${invoiceData.invoiceReference}`, 30, detailsStartY + 20);

      const boxTop = detailsStartY - 10;
      const boxLeft = 320;
      const boxWidth = 250;
      const boxHeight = 120;
      doc
        .lineWidth(1.5)
        .dash(3, { space: 2 })
        .rect(boxLeft, boxTop, boxWidth, boxHeight)
        .stroke()
        .undash();

      const fieldX = boxLeft + 15;
      const labelWidth = 90;
      const valueX = fieldX + labelWidth;
      doc.font('Helvetica-Bold').fontSize(12);
      doc.text('Participant:', fieldX, boxTop + 15);
      doc.text(invoiceData.name, valueX, boxTop + 15);
      doc.text('Poste:', fieldX, boxTop + 40);
      doc.text(invoiceData.participant.role, valueX, boxTop + 40);
      doc.text('Structure:', fieldX, boxTop + 65);
      doc.text(invoiceData.jeName || 'Non spécifié', valueX, boxTop + 65);
      doc.text('CIN/Passeport: ', fieldX, boxTop + 90);
      doc.text(invoiceData.cin || 'Non spécifié', valueX, boxTop + 90);

      doc
        .font('Helvetica-Bold')
        .fontSize(14)
        .text('Informations additionnelles:', 30, boxTop + boxHeight + 30)
        .fontSize(12)
        .text("En cas d'annulation, les frais de participation au séminaire ne sont pas remboursables.", 30, (doc as any).y + 10);

      const tableTop = (doc as any).y + 30;
      doc.font('Helvetica-Bold').fontSize(14).text('Détails de Paiement:', 30, tableTop);
      const columnWidths = [200, 70, 90, 60, 80, 80];
      const headers = ['Description', 'Quantité', 'Prix Unit. HT', 'TVA %', 'Total TVA', 'Total TTC'];
      const rowHeight = 25;
      headers.forEach((header, i) => {
        const x = 30 + columnWidths.slice(0, i).reduce((a, b) => a + b, 0);
        doc.font('Helvetica-Bold').fontSize(11).text(header, x, tableTop + 25, {
          width: columnWidths[i],
          align: 'center',
        });
      });
      doc
        .lineWidth(1.5)
        .moveTo(30, tableTop + 45)
        .lineTo(30 + columnWidths.reduce((a, b) => a + b, 0), tableTop + 45)
        .stroke();

      const rows = [
        {
          description: 'Frais de participation JOBS',
          quantity: 1,
          unitPriceHT: invoiceData.unitPriceHT,
          vatPercent: invoiceData.vatPercent,
          totalVAT: (invoiceData.unitPriceHT * invoiceData.vatPercent) / 100,
          totalTTC: invoiceData.unitPriceHT * (1 + invoiceData.vatPercent / 100),
        },
        {
          description: 'Timbre fiscal',
          quantity: 1,
          unitPriceHT: 1.0,
          vatPercent: 0,
          totalVAT: 0,
          totalTTC: 1.0,
        },
      ];

      rows.forEach((row, rowIndex) => {
        const y = tableTop + 55 + rowIndex * rowHeight;
        let x = 30;
        doc.font('Helvetica-Bold').fontSize(11);
        doc.text(row.description, x, y, { width: columnWidths[0] });
        x += columnWidths[0];
        doc.text(row.quantity.toString(), x, y, { width: columnWidths[1], align: 'center' });
        x += columnWidths[1];
        doc.text(row.unitPriceHT.toFixed(3), x, y, { width: columnWidths[2], align: 'right' });
        x += columnWidths[2];
        doc.text(row.vatPercent + ' %', x, y, { width: columnWidths[3], align: 'center' });
        x += columnWidths[3];
        doc.text(row.totalVAT.toFixed(3), x, y, { width: columnWidths[4], align: 'right' });
        x += columnWidths[4];
        doc.text(row.totalTTC.toFixed(3), x, y, { width: columnWidths[5], align: 'right' });
      });

      const totalTTC = rows.reduce((sum, row) => sum + row.totalTTC, 0).toFixed(3);
      const totalY = tableTop + 55 + rows.length * rowHeight + 10;
      doc.font('Helvetica-Bold').fontSize(14).text(`Total TTC: ${totalTTC} TND`, 30, totalY, {
        align: 'right',
        width: columnWidths.reduce((a, b) => a + b, 0),
      });

      const signaturePath = path.resolve(process.cwd(), 'uploads', 'signature_cachet.jpg');
      if (fs.existsSync(signaturePath)) {
        doc.image(signaturePath, 30, totalY + 30, { width: 180 });
      }
      doc.font('Helvetica-Bold').fontSize(12).text('Signature & Cachet du Bénéficiaire', 30, (doc as any).y + 40);
      doc.end();
      writeStream.on('finish', () => resolve(outputPath));
      writeStream.on('error', (err) => reject(err));
    } catch (error) {
      reject(error);
    }
  });
}

export async function generateProgramPDF(programData: {
  participantName: string;
  participantRole: string;
  jeName: string;
  activities: Array<{
    name: string;
    type: string;
    startTime: Date;
    endTime: Date;
    salle: string;
  }>;
}): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const programsDir = path.resolve(process.cwd(), 'private', 'programs');
      ensureDirExists(programsDir);
      // Sanitize filename
      const safeName = programData.participantName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const outputPath = path.join(programsDir, `PROGRAM-${safeName}-${Date.now()}.pdf`);
      
      const doc = new PDFDocument({ margin: 30 });
      const writeStream = fs.createWriteStream(outputPath);
      doc.pipe(writeStream);

      // Header
      const logoPath = path.resolve(process.cwd(), 'public', 'assets', 'LOGO-JE-Tunisia.png');
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 30, 20, { width: 80 });
      }

      doc
        .font('Helvetica-Bold')
        .fontSize(24)
        .text('Mon Programme JOBS 2025', 120, 40, { align: 'center' });

      // Participant Info Box
      const boxTop = 100;
      const boxLeft = 30;
      const boxWidth = 535; // A4 width (595) - margins (30*2)
      const boxHeight = 80;

      doc
        .lineWidth(1)
        .rect(boxLeft, boxTop, boxWidth, boxHeight)
        .stroke();

      doc.font('Helvetica-Bold').fontSize(12);
      doc.text('Participant:', boxLeft + 10, boxTop + 15);
      doc.font('Helvetica').text(programData.participantName, boxLeft + 100, boxTop + 15);

      doc.font('Helvetica-Bold').text('Rôle:', boxLeft + 10, boxTop + 35);
      doc.font('Helvetica').text(programData.participantRole, boxLeft + 100, boxTop + 35);

      doc.font('Helvetica-Bold').text('Structure:', boxLeft + 10, boxTop + 55);
      doc.font('Helvetica').text(programData.jeName, boxLeft + 100, boxTop + 55);

      // Activities Table
      const tableTop = boxTop + boxHeight + 30;
      doc.font('Helvetica-Bold').fontSize(14).text('Activités', 30, tableTop - 20);

      const columnWidths = [80, 200, 100, 155]; // Time, Activity, Type, Location
      const headers = ['Horaire', 'Activité', 'Type', 'Salle'];
      
      // Table Header
      let x = 30;
      doc.font('Helvetica-Bold').fontSize(10);
      headers.forEach((header, i) => {
        doc.text(header, x, tableTop, { width: columnWidths[i], align: 'left' });
        x += columnWidths[i];
      });

      doc
        .lineWidth(1)
        .moveTo(30, tableTop + 15)
        .lineTo(565, tableTop + 15)
        .stroke();

      // Table Rows
      let y = tableTop + 25;
      doc.font('Helvetica').fontSize(10);

      // Sort activities by start time
      const sortedActivities = [...programData.activities].sort((a, b) => 
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );

      sortedActivities.forEach((activity) => {
        // Check for page break
        if (y > 700) {
          doc.addPage();
          y = 50;
        }

        const timeString = `${new Date(activity.startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - ${new Date(activity.endTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
        
        x = 30;
        doc.text(timeString, x, y, { width: columnWidths[0] });
        x += columnWidths[0];
        doc.text(activity.name, x, y, { width: columnWidths[1] });
        x += columnWidths[1];
        doc.text(activity.type, x, y, { width: columnWidths[2] });
        x += columnWidths[2];
        doc.text(activity.salle, x, y, { width: columnWidths[3] });
        
        y += 20; // Row height
        
        // Light separator line
        doc
          .lineWidth(0.5)
          .moveTo(30, y - 5)
          .lineTo(565, y - 5)
          .stroke();
      });

      // Footer
      const footerY = 750;
      doc
        .fontSize(8)
        .text('Généré le ' + new Date().toLocaleDateString('fr-FR') + ' à ' + new Date().toLocaleTimeString('fr-FR'), 30, footerY, { align: 'center', width: 535 });

      doc.end();
      writeStream.on('finish', () => resolve(outputPath));
      writeStream.on('error', (err) => reject(err));
    } catch (error) {
      reject(error);
    }
  });
}
