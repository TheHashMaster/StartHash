const express = require("express");
const Web3 = require("web3");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());

const ethProvider = "https://your-custom-rpc.com"; // Update with your custom RPC URL
const web3 = new Web3(new Web3.providers.HttpProvider(ethProvider));
const expectedAmount = web3.utils.toWei("0.001", "ether");
const receiverAddress = "0xYourEthereumAddress"; // Update with your ETH receiving address
const tokenTransferApi = "https://your-token-bridge.com/api/transfer"; // Update with actual token transfer API

app.post("/api/transfer", async (req, res) => {
    try {
        const { txHash, user } = req.body;
        if (!txHash || !user) return res.status(400).json({ message: "Invalid request" });

        const tx = await web3.eth.getTransaction(txHash);
        if (!tx || tx.to.toLowerCase() !== receiverAddress.toLowerCase() || tx.value !== expectedAmount) {
            return res.status(400).json({ message: "Invalid transaction" });
        }

        await axios.post(tokenTransferApi, { user, amount: "100" }); // Example token amount
        res.json({ message: "Token transfer initiated" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error processing transaction" });
    }
});

app.listen(3000, () => console.log("Backend running on port 3000"));
