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
const web3 = new Web3(hashChainRpc); // Connect to Hash Chain network using the RPC URL

// Backend Wallet Details
const privateKey = process.env.BACKEND_PRIVATE_KEY; // Backend wallet private key
const backendAddress = process.env.BACKEND_WALLET_ADDRESS; // Backend wallet address

// Set the ETH amount to listen for (in Wei) and the deposit address to send Hash coins to
const ethTransferAmount = Web3.utils.toWei("0.001", "ether"); // Amount to check for (0.001 ETH)
const gasLimit = 21000; // Gas limit for a basic ETH transfer

// Function to send native Hash coins (native cryptocurrency) to the sender
async function sendHashCoinsToSender(depositAddress) {
    const account = web3.eth.accounts.privateKeyToAccount(privateKey);

    // Check if depositAddress is provided
    if (!depositAddress) {
        console.error("Deposit address is required!");
        return;
    }

    // Set up the transaction to send Hash coins to the deposit address
    const tx = {
        from: account.address,
        to: depositAddress, // Send Hash coins to the deposit address (ETH sender)
        value: Web3.utils.toWei("1", "ether"), // Send 1 Hash coin (assuming 18 decimals for Hash coin)
        gas: gasLimit, // Set appropriate gas limit for a basic ETH transaction
    };

    // Sign and send the transaction
    try {
        const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        console.log(`Transaction successful: ${receipt.transactionHash}`);
    } catch (error) {
        console.error("Error sending Hash coins:", error);
    }
}

// Function to check Ethereum transactions using Etherscan API
async function checkEthereumTransactions() {
    try {
        const response = await axios.get(etherscanApiUrl, {
            params: {
                module: "account",
                action: "txlist",
                address: backendAddress,
                sort: "desc",
                apikey: etherscanApiKey,
            },
        });

        const transactions = response.data.result;
        for (const tx of transactions) {
            if (tx.to.toLowerCase() === backendAddress.toLowerCase() && tx.value === ethTransferAmount) {
                console.log("Valid Ethereum deposit detected:", tx.hash);

                // Extract the deposit address from the transaction (tx.from)
                const depositAddress = tx.from;
                console.log("Deposit address: ", depositAddress);

                // Call the function to send Hash coins to the deposit address
                await sendHashCoinsToSender(depositAddress);
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
