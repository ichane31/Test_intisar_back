import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function buildQuotePdfBuffer(input: {
  numero: string;
  clientNom: string;
  clientEmail: string;
  clientTel: string;
  clientVille?: string | null;
  packTitle: string;
  nbPersonnes: number;
  dateDepart?: Date | null;
  montantTotal: number;
  remiseType?: string;
  remiseValeur?: number | null;
  remise: number;
  montantFinal: number;
  validiteJours: number;
  notes?: string | null;
}): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595, 842]); // A4 portrait
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const fontItalic = await doc.embedFont(StandardFonts.HelveticaOblique);
  let y = 800;

  // Helper functions
  const line = (text: string, size = 11, bold = false, italic = false) => {
    const selectedFont = bold ? fontBold : italic ? fontItalic : font;
    page.drawText(text, {
      x: 50,
      y,
      size,
      font: selectedFont,
      color: rgb(0.1, 0.1, 0.1),
    });
    y -= size + 6;
  };

  const drawDivider = (thickness = 1, color = rgb(0.8, 0.8, 0.8), yOffset = 8) => {
    y -= 4;
    page.drawLine({
      start: { x: 50, y },
      end: { x: 545, y },
      thickness,
      color,
    });
    y -= yOffset;
  };

  const drawTwoColumns = (left: string, right: string, leftSize = 11, rightSize = 11, leftBold = false, rightBold = false) => {
    page.drawText(left, {
      x: 50,
      y,
      size: leftSize,
      font: leftBold ? fontBold : font,
      color: rgb(0.1, 0.1, 0.1),
    });
    page.drawText(right, {
      x: 400,
      y,
      size: rightSize,
      font: rightBold ? fontBold : font,
      color: rgb(0.1, 0.1, 0.1),
    });
    y -= Math.max(leftSize, rightSize) + 6;
  };

  // En-tête avec logo et informations
  // Rectangle décoratif en haut
  page.drawRectangle({
    x: 0,
    y: 842 - 80,
    width: 595,
    height: 80,
    color: rgb(0.2, 0.4, 0.6),
  });
  
  page.drawText("INTISAR", {
    x: 50,
    y: 842 - 45,
    size: 24,
    font: fontBold,
    color: rgb(1, 1, 1),
  });
  
  page.drawText("Voyages & Omra", {
    x: 50,
    y: 842 - 65,
    size: 12,
    font: font,
    color: rgb(0.9, 0.9, 0.9),
  });
  
  page.drawText("Devis", {
    x: 500,
    y: 842 - 45,
    size: 20,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  y = 720;
  
  // Informations du devis
  line(`Devis n° ${input.numero}`, 14, true);
  line(`Date d'émission: ${new Date().toLocaleDateString('fr-FR')}`, 10);
  line(`Validité: ${input.validiteJours} jours`, 10);
  drawDivider(1.5, rgb(0.2, 0.4, 0.6), 12);

  // Section Client
  line("INFORMATIONS CLIENT", 12, true);
  drawDivider(0.5, rgb(0.5, 0.5, 0.5), 8);
  
  page.drawRectangle({
    x: 50,
    y: y - 60,
    width: 495,
    height: 70,
    color: rgb(0.95, 0.95, 0.95),
    borderColor: rgb(0.8, 0.8, 0.8),
    borderWidth: 0.5,
  });
  
  const clientY = y - 15;
  page.drawText("Nom:", { x: 65, y: clientY, size: 10, font: fontBold });
  page.drawText(input.clientNom, { x: 120, y: clientY, size: 10, font: font });
  
  const emailY = y - 32;
  page.drawText("Email:", { x: 65, y: emailY, size: 10, font: fontBold });
  page.drawText(input.clientEmail, { x: 120, y: emailY, size: 10, font: font });
  
  const telY = y - 49;
  page.drawText("Tél:", { x: 65, y: telY, size: 10, font: fontBold });
  page.drawText(input.clientTel, { x: 120, y: telY, size: 10, font: font });
  
  if (input.clientVille) {
    const villeY = y - 66;
    page.drawText("Ville:", { x: 300, y: villeY, size: 10, font: fontBold });
    page.drawText(input.clientVille, { x: 355, y: villeY, size: 10, font: font });
  }
  
  y -= 80;
  drawDivider(0.5, rgb(0.5, 0.5, 0.5), 12);

  // Section Détails du voyage
  line("DÉTAILS DU VOYAGE", 12, true);
  drawDivider(0.5, rgb(0.5, 0.5, 0.5), 8);
  
  page.drawRectangle({
    x: 50,
    y: y - 45,
    width: 495,
    height: 55,
    color: rgb(0.95, 0.95, 0.95),
    borderColor: rgb(0.8, 0.8, 0.8),
    borderWidth: 0.5,
  });
  
  const packY = y - 15;
  page.drawText("Pack:", { x: 65, y: packY, size: 10, font: fontBold });
  page.drawText(input.packTitle, { x: 120, y: packY, size: 10, font: font });
  
  const nbPersonnesY = y - 32;
  page.drawText("Personnes:", { x: 65, y: nbPersonnesY, size: 10, font: fontBold });
  page.drawText(`${input.nbPersonnes} personne(s)`, { x: 120, y: nbPersonnesY, size: 10, font: font });
  
  if (input.dateDepart) {
    const dateY = y - 49;
    page.drawText("Date départ:", { x: 300, y: dateY, size: 10, font: fontBold });
    page.drawText(input.dateDepart.toLocaleDateString('fr-FR'), { x: 385, y: dateY, size: 10, font: font });
  }
  
  y -= 65;
  drawDivider(0.5, rgb(0.5, 0.5, 0.5), 12);

  // Section Récapitulatif financier
  line("RÉCAPITULATIF FINANCIER", 12, true);
  drawDivider(0.5, rgb(0.5, 0.5, 0.5), 8);
  
  // Tableau des prix
  const tableX = 50;
  const tableWidth = 495;
  let tableY = y;
  
  // En-tête du tableau
  page.drawRectangle({
    x: tableX,
    y: tableY - 25,
    width: tableWidth,
    height: 25,
    color: rgb(0.2, 0.4, 0.6),
  });
  
  page.drawText("Description", { x: tableX + 10, y: tableY - 18, size: 10, font: fontBold, color: rgb(1, 1, 1) });
  page.drawText("Montant (MAD)", { x: tableX + 400, y: tableY - 18, size: 10, font: fontBold, color: rgb(1, 1, 1) });
  
  tableY -= 25;
  
  // Ligne du sous-total
  page.drawRectangle({
    x: tableX,
    y: tableY - 25,
    width: tableWidth,
    height: 25,
    color: rgb(1, 1, 1),
    borderColor: rgb(0.8, 0.8, 0.8),
    borderWidth: 0.5,
  });
  page.drawText("Sous-total", { x: tableX + 10, y: tableY - 18, size: 10, font: font });
  page.drawText(`${input.montantTotal.toFixed(2)}`, { x: tableX + 420, y: tableY - 18, size: 10, font: font });
  
  tableY -= 25;
  
  // Ligne de la remise (si applicable)
  if (input.remise > 0) {
    let remiseLabel = "Remise";
    if (input.remiseType === "pourcentage" && input.remiseValeur) {
      remiseLabel = `Remise (${input.remiseValeur}%)`;
    }
    
    page.drawRectangle({
      x: tableX,
      y: tableY - 25,
      width: tableWidth,
      height: 25,
      color: rgb(1, 1, 1),
      borderColor: rgb(0.8, 0.8, 0.8),
      borderWidth: 0.5,
    });
    page.drawText(remiseLabel, { x: tableX + 10, y: tableY - 18, size: 10, font: font });
    page.drawText(`- ${input.remise.toFixed(2)}`, { x: tableX + 420, y: tableY - 18, size: 10, font: font, color: rgb(0.8, 0.2, 0.2) });
    tableY -= 25;
  }
  
  // Total
  page.drawRectangle({
    x: tableX,
    y: tableY - 30,
    width: tableWidth,
    height: 30,
    color: rgb(0.95, 0.95, 0.95),
    borderColor: rgb(0.2, 0.4, 0.6),
    borderWidth: 1,
  });
  page.drawText("TOTAL TTC", { x: tableX + 10, y: tableY - 20, size: 12, font: fontBold });
  page.drawText(`${input.montantFinal.toFixed(2)} MAD`, { x: tableX + 400, y: tableY - 20, size: 13, font: fontBold, color: rgb(0.2, 0.6, 0.2) });
  
  y = tableY - 40;
  drawDivider(0.5, rgb(0.5, 0.5, 0.5), 12);

  // Conditions générales
  line("CONDITIONS GÉNÉRALES", 10, true);
  line("• Ce devis est valable sous réserve de disponibilité à la date de réservation.", 8);
  line("• Un acompte de 30% est demandé à la confirmation.", 8);
  line("• Le solde est à régler 30 jours avant le départ.", 8);
  line("• Les prestations non consommées ne sont pas remboursables.", 8);
  y -= 10;

  // Notes supplémentaires
  if (input.notes) {
    drawDivider(0.5, rgb(0.5, 0.5, 0.5), 12);
    line("NOTES SUPPLÉMENTAIRES", 10, true);
    
    // Zone de notes avec fond gris clair
    const notesLines = input.notes.split('\n');
    const notesHeight = notesLines.length * 20;
    page.drawRectangle({
      x: 50,
      y: y - notesHeight - 10,
      width: 495,
      height: notesHeight + 15,
      color: rgb(0.98, 0.98, 0.98),
      borderColor: rgb(0.8, 0.8, 0.8),
      borderWidth: 0.5,
    });
    
    for (let i = 0; i < notesLines.length; i++) {
      line(notesLines[i], 9, false, true);
    }
    y -= 15;
  }
  
  y -= 20;
  drawDivider(1, rgb(0.2, 0.4, 0.6), 15);

  // Pied de page
  const pageHeight = 842;
  const footerY = 50;
  
  page.drawLine({
    start: { x: 50, y: footerY + 40 },
    end: { x: 545, y: footerY + 40 },
    thickness: 0.5,
    color: rgb(0.8, 0.8, 0.8),
  });
  
  page.drawText("INTISAR Voyages - Agence de voyage agréée", {
    x: 50,
    y: footerY + 25,
    size: 8,
    font: fontItalic,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  page.drawText("contact@intisar-voyages.ma | Tél: +212 5XX-XXXXXX", {
    x: 50,
    y: footerY + 12,
    size: 8,
    font: fontItalic,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  page.drawText(`Page 1/1 - Généré le ${new Date().toLocaleString('fr-FR')}`, {
    x: 400,
    y: footerY + 12,
    size: 7,
    font: font,
    color: rgb(0.6, 0.6, 0.6),
  });

  return doc.save();
}