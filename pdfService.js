
const { PDFDocument, rgb } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit');
const fs = require('fs');
const path = require('path');

async function createPDF(transcript) {
  try {
    const pdfDoc = await PDFDocument.create();
    
    // Register fontkit instance
    pdfDoc.registerFontkit(fontkit);
    
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const fontSize = 12;
    
    // Load the font
    const fontPath = path.join(__dirname, 'Fonts', 'liberation-fonts-ttf-2.1.5', 'LiberationSerif-Regular.ttf');
    const fontBytes = fs.readFileSync(fontPath);
    const customFont = await pdfDoc.embedFont(fontBytes);
    
    // Add basic content to the PDF
    page.drawText('Test PDF Generation', {
      x: 50,
      y: height - 50 - fontSize,
      size: fontSize + 8,
      font: customFont,
      color: rgb(0, 0, 0),
    });

    // Add the transcript content
    page.drawText(transcript, {
      x: 50,
      y: height - 100 - fontSize,
      size: fontSize,
      font: customFont,
      color: rgb(0, 0, 0),
    });

    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}

module.exports = { createPDF };
