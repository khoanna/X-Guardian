const tokenPrompt = require('../prompt/token')
const API_KEY = process.env.API_KEY;
const BASE_URL = process.env.BASE_URL;

async function getTokenInfo(tokenName) {
    const searchRes = await fetch(`https://api.coingecko.com/api/v3/search?query=${tokenName}`);
    const searchData = await searchRes.json();

    const coin = searchData.coins?.[0];
    if (!coin) throw new Error("Token not found");

    const coinId = coin.id;

    const detailsRes = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}`);
    const detailsData = await detailsRes.json();

    return {
        name: detailsData.name,
        symbol: detailsData.symbol,
        market_cap: detailsData.market_data.market_cap.usd,
        price: detailsData.market_data.current_price.usd,
        volume: detailsData.market_data.total_volume.usd,
        description: detailsData.description.en,
        homepage: detailsData.links.homepage?.[0],
        categories: detailsData.categories,
        contract_address: detailsData.platforms || null
    };
}

async function analyzeToken(token, question) {
    try {
        const tokenData = await getTokenInfo(token);
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
                    { role: "system", content: "You are an expert in tokenomics and blockchain research." },
                    { role: "user", content: tokenPrompt(tokenData, question) }
                ]
            })
        });
        const data = await response.json();
        
        return (data.choices[0].message.content);
    } catch (error) {
        return "Token not found!";
    }
}

module.exports = analyzeToken;