const { ethers } = require('ethers');
const crypto = require('crypto');

const CONTRACT_ABI = [
  "function registerComplaint(string memory _complaintId, string memory _complaintHash) external",
  "function updateComplaintStatus(string memory _complaintId, uint8 _status) external",
  "function resolveComplaint(string memory _complaintId, string memory _resolutionHash) external",
  "function verifyComplaint(string memory _complaintId, string memory _complaintHash) external view returns (bool)",
  "function getComplaint(string memory _complaintId) external view returns (string memory, uint256, uint8, address)",
  "function complaintExists(string memory _complaintId) external view returns (bool)",
  "function getTotalComplaints() external view returns (uint256)"
];

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

function validateBlockchainConfig() {
  const required = {
    SEPOLIA_RPC_URL: process.env.SEPOLIA_RPC_URL,
    CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS,
    PRIVATE_KEY: process.env.PRIVATE_KEY
  };

  const missing = [];
  for (const [key, value] of Object.entries(required)) {
    if (!value || value.trim() === '') {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `❌ BLOCKCHAIN CONFIG MISSING: ${missing.join(', ')}\n` +
      `   CivicSense requires a live Sepolia blockchain connection.\n` +
      `   Please set these in server/.env before starting.`
    );
  }

  if (required.CONTRACT_ADDRESS === ZERO_ADDRESS) {
    throw new Error(
      `❌ CONTRACT_ADDRESS is set to zero address.\n` +
      `   You must deploy the smart contract first:\n` +
      `     cd smart-contract\n` +
      `     npx hardhat compile\n` +
      `     npx hardhat run scripts/deploy.js --network sepolia\n` +
      `   Then paste the deployed address into server/.env`
    );
  }

  if (required.PRIVATE_KEY.replace(/^0x/, '').replace(/0/g, '') === '1' ||
      required.PRIVATE_KEY.replace(/^0x/, '').length < 64) {
    throw new Error(
      `❌ PRIVATE_KEY is invalid or placeholder.\n` +
      `   You must provide a real wallet private key with Sepolia ETH balance.\n` +
      `   Export it from MetaMask → Account Details → Export Private Key`
    );
  }
}

const getProvider = () => {
  return new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
};

const getContract = () => {
  const provider = getProvider();
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  return new ethers.Contract(process.env.CONTRACT_ADDRESS, CONTRACT_ABI, wallet);
};

const generateHash = (data) => {
  return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
};

async function verifyBlockchainConnection() {
  validateBlockchainConfig();

  const provider = getProvider();
  try {
    const network = await provider.getNetwork();
    console.log(`🔗 Connected to blockchain: chainId=${network.chainId}`);
  } catch (error) {
    throw new Error(
      `❌ Cannot connect to Sepolia RPC at ${process.env.SEPOLIA_RPC_URL}\n` +
      `   Error: ${error.message}\n` +
      `   Check your SEPOLIA_RPC_URL in server/.env`
    );
  }

  const contract = getContract();
  try {
    const total = await contract.getTotalComplaints();
    console.log(`📜 Smart contract verified at ${process.env.CONTRACT_ADDRESS} (${total} complaints on-chain)`);
  } catch (error) {
    throw new Error(
      `❌ Smart contract at ${process.env.CONTRACT_ADDRESS} is not responding.\n` +
      `   Error: ${error.message}\n` +
      `   Make sure the contract is deployed and CONTRACT_ADDRESS is correct.`
    );
  }

  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const balance = await provider.getBalance(wallet.address);
  const ethBalance = ethers.formatEther(balance);
  console.log(`💰 Wallet ${wallet.address} balance: ${ethBalance} Sepolia ETH`);

  if (balance === 0n) {
    throw new Error(
      `❌ Wallet has 0 Sepolia ETH. Transactions will fail.\n` +
      `   Get free Sepolia ETH from https://sepoliafaucet.com/ or https://faucets.chain.link/sepolia`
    );
  }
}

const registerComplaintOnChain = async (complaintId, complaintData) => {
  const hash = generateHash(complaintData);
  const contract = getContract();

  const tx = await contract.registerComplaint(complaintId, hash);
  console.log(`⛓️  TX sent: ${tx.hash} (registerComplaint)`);
  const receipt = await tx.wait();
  console.log(`✅ TX confirmed in block ${receipt.blockNumber}`);

  return {
    success: true,
    hash: hash,
    transactionId: receipt.hash,
    blockNumber: receipt.blockNumber
  };
};

const updateComplaintStatusOnChain = async (complaintId, status) => {
  const contract = getContract();
  const statusMap = {
    'Reported': 0,
    'Verified': 1,
    'InProgress': 2,
    'Resolved': 3
  };

  const tx = await contract.updateComplaintStatus(complaintId, statusMap[status]);
  console.log(`⛓️  TX sent: ${tx.hash} (updateStatus → ${status})`);
  const receipt = await tx.wait();
  console.log(`✅ TX confirmed in block ${receipt.blockNumber}`);

  return {
    success: true,
    transactionId: receipt.hash
  };
};

const resolveComplaintOnChain = async (complaintId, resolutionData) => {
  const resolutionHash = generateHash(resolutionData);
  const contract = getContract();

  const tx = await contract.resolveComplaint(complaintId, resolutionHash);
  console.log(`⛓️  TX sent: ${tx.hash} (resolveComplaint)`);
  const receipt = await tx.wait();
  console.log(`✅ TX confirmed in block ${receipt.blockNumber}`);

  return {
    success: true,
    resolutionHash: resolutionHash,
    transactionId: receipt.hash
  };
};

const verifyComplaintIntegrity = async (complaintId, complaintData) => {
  const contract = getContract();
  const hash = generateHash(complaintData);
  const isValid = await contract.verifyComplaint(complaintId, hash);
  return isValid;
};

const checkComplaintExistsOnChain = async (complaintId) => {
  const contract = getContract();
  return await contract.complaintExists(complaintId);
};

module.exports = {
  generateHash,
  validateBlockchainConfig,
  verifyBlockchainConnection,
  registerComplaintOnChain,
  updateComplaintStatusOnChain,
  resolveComplaintOnChain,
  verifyComplaintIntegrity,
  checkComplaintExistsOnChain
};
