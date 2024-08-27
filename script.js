// Contract address
const contractAddress = '0x8c6c44182db04a82237abc14d7c2bbf1904dd67f'; // Your actual staking contract address on BSC

// ABI for the staking contract
const abi = [
    // The ABI you provided originally
    {
        "inputs": [{"internalType": "address", "name": "_usdcAddress", "type": "address"}],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [{"internalType": "address", "name": "owner", "type": "address"}],
        "name": "OwnableInvalidOwner",
        "type": "error"
    },
    {
        "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
        "name": "OwnableUnauthorizedAccount",
        "type": "error"
    },
    {
        "anonymous": false,
        "inputs": [
            {"indexed": true, "internalType": "address", "name": "previousOwner", "type": "address"},
            {"indexed": true, "internalType": "address", "name": "newOwner", "type": "address"}
        ],
        "name": "OwnershipTransferred",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "claimReward",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
        "name": "earned",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
        "name": "getBalance",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
        "name": "getRewardBalance",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "stake",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "uint256", "name": "_amount", "type": "uint256"}],
        "name": "withdraw",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalStaked",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "rewardPerTokenStored",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    }
];

let web3;
let accounts;
let contract;

window.addEventListener('load', async () => {
    if (typeof window.ethereum !== 'undefined') {
        web3 = new Web3(window.ethereum);
        try {
            accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            contract = new web3.eth.Contract(abi, contractAddress);
            document.getElementById('wallet-status').innerText = `Connected: ${accounts[0]}`;
            loadBalances();
        } catch (error) {
            console.error('User denied account access', error);
            document.getElementById('wallet-status').innerText = 'Connection Failed';
        }
    } else {
        console.warn('No web3 provider found');
        document.getElementById('wallet-status').innerText = 'No Web3 Provider Found';
    }

    document.getElementById('stake-btn').addEventListener('click', stakeTokens);
    document.getElementById('withdraw-btn').addEventListener('click', withdrawTokens);
    document.getElementById('claim-reward-btn').addEventListener('click', claimRewards);
});

async function loadBalances() {
    try {
        const bnbBalance = await web3.eth.getBalance(accounts[0]);
        const stakedBalance = await contract.methods.getBalance(accounts[0]).call();
        const rewardBalance = await contract.methods.getRewardBalance(accounts[0]).call();

        document.getElementById('bnb-balance').innerText = web3.utils.fromWei(bnbBalance, 'ether');
        document.getElementById('staked-balance').innerText = web3.utils.fromWei(stakedBalance, 'ether');
        document.getElementById('reward-balance').innerText = web3.utils.fromWei(rewardBalance, 'ether');
    } catch (error) {
        console.error('Error loading balances:', error);
    }
}

async function stakeTokens() {
    const amount = document.getElementById('stake-amount').value;
    const amountInWei = web3.utils.toWei(amount, 'ether');

    try {
        const result = await contract.methods.stake().send({
            from: accounts[0],
            value: amountInWei
        });

        console.log('Transaction hash:', result.transactionHash);

        document.getElementById('stake-status').innerText = 'Staking successful!';
        loadBalances(); // Update the balances after staking
    } catch (error) {
        console.error('Staking failed:', error);
        document.getElementById('stake-status').innerText = 'Staking failed!';
    }
}

async function withdrawTokens() {
    const amount = document.getElementById('withdraw-amount').value;
    const amountInWei = web3.utils.toWei(amount, 'ether');

    try {
        const result = await contract.methods.withdraw(amountInWei).send({ from: accounts[0] });
        console.log('Transaction hash:', result.transactionHash);

        document.getElementById('withdraw-status').innerText = 'Withdrawal successful!';
        loadBalances(); // Update the balances after withdrawal
    } catch (error) {
        console.error('Withdrawal failed:', error);
        document.getElementById('withdraw-status').innerText = 'Withdrawal failed!';
    }
}

async function claimRewards() {
    try {
        const result = await contract.methods.claimReward().send({ from: accounts[0] });
        console.log('Transaction hash:', result.transactionHash);

        document.getElementById('claim-status').innerText = 'Rewards claimed successfully!';
        loadBalances(); // Update the balances after claiming rewards
    } catch (error) {
        console.error('Claiming rewards failed:', error);
        document.getElementById('claim-status').innerText = 'Claiming rewards failed!';
    }
}
