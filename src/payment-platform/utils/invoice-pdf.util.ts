import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function buildInvoicePdfBuffer(input: {
  invoiceNumber: string;
  orderNumber: string;
  clientName: string;
  clientEmail: string;
  currency: string;
  totalAmount: number;
  paymentStatus: string;
  linesSummary: string;
  issuedAt: Date;
}): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595, 842]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  let y = 800;

  const line = (text: string, size = 11, bold = false) => {
    page.drawText(text, {
      x: 50,
      y,
      size,
      font: bold ? fontBold : font,
      color: rgb(0.1, 0.1, 0.1),
    });
    y -= size + 6;
  };

  line('INTISAR — Facture (module paiement)', 14, true);
  y -= 10;
  line(`Facture n° ${input.invoiceNumber}`, 12, true);
  line(`Commande n° ${input.orderNumber}`, 11);
  line(
    `Date d’émission : ${input.issuedAt.toLocaleDateString('fr-FR')}`,
    10,
  );
  y -= 10;
  line('Client', 11, true);
  line(input.clientName);
  line(input.clientEmail);
  y -= 10;
  line('Détail', 11, true);
  for (const chunk of chunkText(input.linesSummary, 90)) {
    line(chunk, 10);
  }
  y -= 10;
  line(`Statut paiement : ${input.paymentStatus}`, 11, true);
  line(
    `TOTAL ${input.currency} : ${input.totalAmount.toFixed(2)}`,
    12,
    true,
  );
  y -= 20;
  line('INTISAR Voyages — Maroc', 9);

  return doc.save();
}

function chunkText(text: string, maxLen: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (next.length > maxLen) {
      if (cur) lines.push(cur);
      cur = w;
    } else {
      cur = next;
    }
  }
  if (cur) lines.push(cur);
  return lines.length ? lines : ['—'];
}
