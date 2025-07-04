const system = require('../prompt/system')
const analyze = require('../prompt/analyze')

const API_KEY = process.env.API_KEY;
const BASE_URL = process.env.BASE_URL;

function extractJsonFromLLMOutput(text) {
    const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (match && match[1]) {
        try {
            return JSON.parse(match[1]);
        } catch (err) {
            console.error("❌ Failed to parse JSON inside backticks:", err);
        }
    }
    try {
        return JSON.parse(text);
    } catch (err) {
        console.error("❌ Failed to parse direct JSON:", err);
        return null;
    }
}

async function chatLLMs(question) {
    const response = await fetch(`${BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: "microsoft/phi-4",
            temperature: 0.7,
            stream: false,
            max_completion_tokens: 100,
            messages: [
                { role: "system", content: system },
                { role: "user", content: analyze(question) }
            ]
        })
    });
    const data = await response.json();
    
    const res = extractJsonFromLLMOutput(data.choices[0].message.content);
    return res;
}

module.exports = chatLLMs;