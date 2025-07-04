function generateWalletAnalysisPrompt(walletAssets) {
    let totalUsd = 0;
    const chains = {};

    for (const asset of walletAssets) {
        const { name, symbol, chain, balance, usdValue, possible_spam } = asset;
        totalUsd += usdValue;

        if (!chains[chain]) chains[chain] = [];
        chains[chain].push(`- **${name} (${symbol})**: ${balance} — $${usdValue} - possible spam: ${possible_spam}`);
    }

    const chainSections = Object.entries(chains).map(([chain, assets]) => {
        const formattedChain = chain.charAt(0).toUpperCase() + chain.slice(1);
        return `### 🔗 ${formattedChain} Chain\n${assets.join('\n')}`;
    }).join('\n\n');

    return `
You are a professional blockchain investigator. Please analyze the following wallet information and assess its **trustworthiness** based on:

- 💰 Token diversity and value
- 🛑 Suspicious or spam tokens

## 📦 Wallet Assets

${chainSections}

**Total Value**: ~$${totalUsd.toFixed(2)}  
**Chains Active**: ${Object.keys(chains).length}

---

## ✅ Please return your analysis in well-structured **Markdown format** for UI rendering. Expected Output Format: 


###  **Token Value & Diversity**: ...
### **Suspicious Tokens**: ...
###  **Conclusion**: ...
### Trust Rating: **High / Medium / Low**

Use clean Markdown with headings, bold text, and clear structure to make the response easy to display on a user interface. Use bullet points for listing token.
`;
}



module.exports = generateWalletAnalysisPrompt;