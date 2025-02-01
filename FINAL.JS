const { ethers } = require("ethers");
const axios = require("axios");
require("dotenv").config();

// Ethereum RPC provider (via Etherscan API)
const ethProvider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);

// Your blockchain's RPC provider for sending Hash coins
const hashProvider = new ethers.JsonRpcProvider(process.env.HASH_CHAIN_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, hashProvider);

// Your backend wallet address (must be in lowercase for comparison)
const backendWalletAddress = process.env.BACKEND_WALLET_ADDRESS.toLowerCase();
const ethTransferAmount = ethers.parseUnits("0.001", "ether");

// Store processed transaction hashes to prevent duplicate sends
const processedTxs = new Set();



// Function to send Hash coins on your blockchain
async function sendHashCoinsToSender(depositAddress, txHash) {
    if (processedTxs.has(txHash)) return; // Skip if already processed

    const amount = ethers.parseUnits("1", "ether");

    const tx = {
        to: depositAddress,
        value: amount,
    };

    try {
        const transactionResponse = await wallet.sendTransaction(tx);
        console.log(`Hash coin transaction sent: ${transactionResponse.hash}`);
        await transactionResponse.wait();
        console.log("Transaction mined successfully");

        // Mark transaction as processed
        processedTxs.add(txHash);
    } catch (error) {
        console.error("Error sending Hash coins:", error);
    }
}

// Function to fetch the latest transactions for your wallet
async function fetchTransactions() {
    try {
        const response = await axios.get(`https://api.etherscan.io/api`, {
            params: {
                module: "account",
                action: "txlist",
                address: backendWalletAddress,
                startblock: 0,
                endblock: 99999999,
                sort: "desc",
                apikey: process.env.ETHERSCAN_API_KEY
            }
        });

        if (response.data.status !== "1") {
            console.error("Error fetching transactions:", response.data.message);
            return;
        }

        const transactions = response.data.result;
        for (const tx of transactions) {
            if (tx.to && tx.to.toLowerCase() === backendWalletAddress) {
                const value = ethers.parseUnits(tx.value, "wei");
                if (value >= ethTransferAmount && !processedTxs.has(tx.hash)) {
                    console.log("Received confirmed Ethereum deposit transaction:", tx.hash);
                    await sendHashCoinsToSender(tx.from, tx.hash);
                }
            }
        }
    } catch (error) {
        console.error("Error fetching Ethereum transactions:", error);
    }
}
