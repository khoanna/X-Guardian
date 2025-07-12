const express = require('express')
const cors = require("cors");
const Moralis = require('moralis');
const nodemailer = require("nodemailer");
const { ethers } = require("ethers");

require('dotenv').config();

const app = express()
app.use(express.json());
app.use(cors({
  origin: 'https://x-guardian.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

const chatLLMs = require('./chat/index')
const callLLM = require('./service/general')
const addressTracking = require('./service/walletAnalysis')
const analyzeToken = require('./service/tokenAnalysis')
const ask = require('./service/ask')
const tracking = require('./service/tracking')
const getWalletData = require('./service/walletData')
const phisingAdress = require('./address.json')

const chains = [
    {
        id: "0x1",
        name: "Ethereum",
        explorer: "https://etherscan.io",
        token: "ETH"
    },
    {
        id: "0x38",
        name: "BNB Smart Chain",
        explorer: "https://bscscan.com",
        token: "BNB"
    },
    {
        id: "0x89",
        name: "Polygon",
        explorer: "https://polygonscan.com",
        token: "POL"
    },
    {
        id: "0xa4b1",
        name: "Arbitrum One",
        explorer: "https://arbiscan.io",
        token: "ETH"
    },
    {
        id: "0xa",
        name: "Optimism",
        explorer: "https://optimistic.etherscan.io",
        token: "ETH"
    },
    {
        id: "0xa86a",
        name: "Avalanche C-Chain",
        explorer: "https://snowtrace.io",
        token: "AVAX"
    },
    {
        id: "0x2105",
        name: "Base",
        explorer: "https://basescan.org",
        token: "ETH"
    },
    {
        id: "0xaa36a7",
        name: "Sepolia Testnet",
        explorer: "https://sepolia.etherscan.io",
        token: "ETH"
    }
];


app.post('/agent', async (req, res) => {
    const chatRespone = await chatLLMs(req.body?.message.text);

    switch (chatRespone.intent) {
        case "general_qa":
            const answer = await callLLM(chatRespone.question);
            return res.json({ answer });

        case "wallet_analysis":
            const answerWallet = await addressTracking(chatRespone.address);
            return res.json({ answer: answerWallet });

        case "token_analysis":
            const tokenData = await analyzeToken(chatRespone.token, chatRespone.question);
            return res.json({ answer: tokenData });
        case "another":
            const respone = await ask(chatRespone.question);
            return res.json({ answer: respone });

        default:
            return res.json({ answer: "Sorry, I couldn't understand your request. Please make sure your question includes only one wallet address or one token, and that it clearly relates to blockchain, wallets, or tokens." });
    }

})

app.post('/tracking', async (req, res) => {
    const address = req.body.address;
    const txData = await tracking(address);
    res.json({ isPhising: phisingAdress.includes(address), txData })
})

app.post('/wallet', async (req, res) => {
    const address = req.body.address;
    const walletData = await getWalletData(address);
    if (phisingAdress.includes(address)) {
        walletData.isPhising = true;
    } else {
        walletData.isPhising = false;
    }
    res.json(walletData);
})

app.post('/webhook', async (req, res) => {
    const fromAddress = req.body?.txs[0]?.fromAddress;
    const toAddress = req.body?.txs[0]?.toAddress;
    const value = Number(req.body?.txs[0]?.value) / 10 ** 18;
    const chain = chains.filter(item => item.id === req.body?.chainId)
    const tx = `${chain[0].explorer}/tx/${req.body?.txs[0]?.hash}`;
    const currency = chain[0]?.token;
    const htmlContent = `
  <div style="font-family: Arial, sans-serif; font-size: 15px; color: #222;">
    <p>Dear user,</p>

    <p>
      We detected a new transaction involving your wallet on the
      <strong>${chain[0].name}</strong> network.
    </p>

    <ul style="list-style: none; padding-left: 0;">
      <li>📤 <strong>From:</strong> ${fromAddress}</li>
      <li>📥 <strong>To:</strong> ${toAddress}</li>
      <li>💰 <strong>Amount:</strong> ${value} ${currency}</li>
      <li>🔗 <strong>Transaction Link:</strong>
        <a href="${tx}" target="_blank" style="color: #1d4ed8; text-decoration: underline;">
          View on Explorer
        </a>
      </li>
    </ul>

    <p>
      This transaction was captured and processed via our monitoring system.
      If you do not recognize this activity, please take immediate action to secure your wallet.
    </p>

    <p>Thank you for using <strong>X-Guardian</strong>.</p>

    <p>
      Best regards,<br />
      <strong>X-Guardian Team</strong>
    </p>
  </div>
`;

    const provider = new ethers.JsonRpcProvider("https://1rpc.io/sepolia");
    const contractAddress = "0x5e4E930cB10b1fee9d4fd39A78b7e99469A6211F";
    const abi = [{ "inputs": [{ "internalType": "string", "name": "_email", "type": "string" }], "name": "addEmail", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "user", "type": "address" }], "name": "emailChecker", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "wallet", "type": "address" }, { "internalType": "string", "name": "tag", "type": "string" }], "name": "followWallet", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "wallet", "type": "address" }], "name": "getEmailsByWatchedAddress", "outputs": [{ "internalType": "string[]", "name": "", "type": "string[]" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "user", "type": "address" }], "name": "getFollowedWallets", "outputs": [{ "components": [{ "internalType": "address", "name": "wallet", "type": "address" }, { "internalType": "string", "name": "tag", "type": "string" }], "internalType": "struct Watcher.FollowData[]", "name": "", "type": "tuple[]" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getMyEmail", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "wallet", "type": "address" }], "name": "isFollowing", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "wallet", "type": "address" }], "name": "unfollowWallet", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "wallet", "type": "address" }, { "internalType": "string", "name": "newTag", "type": "string" }], "name": "updateTagName", "outputs": [], "stateMutability": "nonpayable", "type": "function" }];
    const contract = new ethers.Contract(contractAddress, abi, provider);
    const listEmail = await contract.getEmailsByWatchedAddress(fromAddress);

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.MAIL,
            pass: process.env.APPPASS,
        },
    });

    listEmail.map(async (mail) => {
        const info = await transporter.sendMail({
            from: '"X-Guardian" <your_email@gmail.com>',
            to: mail,
            subject: "X-Guardian",
            html: htmlContent,
        });
    })
    res.json(0);
})

app.post('/moralis', async (req, res) => {
    const address = req.body.address;
    await Moralis.default.Streams.addAddress({
        id: process.env.STREAM,
        address: [
            address
        ], 
    });
})

app.listen(3000, async () => {
    await Moralis.default.start({
        apiKey: process.env.MORALIS_API_KEY
    });
})
