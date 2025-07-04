const Moralis = require('moralis');
const phisingAdress = require('../address.json')



const getWalletData = async (address) => {
    const res = await Moralis.default.EvmApi.wallets.getWalletActiveChains({
        address,
        chains: ["0x1", "0x38", "0x89", "0xa4b1", "0xa", "0xa86a", "0x2105"]
    });

    const result = res.toJSON();

    return result;
};

module.exports = getWalletData;
