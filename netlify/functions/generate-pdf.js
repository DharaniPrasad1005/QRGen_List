const PDFDocument = require('pdfkit');

exports.handler = async (event) => {
    // Only allow GET requests
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const id = event.queryStringParameters.id;

        // Retrieve data from storage
        global.allergyData = global.allergyData || new Map();
        const data = global.allergyData.get(id);

        if (!data) {
            return {
                statusCode: 404,
                body: 'Data not found'
            };
        }

        // Create PDF in memory
        return new Promise((resolve) => {
            const doc = new PDFDocument();
            const chunks = [];

            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => {
                const pdfBuffer = Buffer.concat(chunks);
                resolve({
                    statusCode: 200,
                    headers: {
                        'Content-Type': 'application/pdf',
                        'Content-Disposition': 'inline; filename="allergy-info.pdf"'
                    },
                    body: pdfBuffer.toString('base64'),
                    isBase64Encoded: true
                });
            });

            // Add content to PDF
            doc.fontSize(24).fillColor('#d32f2f').text('🚨 Allergy Information', { align: 'center' });
            doc.moveDown(2);

            doc.fontSize(16).fillColor('#000000').text('Name:', { continued: true, underline: true });
            doc.fontSize(14).text(` ${data.Name}`, { underline: false });
            doc.moveDown(0.5);

            doc.fontSize(16).text('Date of Birth:', { continued: true, underline: true });
            doc.fontSize(14).text(` ${data.Dob}`, { underline: false });
            doc.moveDown(0.5);

            doc.fontSize(16).fillColor('#d32f2f').text('Allergies:', { underline: true });
            doc.moveDown(0.3);

            doc.fontSize(14).fillColor('#000000');
            data.listOfAllergies.forEach((allergy, index) => {
                doc.text(`${index + 1}. ${allergy}`, { indent: 20 });
                doc.moveDown(0.3);
            });

            doc.moveDown(2);
            doc.fontSize(10).fillColor('#666666').text('Generated on: ' + new Date().toLocaleDateString(), { align: 'center' });

            doc.end();
        });

    } catch (error) {
        console.error('Error generating PDF:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Error generating PDF' })
        };
    }
};