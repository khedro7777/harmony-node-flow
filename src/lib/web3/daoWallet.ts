import { ethers } from 'ethers';
import { SafeFactory, SafeAccountConfig } from '@safe-global/protocol-kit';
import { SafeApiKit } from '@safe-global/api-kit';

// Initialize Ethers provider
const provider = new ethers.providers.Web3Provider(window.ethereum);

// Function to connect to the user's wallet
export const connectWallet = async () => {
  await provider.send('eth_requestAccounts', []);
  const signer = provider.getSigner();
  const address = await signer.getAddress();
  return { signer, address };
};

// Function to fetch ETH and ERC-20 token balances
export const getBalances = async (address) => {
  const ethBalance = await provider.getBalance(address);
  // Add logic to fetch ERC-20 token balances here
  return { ethBalance };
};

// Function to create a new Gnosis Safe
export const createSafe = async (owners, threshold) => {
  const signer = provider.getSigner();
  const safeFactory = await SafeFactory.create({ ethAdapter: signer });
  const safeAccountConfig = {
    owners,
    threshold,
  };
  const safe = await safeFactory.deploySafe({ safeAccountConfig });
  return safe.getAddress();
};

// Function to create and sign a multisig transaction
export const createMultisigTransaction = async (safeAddress, to, value, data) => {
  const signer = provider.getSigner();
  const safeApiKit = new SafeApiKit({ txServiceUrl: 'https://safe-transaction-polygon.safe.global/', ethAdapter: signer });
  const safeTransactionData = {
    to,
    value,
    data,
  };
  const safeTransaction = await safeApiKit.createTransaction(safeTransactionData);
  const signature = await safeApiKit.signTransaction(safeTransaction);
  await safeApiKit.confirmTransaction(safeTransaction.safeTxHash, signature.data);
  return safeTransaction.safeTxHash;
};
