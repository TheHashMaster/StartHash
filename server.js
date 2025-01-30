const Web3 = require('web3');
const axios = require('axios');
const bodyParser = require('body-parser');
require('dotenv').config();

const express = require('express');
const app = express();
app.use(bodyParser.json());

// API and Network Configurations
const hashChainRpc = "http://145.223.103.175:8779"; // Public RPC for Hash Chain Network
const etherscanApiUrl = "https://api.etherscan.io/api"; // Etherscan API for Ethereum transactions
const etherscanApiKey = process.env.ETHERSCAN_API_KEY; // Your Etherscan API key

// Initialize Web3 for Hash Chain
const web3 = new Web3(hashChainRpc); // In Web3 v4+, simply pass the provider URL to the Web3 constructor

// Parameters
const ethTransferAmount = Web3.utils.toWei("0.001", "ether"); // Amount to check for (0.001 ETH)
const userReceiverAddress = "0xCfC11BB9BBd7aAE2B34025f9A282e3850edd2A40"; // Address receiving ETH
const hashCoinAmountToSend = Web3.utils.toWei("1", "ether"); // Amount of Hash Coin to send (1 Hash Coin = 1 ETH)
const gasLimit = 21000; // Gas limit for a basic ETH transfer


// Function to send Hash Coins
async function sendHashCoins(fromAddress) {
    try {
        const accounts = await web3.eth.getAccounts(); // Get accounts from the Hash Chain network
        const sender = accounts[0]; // Use the first account as sender

        const tx = {
            from: sender,
            to: fromAddress,
            value: hashCoinAmountToSend,
            gas: gasLimit,
        };

        // Send transaction
        const receipt = await web3.eth.sendTransaction(tx);
        console.log("Transaction successful:", receipt);
    } catch (error) {
        console.error("Error sending Hash Coin:", error);
    }
}

// Function to check Ethereum transactions using Etherscan API
async function checkEthereumTransactions() {
    try {
        const response = await axios.get(etherscanApiUrl, {
            params: {
                module: "account",
                action: "txlist",
                address: userReceiverAddress,
                sort: "desc",
                apikey: etherscanApiKey,
            },
        });

        const transactions = response.data.result;
        for (const tx of transactions) {
            if (tx.to.toLowerCase() === userReceiverAddress.toLowerCase() && tx.value === ethTransferAmount) {
                console.log("Valid Ethereum transaction detected:", tx.hash);
                // Call the function to send Hash Coin to the sender
                await sendHashCoins(tx.from);
            }
        }
    } catch (error) {
        console.error("Error fetching Ethereum transactions:", error);
    }
}

// Set an interval to check transactions every 15 seconds
setInterval(checkEthereumTransactions, 15000);

// Start the server
app.listen(3000, () => {
    console.log("Backend server running on port 3000");
});

