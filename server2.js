const axios = require('axios');
const Web3 = require('web3');
require('dotenv').config();

// Configurations
const etherscanApiUrl = "https://api.etherscan.io/api";
const etherscanApiKey = process.env.ETHERSCAN_API_KEY;
const privateKey = process.env.PRIVATE_KEY;
const hashChainRpc = process.env.HASHCHAIN_RPC;
const userReceiverAddress = "0xCfC11BB9BBd7aAE2B34025f9A282e3850edd2A40";
const ethTransferAmount = BigInt("1000000000000000"); // 0.001 ETH in Wei

let lastCheckedBlock = 0;

// Initialize Web3 for Hash Chain
const hashWeb3 = new Web3(hashChainRpc);

// Create account object from private key for Hash Chain transactions
const hashAccount = hashWeb3.eth.accounts.privateKeyToAccount(privateKey);
hashWeb3.eth.accounts.wallet.add(hashAccount);

// Function to send native Hash coins
async function sendHashCoins(toAddress) {
    try {
        console.log(`Sending Hash coins to: ${toAddress}`);

        // Amount to send (1 Hash Coin equivalent to 1 ETH)
        const amount = Web3.utils.toWei("1", "ether");

        // Transaction object
        const tx = {
            from: hashAccount.address,
            to: toAddress,
            value: amount,
            gas: 21000, // Gas limit for a basic native transfer
            gasPrice: await hashWeb3.eth.getGasPrice() // Get current gas price
        };

        // Sign the transaction with the private key
        const signedTx = await hashAccount.signTransaction(tx);
        
        // Send the signed transaction
        const receipt = await hashWeb3.eth.sendSignedTransaction(signedTx.rawTransaction);
        console.log("✅ Hash coins sent! Tx Hash:", receipt.transactionHash);
    } catch (error) {
        console.error("Error sending Hash coins:", error);
    }
}

// Function to check Ethereum transactions
async function checkEthereumTransactions() {
    try {
        console.log("Checking for new transactions...");

        // Fetch transactions for the receiver address
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
            // Check for ETH deposits to the specified address
            if (
                tx.to.toLowerCase() === userReceiverAddress.toLowerCase() &&
                BigInt(tx.value) === ethTransferAmount &&
                Number(tx.blockNumber) > lastCheckedBlock
            ) {
                console.log("✅ Valid ETH deposit detected!");
                console.log(`Tx Hash: ${tx.hash}`);
                console.log(`From: ${tx.from}`);
                console.log(`Amount: ${tx.value} Wei`);

                // Update the block number for the last processed transaction
                lastCheckedBlock = Number(tx.blockNumber);

                // Send native Hash coins to the sender
                await sendHashCoins(tx.from);
            }
        }
    } catch (error) {
        console.error("Error fetching Ethereum transactions:", error.message);
    }
}

// Check transactions every 15 seconds
setInterval(checkEthereumTransactions, 15000);
