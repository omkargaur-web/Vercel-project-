const axios = require('axios');

export default async function handler(req, res) {
    // CORS Headers for Vercel
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    try {
        const { text: userText } = req.body;
        // Note: Make sure OPENROUTER_API_KEY is added in Vercel Settings
        const apiKey = process.env.OPENROUTER_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: "API Key missing in Vercel" });
        }

        const response = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
                model: "meta-llama/llama-3.1-70b-instruct", 
                messages: [
                    {
                        role: "system",
                        content: `You are an expert human ghostwriter with 20 years of experience. Rewrite the text to bypass AI detectors like ZeroGPT and GPTZero. Use varied sentence lengths (burstiness), sophisticated vocabulary (perplexity), and avoid transition words like 'Moreover' or 'Furthermore'. Use natural idioms and contractions. Output ONLY the rewritten text.`
                    },
                    {
                        role: "user",
                        content: userText
                    }
                ],
                temperature: 0.9,
                top_p: 1
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 45000
            }
        );

        // Vercel success response
        return res.status(200).json({ output: response.data.choices[0].message.content });

    } catch (error) {
        console.error("API Error:", error.message);
        return res.status(500).json({ 
            error: "API Issue", 
            detail: error.response?.data?.error?.message || error.message 
        });
    }
}
