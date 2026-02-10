const { getStore } = require('@netlify/blobs');
const PDFDocument = require('pdfkit');

exports.handler = async (event, context) => {
    // Only allow GET requests
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const id = event.queryStringParameters?.id;
        
        if (!id) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Missing ID parameter' })
            };
        }
        
        // Retrieve data from Netlify Blobs
        const store = getStore('allergy-data');
        const dataString = await store.get(id);
        
        if (!dataString) {
            console.log('Data not found for ID:', id);
            return {
                statusCode: 404,
                headers: { 'Content-Type': 'text/html' },
                body: `
                    <!DOCTYPE html>
                    <html>
                    <head><title>Not Found</title></head>
                    <body>
                        <h1>Allergy Data Not Found</h1>
                        <p>The requested allergy information could not be found.</p>
                        <p>ID: ${id}</p>
                    </body>
                    </html>
                `
            };
        }
        
        const data = JSON.parse(dataString);
        console.log('Retrieved data for ID:', id);

        // Create PDF in memory
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ margin: 50 });
            const chunks = [];

            doc.on('data', (chunk) => chunks.push(chunk));
            
            doc.on('end', () => {
                const pdfBuffer = Buffer.concat(chunks);
                resolve({
                    statusCode: 200,
                    headers: {
                        'Content-Type': 'application/pdf',
                        'Content-Disposition': 'inline; filename="allergy-info.pdf"',
                        'Cache-Control': 'public, max-age=3600'
                    },
                    body: pdfBuffer.toString('base64'),
                    isBase64Encoded: true
                });
            });

            doc.on('error', (error) => {
                console.error('PDF generation error:', error);
                reject(error);
            });

            // Add content to PDF
            doc.fontSize(24)
               .fillColor('#d32f2f')
               .text('🚨 Allergy Information', { align: 'center' });
            
            doc.moveDown(2);
            
            // Name
            doc.fontSize(16)
               .fillColor('#000000')
               .text('Name:', { continued: true, underline: true });
            doc.fontSize(14)
               .text(` ${data.Name}`, { underline: false });
            doc.moveDown(0.8);
            
            // Date of Birth
            doc.fontSize(16)
               .text('Date of Birth:', { continued: true, underline: true });
            doc.fontSize(14)
               .text(` ${data.Dob}`, { underline: false });
            doc.moveDown(0.8);
            
            // Allergies
            doc.fontSize(16)
               .fillColor('#d32f2f')
               .text('Known Allergies:', { underline: true });
            doc.moveDown(0.5);
            
            doc.fontSize(14)
               .fillColor('#000000');
            
            data.listOfAllergies.forEach((allergy, index) => {
                doc.text(`${index + 1}. ${allergy}`, { indent: 20 });
                doc.moveDown(0.4);
            });
            
            // Footer
            doc.moveDown(3);
            doc.fontSize(10)
               .fillColor('#666666')
               .text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });

            doc.end();
        });
        
    } catch (error) {
        console.error('Error generating PDF:', error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                error: 'Error generating PDF',
                message: error.message 
            })
        };
    }
};