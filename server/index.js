const express = require('express')
const cors = require("cors");
const Moralis = require('moralis');
require('dotenv').config();

const app = express()
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

const chatLLMs = require('./chat/index')
const callLLM = require('./service/general')
const addressTracking = require('./service/walletAnalysis')
const analyzeToken = require('./service/tokenAnalysis')
const ask = require('./service/ask')
const tracking = require('./service/tracking')
const getWalletData = require('./service/walletData')
const phisingAdress = require('./address.json')


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
            return res.json({ answer: "Unrecognized intent" });
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

app.listen(3000, async () => {
    await Moralis.default.start({
        apiKey: process.env.MORALIS_API_KEY
    });
})
