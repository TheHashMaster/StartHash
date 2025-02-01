const axios = require('axios');
require('dotenv').config();

// API and Network Configurations
const etherscanApiUrl = "https://api.etherscan.io/api"; // Etherscan API for Ethereum transactions
const etherscanApiKey = process.env.ETHERSCAN_API_KEY; // Your Etherscan API key

// Parameters
const ethTransferAmount = BigInt("1000000000000000"); // 0.001 ETH in Wei
const userReceiverAddress = "0xCfC11BB9BBd7aAE2B34025f9A282e3850edd2A40"; // Address receiving ETH
let lastCheckedBlock = 0; // Store last checked block to avoid duplicate processing

// Function to check Ethereum transactions using Etherscan API
async function checkEthereumTransactions() {
    try {
        console.log("Checking for new transactions...");

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
        if (!transactions || transactions.length === 0) {
            console.log("No transactions found.");
            return;
        }

        for (const tx of transactions) {
            if (
                tx.to.toLowerCase() === userReceiverAddress.toLowerCase() &&
                BigInt(tx.value) === ethTransferAmount &&
                Number(tx.blockNumber) > lastCheckedBlock
            ) {
                console.log("✅ Valid ETH deposit detected!");
                console.log(`Tx Hash: ${tx.hash}`);
                console.log(`From: ${tx.from}`);
                console.log(`Amount: ${tx.value} Wei`);
                lastCheckedBlock = Number(tx.blockNumber);
            }
        }
    } catch (error) {
        console.error("Error fetching Ethereum transactions:", error.message);
    }
}

// Set an interval to check transactions every 15 seconds
setInterval(checkEthereumTransactions, 15000);
