const axios = require('axios');

exports.handler = async function(event, context) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        const body = JSON.parse(event.body);
        const userText = body.text;
        const apiKey = process.env.OPENROUTER_API_KEY;

        if (!apiKey) {
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: "API Key missing" })
            };
        }

        const response = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
                model: "meta-llama/llama-3.1-70b-instruct:", 
                messages: [
                    {
                        role: "system",
                        // Advanced Prompt for Bypassing AI Detectors
                        content: `You are an expert human ghostwriter with 20 years of experience. Your goal is to rewrite the provided text so that it passes all AI detectors (like ZeroGPT, Copyleaks, and GPTZero) with a 0% AI score.

                        STRICT WRITING RULES:
                        1. INCREASE PERPLEXITY: Use sophisticated and varied vocabulary. Avoid repeating common words.
                        2. INCREASE BURSTINESS: Mix very short, punchy sentences with longer, complex ones. This is the #1 way to bypass detectors.
                        3. REMOVE AI MARKERS: Do not use transition words like 'Moreover', 'Furthermore', 'In conclusion', or 'Additionally'.
                        4. NATURAL FLOW: Use contractions (can't, don't), occasional rhetorical questions, and a conversational but professional tone.
                        5. RESTRUCTURE: Completely change the sentence order and paragraph flow while keeping the original meaning intact.
                        6. IDIOMATIC EXPRESSIONS: Use natural human idioms and phrases that AI rarely uses.
                        
                        Output ONLY the rewritten text. Do not provide any introductions or explanations.`
                    },
                    {
                        role: "user",
                        content: userText
                    }
                ],
                // Randomness badhane ke liye temperature 0.9 rakha hai
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

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ output: response.data.choices[0].message.content })
        };

    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: "API Issue", detail: error.message })
        };
    }
};
