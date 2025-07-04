const systemCall = require('../prompt/systemCall')

const API_KEY = process.env.API_KEY;
const BASE_URL = process.env.BASE_URL;

const callLLM = async (question) => {
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
            messages: [
                { role: "system", content: systemCall },
                { role: "user", content: question }
            ]
        })
    });
    const data = await response.json();
    return data.choices[0].message.content;
}

module.exports = callLLM;