// Simple in-memory storage (for production, use a database like Fauna, Supabase, etc.)
const dataStore = new Map();

exports.handler = async (event) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const data = JSON.parse(event.body);

        // Generate unique ID
        const id = Date.now().toString(36) + Math.random().toString(36).substr(2, 9);

        // Store data (in production, save to a database)
        // For Netlify, you'd typically use Netlify Blobs or an external DB
        global.allergyData = global.allergyData || new Map();
        global.allergyData.set(id, data);

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};