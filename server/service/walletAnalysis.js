const Moralis = require('moralis')
const walletPrompt = require('../prompt/walletAnalyze')
const walletSystem = require('../prompt/systemWalletAnalyze')

const API_KEY = process.env.API_KEY;
const BASE_URL = process.env.BASE_URL;

const CHAINS = {
    ethereum: "0x1",
    bsc: "0x38",
    polygon: "0x89",
    arbitrum: "0xa4b1",
    optimism: "0xa",
    avalanche: "0xa86a",
    base: "0x2105"
};

async function analyzeWalletAcrossChains(address) {
    const results = [];

    for (const [name, chain] of Object.entries(CHAINS)) {
        try {
            const nativeRes = await Moralis.default.EvmApi.balance.getNativeBalance({ address, chain })
            const tokensRes = await Moralis.default.EvmApi.wallets.getWalletTokenBalancesPrice({ address, chain });
            
            const native = nativeRes.toJSON();
            const tokens = tokensRes.response.toJSON();

            results.push({
                chain: name,
                nativeBalance: parseFloat(native.balance) / Math.pow(10, 18),
                tokens: tokens.result.map(t => ({
                    name: t.name,
                    symbol: t.symbol,
                    balance: parseFloat(t.balance) / Math.pow(10, t.decimals),
                    price: t.usd_price,
                    possible_spam: t.possible_spam
                }))
            });
        } catch (err) {
            results.push({ chain: name, error: err.message });
        }
    }
    return results;
}

async function chatAnalyze(input) {
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
                { role: "system", content: walletSystem },
                { role: "user", content: walletPrompt(input) }
            ]
        })
    });
    const data = await response.json();

    return (data.choices[0].message.content);
}

async function analyzeWallet(address) {
    const data = await analyzeWalletAcrossChains(address);
    const tokenSummary = [];

    for (const chainData of data) {
        if (chainData.error) {
            return "Wallet address not found. Please check the address and try again."
        }
        for (let i = 0; i < chainData.tokens.length; i++) {
            const token = chainData.tokens[i];
            const priceNum = parseFloat(token.price) || 0;
            const usdValue = token.balance * priceNum;

            tokenSummary.push({
                name: token.name,
                symbol: token.symbol,
                chain: chainData.chain,
                balance: parseFloat(token.balance.toFixed(4)),
                usdValue: parseFloat(usdValue.toFixed(2)),
            });
        }
    }
    const res = await chatAnalyze(tokenSummary);
    return res;
}

module.exports = analyzeWallet;
