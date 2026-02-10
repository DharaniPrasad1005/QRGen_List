const { getStore } = require('@netlify/blobs');

exports.handler = async (event, context) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const data = JSON.parse(event.body);
        
        // Validate data
        if (!data.Name || !data.Dob || !data.listOfAllergies) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Missing required fields' })
            };
        }
        
        // Generate unique ID
        const id = Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
        
        // Store data in Netlify Blobs
        const store = getStore('allergy-data');
        await store.set(id, JSON.stringify(data), {
            metadata: { 
                createdAt: new Date().toISOString() 
            }
        });
        
        console.log('Data saved with ID:', id);
        
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        };
    } catch (error) {
        console.error('Error saving data:', error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};