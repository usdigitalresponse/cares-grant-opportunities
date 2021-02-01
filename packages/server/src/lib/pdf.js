const fs = require('fs').promises;
const path = require('path');
const { PDFDocument } = require('pdf-lib');

const staticPath = 'static/forms';

async function isDirectoryExists(directory) {
    try {
        await fs.stat(directory);
        return true;
    } catch (e) {
        return false;
    }
}

module.exports.fillPdf = async (filePath) => {
    const sourcePDF = await fs.readFile(path.resolve(__dirname, '..', staticPath, filePath));
    // Load a PDF with form fields
    const pdfDoc = await PDFDocument.load(sourcePDF);

    // Get the form containing all the fields
    const form = pdfDoc.getForm();

    const fields = form.getFields();
    fields.forEach((field) => {
        const type = field.constructor.name;
        const name = field.getName();
        if (type === 'PDFTextField') {
            field.setText('Mario');
        }
        console.log(`${type}: ${name}`);
    });
    const pdfBytes = await pdfDoc.save();
    const pdfPath = path.resolve(__dirname, '..', staticPath, './generated');
    if (!await isDirectoryExists(pdfPath)) {
        await fs.mkdir(pdfPath);
    }
    const generatedPdf = path.resolve(pdfPath, './test.pdf');
    await fs.writeFile(generatedPdf, pdfBytes);
    return `/${staticPath}/generated/test.pdf`;
};
