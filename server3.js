const Web3 = require('web3');
require('dotenv').config();

// Configuration
const contractAddress = "YOUR_CONTRACT_ADDRESS"; // Replace with the deployed contract address
const privateKey = process.env.PRIVATE_KEY;
const hashChainRpc = process.env.HASHCHAIN_RPC;
const ethRpcUrl = process.env.ETHEREUM_RPC_URL;

// Initialize Web3 for Ethereum and Hash Chain
const ethWeb3 = new Web3(new Web3.providers.HttpProvider(ethRpcUrl));
const hashWeb3 = new Web3(hashChainRpc);

// Ethereum contract ABI (replace with actual ABI from Remix/Truffle)
const contractABI = [
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "timestamp",
                "type": "uint256"
            }
        ],
        "name": "TokensSent",
        "type": "event"
    }
];

// Initialize contract
const contract = new ethWeb3.eth.Contract(contractABI, contractAddress);

// Listen for the "TokensSent" event
contract.events.TokensSent({
    fromBlock: 'latest'
})
.on('data', async (event) => {
    console.log(`Hash Coin Transfer Detected! To: ${event.returnValues.to}`);
    console.log(`Amount: ${event.returnValues.amount}`);

    // Backend triggers sending Hash coins to the recipient on Hash Chain
    await sendHashCoins(event.returnValues.to, event.returnValues.amount);
});

// Backend function to send Hash coins to the recipient on Hash Chain
async function sendHashCoins(toAddress, amount) {
    try {
        console.log(`Sending ${amount} Hash coins to: ${toAddress}`);

        const hashAccount = hashWeb3.eth.accounts.privateKeyToAccount(privateKey);
        const value = Web3.utils.toWei(amount.toString(), "ether"); // Convert amount to Wei if necessary

        const tx = {
            from: hashAccount.address,
            to: toAddress,
            value: value,
            gas: 21000,
            gasPrice: await hashWeb3.eth.getGasPrice()
        };

        const signedTx = await hashAccount.signTransaction(tx);
        const receipt = await hashWeb3.eth.sendSignedTransaction(signedTx.rawTransaction);
        console.log("✅ Hash coins sent! Tx Hash:", receipt.transactionHash);
    } catch (error) {
        console.error("Error sending Hash coins:", error);
    }
}
