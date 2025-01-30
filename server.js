const express = require("express");
const Web3 = require("web3");
const axios = require("axios");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// API and Network Configurations
const etherscanApiUrl = "https://api.etherscan.io/api"; // Etherscan API for Ethereum transactions
const etherscanApiKey = "5EFNVETHY9FE27AJPH2UYATTSMKH9S41YW"; // Etherscan API key
const hashChainRpcUrl = "http://145.223.103.175:8779"; // Public RPC for Hash Chain Network
const hashWeb3 = new Web3(new Web3.providers.HttpProvider(hashChainRpcUrl));

// Parameters
const ethTransferAmount = Web3.utils.toWei("0.001", "ether"); // The ETH amount to check for (0.001 ETH)
const userReceiverAddress = "0xCfC11BB9BBd7aAE2B34025f9A282e3850edd2A40"; // The address receiving ETH
const hashCoinAmountToSend = Web3.utils.toWei("1", "ether"); // Amount of Hash Coin to send (1 Hash Coin = 1 ETH)
const gasLimit = 21000; // Gas limit for a basic ETH transfer

// Function to send 1 Hash Coin (native) to the sender on the Hash Chain network
async function sendHashCoin(userAddress) {
    const accounts = await hashWeb3.eth.getAccounts();
    const sender = accounts[0];

    try {
        // Sending native Hash Coin (ETH on Hash Chain network)
        const tx = {
            from: sender,
            to: userAddress,
            value: hashCoinAmountToSend, // Sending 1 Hash Coin (1 ETH equivalent)
            gas: gasLimit, // Default gas for simple transfer
        };

        const receipt = await hashWeb3.eth.sendTransaction(tx);
        console.log(`1 Hash Coin successfully sent to ${userAddress}`);
        console.log(receipt);
    } catch (error) {
        console.error("Error sending Hash Coin:", error);
    }
}

// Function to check Ethereum transactions on Etherscan
async function checkTransactions() {
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
            // Check if the transaction matches the expected amount of 0.001 ETH
            if (tx.to.toLowerCase() === userReceiverAddress.toLowerCase() && tx.value === ethTransferAmount) {
                console.log(`Valid transaction detected: ${tx.hash}`);
                try {
                    await sendHashCoin(tx.from); // Send 1 Hash Coin to the sender
                    console.log(`Hash Coin sent to: ${tx.from}`);
                } catch (error) {
                    console.error(`Failed to send Hash Coin to ${tx.from}:`, error);
                }
            }
        }
    } catch (error) {
        console.error("Error fetching transactions from Etherscan:", error);
    }
}

// Set the interval to check for new Ethereum transactions every 15 seconds
setInterval(checkTransactions, 15000); // Check every 15 seconds

// Endpoint to manually check Ethereum transactions (optional)
app.get("/check", (req, res) => {
    checkTransactions()
        .then(() => res.send("Checked for transactions."))
        .catch((error) => res.status(500).send("Error checking transactions."));
});

// Start the Express server
app.listen(3000, () => {
    console.log("Backend running on port 3000");
});
