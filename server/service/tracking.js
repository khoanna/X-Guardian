const Moralis = require('moralis');
const phisingAdress = require('../address.json')

const CHAINS = {
    ethereum: { id: "0x1", explorer: "https://etherscan.io/tx/" },
    bsc: { id: "0x38", explorer: "https://bscscan.com/tx/" },
    polygon: { id: "0x89", explorer: "https://polygonscan.com/tx/" },
    arbitrum: { id: "0xa4b1", explorer: "https://arbiscan.io/tx/" },
    optimism: { id: "0xa", explorer: "https://optimistic.etherscan.io/tx/" },
    avalanche: { id: "0xa86a", explorer: "https://snowtrace.io/tx/" },
    base: { id: "0x2105", explorer: "https://basescan.org/tx/" }
};

const trackingAddress = async (address) => {
    const txData = [];

    for (const [name, { id: chainId, explorer }] of Object.entries(CHAINS)) {
        try {
            const res = await Moralis.default.EvmApi.transaction.getWalletTransactions({
                address,
                chain: chainId
            });

            const result = res.toJSON();

            for (const tx of result.result) {
                txData.push({
                    chain: name,
                    from: {
                        address: tx.from_address,
                        isPhising: phisingAdress.includes(tx.from_address)
                    },
                    to: {
                        address: tx.to_address,
                        isPhising: phisingAdress.includes(tx.to_address)
                    },
                    value: `${parseFloat(tx.value) / 1e18}`,
                    hash: tx.hash,
                    explorerUrl: `${explorer}${tx.hash}`
                });
            }
        } catch (err) {
            console.error(`❌ Error on ${name}:`, err.message);
        }
    }
    return txData;
};

module.exports = trackingAddress;
