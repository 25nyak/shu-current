// Import the Web3 library at the top level
import Web3 from 'web3';

// EnhancedStakingPlatform contract ABI (replace this array with your actual ABI)
const contractABI = [ /* Your provided ABI here */ ];

// EnhancedStakingPlatform contract address (replace with your actual contract address)
const contractAddress = '0x8c6c44182db04a82237abc14d7c2bbf1904dd67f';

// BSC WebSocket provider URL (replace with your actual BSC WebSocket provider URL)
const bscProviderUrl = 'wss://bsc-ws-node.nariox.org';

// Web3 instance
let web3;

// Initialize Web3 depending on the environment (MetaMask or fallback to BSC WebSocket provider)
if (typeof window.ethereum !== 'undefined') {
    // Use MetaMask provider if available
    web3 = new Web3(window.ethereum);
    console.log('Using MetaMask provider.');
} else {
    // Fallback to BSC WebSocket provider
    web3 = new Web3(new Web3.providers.WebsocketProvider(bscProviderUrl));
    console.warn('MetaMask not detected, using BSC WebSocket provider.');
}

// Contract instance
const enhancedStakingPlatformContract = new web3.eth.Contract(contractABI, contractAddress);

/**
 * Function to update the UI with account and staking details
 */
async function updateUI() {
    // Check if MetaMask or another wallet extension is installed
    if (window.ethereum) {
        try {
            // Request account access if needed
            await window.ethereum.enable();

            // Get the user's accounts
            const accounts = await web3.eth.getAccounts();
            if (accounts.length === 0) {
                console.warn('No accounts found.');
                return;
            }

            const accountAddress = accounts[0];
            console.log(`Connected account: ${accountAddress}`);

            // Display account address in the UI
            document.getElementById('accountAddress').innerText = accountAddress;

            // Fetch and display staked balance
            const stakedBalance = await enhancedStakingPlatformContract.methods.stakedBalances(accountAddress).call();
            document.getElementById('stakedBalance').innerText = web3.utils.fromWei(stakedBalance, 'ether');

            // Fetch and display rewards
            const rewards = await enhancedStakingPlatformContract.methods.calculateRewards(accountAddress).call();
            document.getElementById('rewards').innerText = web3.utils.fromWei(rewards, 'ether');
        } catch (error) {
            console.error('Error fetching data from contract:', error);
            alert('Failed to fetch staking details. Please check the console for more information.');
        }
    } else {
        alert('No wallet detected. Please install MetaMask or another wallet extension.');
        console.error('No wallet is installed.');
    }
}

/**
 * Function to stake a specified amount
 * @param {string} amount - The amount of tokens to stake (in Wei)
 */
async function stakeTokens(amount) {
    try {
        const accounts = await web3.eth.getAccounts();
        if (accounts.length === 0) {
            console.warn('No accounts found.');
            return;
        }

        const accountAddress = accounts[0];

        // Convert amount to Wei if necessary
        const amountInWei = web3.utils.toWei(amount, 'ether');

        // Call the stake function on the contract
        await enhancedStakingPlatformContract.methods.stake(amountInWei).send({ from: accountAddress });
        console.log(`Staked ${amount} tokens.`);

        // Update the UI after staking
        updateUI();
    } catch (error) {
        console.error('Error staking tokens:', error);
        alert('Failed to stake tokens. Please check the console for more information.');
    }
}

/**
 * Function to unstake a specified amount
 * @param {string} amount - The amount of tokens to unstake (in Wei)
 */
async function unstakeTokens(amount) {
    try {
        const accounts = await web3.eth.getAccounts();
        if (accounts.length === 0) {
            console.warn('No accounts found.');
            return;
        }

        const accountAddress = accounts[0];

        // Convert amount to Wei if necessary
        const amountInWei = web3.utils.toWei(amount, 'ether');

        // Call the unstake function on the contract
        await enhancedStakingPlatformContract.methods.unstake(amountInWei).send({ from: accountAddress });
        console.log(`Unstaked ${amount} tokens.`);

        // Update the UI after unstaking
        updateUI();
    } catch (error) {
        console.error('Error unstaking tokens:', error);
        alert('Failed to unstake tokens. Please check the console for more information.');
    }
}

// Add event listeners or call updateUI as needed
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the UI on page load
    updateUI();

    // Example of setting up a staking button (assuming you have a button with ID 'stakeButton')
    document.getElementById('stakeButton').addEventListener('click', () => {
        const amount = document.getElementById('stakeAmount').value;
        stakeTokens(amount);
    });

    // Example of setting up an unstaking button (assuming you have a button with ID 'unstakeButton')
    document.getElementById('unstakeButton').addEventListener('click', () => {
        const amount = document.getElementById('unstakeAmount').value;
        unstakeTokens(amount);
    });
});
