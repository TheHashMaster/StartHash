const express = require("express");
const Web3 = require("web3");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());

const ethEtherscanApi = "https://api.etherscan.io/api"; // Etherscan API for Ethereum transactions
const api_key = "5EFNVETHY9FE27AJPH2UYATTSMKH9S41YW"; // Your Etherscan API key
const hashChainRpc = "http://145.223.103.175:8779"; // Public RPC for Hash Chain Network 7337
const hashWeb3 = new Web3(new Web3.providers.HttpProvider(hashChainRpc));
const expectedAmount = Web3.utils.toWei("0.001", "ether");
const receiverAddress = "0xCfC11BB9BBd7aAE2B34025f9A282e3850edd2A40"; // Your receiving ETH address

// Send 1 Hash Coin to the sender after verifying ETH transaction
async function sendHashCoinToSender(sender, amount) {
    const accounts = await hashWeb3.eth.getAccounts();
    const senderHash = accounts[0]; // Use your wallet to send the Hash Coin
    return hashWeb3.eth.sendTransaction({
        from: senderHash,
        to: sender,
        value: Web3.utils.toWei(amount, "ether"), // Transfer 1 Hash Coin (adjust for Hash Chain's coin value)
    });
}

// Check Ethereum transactions for the required payment (0.001 ETH)
async function checkTransactions() {
    try {
        const response = await axios.get(ethEtherscanApi, {
            params: {
                module: "account",
                action: "txlist",
                address: receiverAddress,
                sort: "desc",
                apikey: api_key,
            },
        });

        const transactions = response.data.result;
        for (const tx of transactions) {
            if (tx.to.toLowerCase() === receiverAddress.toLowerCase() && tx.value === expectedAmount) {
                console.log("Valid transaction detected:", tx.hash);
                try {
                    // Send 1 Hash Coin to the sender
                    await sendHashCoinToSender(tx.from, "1"); // Transfer 1 Hash Coin
                    console.log("Hash Coin transfer successful for", tx.from);
                } catch (error) {
                    console.error("Hash Coin transfer failed:", error);
                }
            }
        }
    } catch (error) {
        console.error("Error fetching Ethereum transactions:", error);
    }
}

// Endpoint to trigger transaction checking manually
app.get('/check-transactions', async (req, res) => {
    try {
        await checkTransactions();
        res.json({ success: true, message: 'Transaction check complete.' });
    } catch (error) {
        console.error("Error during transaction check:", error);
        res.status(500).send("Error during transaction check.");
    }
});

// Run check every 15 seconds
setInterval(checkTransactions, 15000); // Check every 15 seconds

app.listen(3000, () => console.log("Backend running on port 3000"));

