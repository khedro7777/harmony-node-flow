import { ethers } from 'ethers';
import { Biconomy } from '@biconomy/mexa';

const BICONOMY_API_KEY = import.meta.env.VITE_BICONOMY_API_KEY;
const BICONOMY_PROJECT_ID = import.meta.env.VITE_BICONOMY_PROJECT_ID;
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
  private biconomy: Biconomy | null = null;
  private provider: ethers.providers.Web3Provider | null = null;
  private usdtContract: ethers.Contract | null = null;

  /**
   * Initialize Biconomy and Web3 provider
   */
  async initialize(): Promise<void> {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('Web3 provider not found. Please install MetaMask.');
    }

    if (!BICONOMY_API_KEY || !BICONOMY_PROJECT_ID) {
      throw new Error('Biconomy API Key or Project ID is missing in environment variables.');
    }

    // Initialize Biconomy
    this.biconomy = new Biconomy(window.ethereum, {
      apiKey: BICONOMY_API_KEY,
      debug: true,
      // The chainId should be configured based on the network you are using
      // For this example, we'll assume the user is on the correct network
    });

    await new Promise<void>((resolve, reject) => {
      this.biconomy!.onEvent(this.biconomy!.READY, () => {
        this.provider = new ethers.providers.Web3Provider(this.biconomy as any);
        const signer = this.provider.getSigner();

        // Initialize USDT contract with Biconomy provider
        this.usdtContract = new ethers.Contract(USDT_CONTRACT_ADDRESS, USDT_ABI, signer);
        resolve();
      }).onEvent(this.biconomy!.ERROR, (error: any) => {
        console.error('Biconomy initialization error:', error);
        reject(new Error('Biconomy initialization failed.'));
      });
    });
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
   * Transfer USDT (Gasless Transaction via Biconomy)
   */
  async transferUSDT(params: PaymentParams): Promise<{
    txHash: string;
    success: boolean;
  }> {
    if (!this.usdtContract || !this.biconomy) {
      await this.initialize();
    }

    try {
      // Convert amount to proper units (USDT has 6 decimals)
      const amountInUnits = ethers.utils.parseUnits(params.amount, 6);

      // Encode the function call data for the transfer
      const transferData = this.usdtContract!.interface.encodeFunctionData(
        'transfer',
        [params.recipientAddress, amountInUnits]
      );

      // Create the transaction object
      const tx = {
        to: USDT_CONTRACT_ADDRESS,
        data: transferData,
        from: await this.getWalletAddress(),
      };

      // Send the transaction via Biconomy
      const receipt = await this.biconomy!.sendTransaction(tx);

      return {
        txHash: receipt.transactionHash,
        success: receipt.status === 1,
      };
    } catch (error: any) {
      console.error('Gasless Transfer failed:', error);
      throw new Error(error.message || 'Gasless Transfer failed');
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
