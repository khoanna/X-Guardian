function generateTokenAnalysisPrompt(tokenData, userQuestion) {
  return `
# 🪙 Token Analysis: ${tokenData.name} (${tokenData.symbol.toUpperCase()})

You are an expert in tokenomics and blockchain research. A user asked:  
"${userQuestion}"

---

## 📊 Token Data:
- **Current Price**: $${tokenData.price}
- **Market Cap**: $${tokenData.market_cap.toLocaleString()}
- **24h Volume**: $${tokenData.volume.toLocaleString()}
- **Homepage**: ${tokenData.homepage}
- **Categories**: ${tokenData.categories?.join(", ") || "N/A"}

## 🔍 Description:
${tokenData.description?.slice(0, 500) || "No description available."}

---

## ✅ Task:

Please analyze the token based on the above information. Include:

## Token Purpose & Category  
- Is it a meme token, utility, governance, scam, etc?

## Popularity & Liquidity  
- Based on volume, market cap, and visibility.

## Red Flags (if any)  
- Contract anomalies, no homepage, spammy naming, etc.

## Final Assessment  
- Give a trust rating (High / Medium / Low)  
- Answer the user's question briefly at the end
`;
}

module.exports = generateTokenAnalysisPrompt;