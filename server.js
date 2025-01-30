const express = require("express");
const Web3 = require("web3");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());

const ethEtherscanApi = "https://api.etherscan.io/api"; // Etherscan API for Ethereum transactions
const api_key = "5EFNVETHY9FE27AJPH2UYATTSMKH9S41YW"; // Your Etherscan API key
const hashChainRpc = "http://145.223.103.175:8779"; 
const hashWeb3 = new Web3(new Web3.providers.HttpProvider(hashChainRpc));
const expectedAmount = Web3.utils.toWei("0.001", "ether");
const receiverAddress = "0xCfC11BB9BBd7aAE2B34025f9A282e3850edd2A40"; 

async function sendTokens(user, amount) {
    const accounts = await hashWeb3.eth.getAccounts();
    const sender = accounts[0];
    return hashWeb3.eth.sendTransaction({
        from: sender,
        to: user,
        value: Web3.utils.toWei(amount, "ether"), // Transfer native currency
    });
}

async function checkTransactions() {
    try {
        const response = await axios.get(ethEtherscanApi, {
            params: {
                module: "account",
                action: "txlist",
                address: receiverAddress,
                sort: "desc",
                apikey: api_key, // Use your API key here
            },
        });

        const transactions = response.data.result;
        for (const tx of transactions) {
            if (tx.to.toLowerCase() === receiverAddress.toLowerCase() && tx.value === expectedAmount) {
                console.log("Valid transaction detected:", tx.hash);
                try {
                    await sendTokens(tx.from, "0.01"); // Transfer 0.01 Hash Chain's native currency
                    console.log("Transaction successful for", tx.from);
                } catch (error) {
                    console.error("Transaction failed:", error);
                }
            }
        }
    } catch (error) {
        console.error("Error fetching Ethereum transactions:", error);
    }
}

setInterval(checkTransactions, 15000); // Check every 15 seconds

app.listen(3000, () => console.log("Backend running on port 3000"));
