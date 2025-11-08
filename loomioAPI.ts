import axios, { AxiosInstance } from 'axios';

export interface LoomioProposal {
  id: string;
  title: string;
  description?: string;
  groupId: string;
  createdAt: Date;
  closingAt?: Date;
  status: 'open' | 'closed' | 'passed' | 'failed';
  pollOptions: LoomioOption[];
}

export interface LoomioOption {
  id: string;
  name: string;
  description?: string;
  pollId: string;
  voteCount: number;
}

export interface LoomioVote {
  id: string;
  pollOptionId: string;
  userId: string;
  createdAt: Date;
}

export interface LoomioGroup {
  id: string;
  name: string;
  description?: string;
  members: LoomioMember[];
}

export interface LoomioMember {
  id: string;
  name: string;
  email: string;
  groupId: string;
}

export class LoomioService {
  private client: AxiosInstance;
  private baseURL: string;

  constructor(baseURL: string = 'http://localhost:3000/api/v1') {
    this.baseURL = baseURL;
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      withCredentials: false,
    });

    // Add error handling interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('Loomio API Error:', error.response?.data || error.message);
        throw error;
      }
    );
  }

  /**
   * Get all groups
   */
  async getGroups(): Promise<LoomioGroup[]> {
    try {
      const response = await this.client.get('/groups');
      return response.data.groups || [];
    } catch (error) {
      console.error('Failed to get groups:', error);
      throw error;
    }
  }

  /**
   * Create a new proposal/poll in a group
   */
  async createProposal(
    groupId: string,
    title: string,
    description: string,
    options: string[],
    closingAt?: Date
  ): Promise<LoomioProposal> {
    try {
      const pollData = {
        poll: {
          title,
          details: description,
          groupId,
          closingAt: closingAt?.toISOString(),
          pollOptions: options.map((opt) => ({ name: opt })),
        },
      };

      const response = await this.client.post('/polls', pollData);
      return this.formatProposal(response.data.poll);
    } catch (error) {
      console.error('Failed to create proposal:', error);
      throw error;
    }
  }

  /**
   * Get a proposal by ID
   */
  async getProposal(proposalId: string): Promise<LoomioProposal> {
    try {
      const response = await this.client.get(`/polls/${proposalId}`);
      return this.formatProposal(response.data.poll);
    } catch (error) {
      console.error('Failed to get proposal:', error);
      throw error;
    }
  }

  /**
   * Get all proposals in a group
   */
  async getGroupProposals(groupId: string): Promise<LoomioProposal[]> {
    try {
      const response = await this.client.get(`/groups/${groupId}/polls`);
      return (response.data.polls || []).map((poll: any) => this.formatProposal(poll));
    } catch (error) {
      console.error('Failed to get group proposals:', error);
      throw error;
    }
  }

  /**
   * Cast a vote on a proposal
   */
  async castVote(pollOptionId: string, userId: string): Promise<LoomioVote> {
    try {
      const voteData = {
        vote: {
          pollOptionId,
          userId,
        },
      };

      const response = await this.client.post('/votes', voteData);
      return this.formatVote(response.data.vote);
    } catch (error) {
      console.error('Failed to cast vote:', error);
      throw error;
    }
  }

  /**
   * Get votes for a proposal
   */
  async getProposalVotes(proposalId: string): Promise<LoomioVote[]> {
    try {
      const response = await this.client.get(`/polls/${proposalId}/votes`);
      return (response.data.votes || []).map((vote: any) => this.formatVote(vote));
    } catch (error) {
      console.error('Failed to get proposal votes:', error);
      throw error;
    }
  }

  /**
   * Close a proposal
   */
  async closeProposal(proposalId: string): Promise<LoomioProposal> {
    try {
      const updateData = {
        poll: {
          closedAt: new Date().toISOString(),
        },
      };

      const response = await this.client.patch(`/polls/${proposalId}`, updateData);
      return this.formatProposal(response.data.poll);
    } catch (error) {
      console.error('Failed to close proposal:', error);
      throw error;
    }
  }

  /**
   * Get a group
   */
  async getGroup(groupId: string): Promise<LoomioGroup> {
    try {
      const response = await this.client.get(`/groups/${groupId}`);
      return this.formatGroup(response.data.group);
    } catch (error) {
      console.error('Failed to get group:', error);
      throw error;
    }
  }

  /**
   * Get group members
   */
  async getGroupMembers(groupId: string): Promise<LoomioMember[]> {
    try {
      const response = await this.client.get(`/groups/${groupId}/memberships`);
      return (response.data.memberships || []).map((membership: any) =>
        this.formatMember(membership.user, groupId)
      );
    } catch (error) {
      console.error('Failed to get group members:', error);
      throw error;
    }
  }

  /**
   * Add a member to a group
   */
  async addGroupMember(groupId: string, email: string): Promise<LoomioMember> {
    try {
      const memberData = {
        membership: {
          email,
          groupId,
        },
      };

      const response = await this.client.post(`/groups/${groupId}/memberships`, memberData);
      return this.formatMember(response.data.membership.user, groupId);
    } catch (error) {
      console.error('Failed to add group member:', error);
      throw error;
    }
  }

  /**
   * Get poll options with vote counts
   */
  async getPollOptions(pollId: string): Promise<LoomioOption[]> {
    try {
      const response = await this.client.get(`/polls/${pollId}/poll_options`);
      return (response.data.pollOptions || []).map((option: any) => ({
        id: option.id,
        name: option.name,
        description: option.description,
        pollId: option.pollId,
        voteCount: option.voteCount || 0,
      }));
    } catch (error) {
      console.error('Failed to get poll options:', error);
      throw error;
    }
  }

  /**
   * Helper method to format proposal from API response
   */
  private formatProposal(poll: any): LoomioProposal {
    return {
      id: poll.id,
      title: poll.title,
      description: poll.details,
      groupId: poll.groupId,
      createdAt: new Date(poll.createdAt),
      closingAt: poll.closingAt ? new Date(poll.closingAt) : undefined,
      status: poll.closedAt ? 'closed' : 'open',
      pollOptions: (poll.pollOptions || []).map((opt: any) => ({
        id: opt.id,
        name: opt.name,
        description: opt.description,
        pollId: poll.id,
        voteCount: opt.voteCount || 0,
      })),
    };
  }

  /**
   * Helper method to format vote from API response
   */
  private formatVote(vote: any): LoomioVote {
    return {
      id: vote.id,
      pollOptionId: vote.pollOptionId,
      userId: vote.userId,
      createdAt: new Date(vote.createdAt),
    };
  }

  /**
   * Helper method to format group from API response
   */
  private formatGroup(group: any): LoomioGroup {
    return {
      id: group.id,
      name: group.name,
      description: group.description,
      members: [],
    };
  }

  /**
   * Helper method to format member from API response
   */
  private formatMember(user: any, groupId: string): LoomioMember {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      groupId,
    };
  }
}

// Export singleton instance configured to connect to local Loomio server
export const loomioService = new LoomioService('http://localhost:3000/api/v1');
