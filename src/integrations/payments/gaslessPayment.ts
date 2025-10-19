import { ethers } from 'ethers';

const BICONOMY_API_KEY = import.meta.env.VITE_BICONOMY_API_KEY;
const USDT_CONTRACT_ADDRESS = import.meta.env.VITE_USDT_CONTRACT_ADDRESS;
const NETWORK_CHAIN_ID = import.meta.env.VITE_NETWORK_CHAIN_ID || '1';
const PAYMENT_RECEIVER_ADDRESS = import.meta.env.VITE_PAYMENT_RECEIVER_ADDRESS;

// USDT ABI (only required functions)
const USDT_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function balanceOf(address account) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
];

export interface PaymentParams {
  recipientAddress: string;
  amount: string; // Amount in USDT (with decimals, e.g., "100.00")
  description?: string;
}

export class GaslessPaymentService {
  private provider: ethers.providers.Web3Provider | null = null;
  private usdtContract: ethers.Contract | null = null;

  /**
   * Initialize Web3 provider
   * Note: For production, integrate with a gasless transaction service like Biconomy SDK v2,
   * Gelato, or OpenZeppelin Defender
   */
  async initialize(): Promise<void> {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('Web3 provider not found. Please install MetaMask.');
    }

    // Request account access
    await window.ethereum.request({ method: 'eth_requestAccounts' });

    this.provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = this.provider.getSigner();

    // Initialize USDT contract
    this.usdtContract = new ethers.Contract(USDT_CONTRACT_ADDRESS, USDT_ABI, signer);
  }

  /**
   * Get user's USDT balance
   */
  async getBalance(address: string): Promise<string> {
    if (!this.usdtContract) {
      await this.initialize();
    }

    const balance = await this.usdtContract!.balanceOf(address);
    return ethers.utils.formatUnits(balance, 6); // USDT has 6 decimals
  }

  /**
   * Transfer USDT
   * Note: Currently uses regular transactions. For gasless, integrate with:
   * - Biconomy SDK v2 (https://docs.biconomy.io/)
   * - Gelato (https://docs.gelato.network/)
   * - OpenZeppelin Defender (https://docs.openzeppelin.com/defender/)
   */
  async transferUSDT(params: PaymentParams): Promise<{
    txHash: string;
    success: boolean;
  }> {
    if (!this.usdtContract) {
      await this.initialize();
    }

    try {
      // Convert amount to proper units (USDT has 6 decimals)
      const amountInUnits = ethers.utils.parseUnits(params.amount, 6);

      // Execute transfer
      const tx = await this.usdtContract!.transfer(
        params.recipientAddress,
        amountInUnits
      );

      // Wait for transaction confirmation
      const receipt = await tx.wait();

      return {
        txHash: receipt.transactionHash,
        success: receipt.status === 1,
      };
    } catch (error: any) {
      console.error('Transfer failed:', error);
      throw new Error(error.message || 'Transfer failed');
    }
  }

  /**
   * Approve USDT spending
   */
  async approveUSDT(spenderAddress: string, amount: string): Promise<{
    txHash: string;
    success: boolean;
  }> {
    if (!this.usdtContract) {
      await this.initialize();
    }

    try {
      const amountInUnits = ethers.utils.parseUnits(amount, 6);

      const tx = await this.usdtContract!.approve(spenderAddress, amountInUnits);
      const receipt = await tx.wait();

      return {
        txHash: receipt.transactionHash,
        success: receipt.status === 1,
      };
    } catch (error: any) {
      console.error('Approval failed:', error);
      throw new Error(error.message || 'Approval failed');
    }
  }

  /**
   * Check allowance for a spender
   */
  async getAllowance(ownerAddress: string, spenderAddress: string): Promise<string> {
    if (!this.usdtContract) {
      await this.initialize();
    }

    const allowance = await this.usdtContract!.allowance(ownerAddress, spenderAddress);
    return ethers.utils.formatUnits(allowance, 6);
  }

  /**
   * Get transaction status from blockchain
   */
  async getTransactionStatus(txHash: string): Promise<{
    confirmed: boolean;
    success: boolean;
    blockNumber?: number;
  }> {
    if (!this.provider) {
      await this.initialize();
    }

    try {
      const receipt = await this.provider!.getTransactionReceipt(txHash);

      if (!receipt) {
        return { confirmed: false, success: false };
      }

      return {
        confirmed: true,
        success: receipt.status === 1,
        blockNumber: receipt.blockNumber,
      };
    } catch (error) {
      console.error('Error checking transaction status:', error);
      return { confirmed: false, success: false };
    }
  }

  /**
   * Get connected wallet address
   */
  async getWalletAddress(): Promise<string> {
    if (!this.provider) {
      await this.initialize();
    }

    const signer = this.provider!.getSigner();
    return await signer.getAddress();
  }
}

export const gaslessPaymentService = new GaslessPaymentService();
