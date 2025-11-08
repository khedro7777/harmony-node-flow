import snapshot from '@snapshot-labs/snapshot.js';
import { ethers } from 'ethers';

const SNAPSHOT_HUB_URL = import.meta.env.VITE_SNAPSHOT_HUB_URL || 'https://hub.snapshot.org';
const SNAPSHOT_SPACE_ID = import.meta.env.VITE_SNAPSHOT_SPACE_ID || 'your-space.eth';

// Initialize Snapshot client
const snapshotHub = new snapshot.Client712(SNAPSHOT_HUB_URL);

// Type for Snapshot receipt
interface SnapshotReceipt {
  id?: string;
  ipfsHash?: string;
}

interface CreateProposalParams {
  title: string;
  body: string;
  choices: string[];
  start: number;
  end: number;
  snapshot?: number;
  type: 'single-choice' | 'approval' | 'quadratic' | 'ranked-choice' | 'weighted' | 'basic';
  app?: string;
}

interface CastVoteParams {
  proposalId: string;
  choice: number | number[] | Record<string, number>;
  reason?: string;
}

export class SnapshotService {
  private provider: ethers.providers.Web3Provider | null = null;
  private signer: ethers.Signer | null = null;

  /**
   * Initialize Web3 provider and signer
   */
  async initializeProvider() {
    if (typeof window.ethereum !== 'undefined') {
      this.provider = new ethers.providers.Web3Provider(window.ethereum as any);
      this.signer = this.provider.getSigner();
      return true;
    }
    throw new Error('Web3 provider not found. Please install MetaMask.');
  }

  /**
   * Create a new proposal on Snapshot
   */
  async createProposal(params: CreateProposalParams): Promise<{ id: string; ipfsHash: string }> {
    if (!this.signer) {
      await this.initializeProvider();
    }

    const address = await this.signer!.getAddress();

    const proposal: any = {
      space: SNAPSHOT_SPACE_ID,
      type: params.type,
      title: params.title,
      body: params.body,
      discussion: '', // Required field
      choices: params.choices,
      start: params.start,
      end: params.end,
      snapshot: params.snapshot || await this.provider!.getBlockNumber(),
      plugins: JSON.stringify({}),
      app: params.app || 'gpo-dao',
    };

    const receipt = await snapshotHub.proposal(this.signer as any, address, proposal) as SnapshotReceipt;
    
    return {
      id: receipt?.id || '',
      ipfsHash: receipt?.ipfsHash || '',
    };
  }

  /**
   * Cast a vote on a proposal
   */
  async castVote(params: CastVoteParams): Promise<{ id: string; ipfsHash: string }> {
    if (!this.signer) {
      await this.initializeProvider();
    }

    const address = await this.signer!.getAddress();

    const vote: any = {
      space: SNAPSHOT_SPACE_ID,
      proposal: params.proposalId,
      type: 'single-choice',
      choice: params.choice,
      reason: params.reason || '',
      app: 'gpo-dao',
    };

    const receipt = await snapshotHub.vote(this.signer as any, address, vote) as SnapshotReceipt;

    return {
      id: receipt?.id || '',
      ipfsHash: receipt?.ipfsHash || '',
    };
  }

  /**
   * Get proposal details from Snapshot
   */
  async getProposal(proposalId: string): Promise<any> {
    try {
      const response = await fetch(`${SNAPSHOT_HUB_URL}/api/proposals/${proposalId}`);
      if (!response.ok) throw new Error('Failed to fetch proposal');
      return await response.json();
    } catch (error) {
      console.error('Error fetching proposal:', error);
      throw error;
    }
  }

  /**
   * Get votes for a proposal
   */
  async getVotes(proposalId: string): Promise<any[]> {
    try {
      const response = await fetch(`${SNAPSHOT_HUB_URL}/api/votes/${proposalId}`);
      if (!response.ok) throw new Error('Failed to fetch votes');
      return await response.json();
    } catch (error) {
      console.error('Error fetching votes:', error);
      throw error;
    }
  }

  /**
   * Calculate voting power for an address
   */
  async getVotingPower(address: string, proposalId: string): Promise<number> {
    try {
      const response = await fetch(`${SNAPSHOT_HUB_URL}/api/scores/${SNAPSHOT_SPACE_ID}/${proposalId}/${address}`);
      if (!response.ok) throw new Error('Failed to fetch voting power');
      const data = await response.json();
      return data.vp || 0;
    } catch (error) {
      console.error('Error fetching voting power:', error);
      return 0;
    }
  }

  /**
   * Check if wallet is connected
   */
  isWalletConnected(): boolean {
    return !!this.signer;
  }

  /**
   * Get connected wallet address
   */
  async getWalletAddress(): Promise<string | null> {
    if (!this.signer) return null;
    return await this.signer.getAddress();
  }
}

export const snapshotService = new SnapshotService();
