# Loomio Integration Guide

This document provides a comprehensive guide for the Loomio voting and decision-making system integration with the harmony-node-flow project.

## Overview

The harmony-node-flow project has been enhanced with a complete Loomio integration, allowing teams to create proposals, vote on important decisions, and view results in real-time. The integration connects the React-based frontend with the Loomio backend API.

## Architecture

### Components

1. **Frontend (React/TypeScript)**
   - `src/components/LoomioVoting.tsx` - Reusable voting component
   - `src/pages/Voting.tsx` - Main voting page
   - `src/integrations/loomio/loomioAPI.ts` - API service layer

2. **Backend (Loomio Rails)**
   - Located in `/home/ubuntu/loomio`
   - Runs on `http://localhost:3000`
   - API endpoints: `http://localhost:3000/api/v1`

3. **Frontend Server (Vite)**
   - harmony-node-flow runs on `http://localhost:5173` (dev) or `http://localhost:3001` (production)

## Setup Instructions

### Prerequisites

- Node.js 22+ (for harmony-node-flow)
- Ruby 3.4.5 (for Loomio)
- PostgreSQL 14+
- Redis (for Loomio background jobs)

### Installation

#### 1. Install harmony-node-flow dependencies

```bash
cd /home/ubuntu/harmony-node-flow
npm install
```

#### 2. Install Loomio dependencies

```bash
cd /home/ubuntu/loomio
bundle install
cd vue
npm install
cd ..
```

#### 3. Set up Loomio database

```bash
cd /home/ubuntu/loomio
rake db:setup
```

### Running the Application

#### Start Loomio Rails Server

```bash
cd /home/ubuntu/loomio
rails s -p 3000
```

The Rails server will start on `http://localhost:3000`

#### Start Loomio Vue.js Frontend

In a new terminal:

```bash
cd /home/ubuntu/loomio/vue
npm run serve
```

The Loomio frontend will be available at `http://localhost:8080` (or the next available port)

#### Start harmony-node-flow Development Server

In another terminal:

```bash
cd /home/ubuntu/harmony-node-flow
npm run dev
```

The application will be available at `http://localhost:5173`

## API Integration

### LoomioService Class

The `src/integrations/loomio/loomioAPI.ts` file contains the `LoomioService` class, which provides methods to interact with the Loomio API:

#### Methods

- **`getGroups()`** - Retrieve all groups
- **`createProposal(groupId, title, description, options, closingAt)`** - Create a new proposal
- **`getProposal(proposalId)`** - Get a specific proposal
- **`getGroupProposals(groupId)`** - Get all proposals in a group
- **`castVote(pollOptionId, userId)`** - Cast a vote on a proposal option
- **`getProposalVotes(proposalId)`** - Get all votes for a proposal
- **`closeProposal(proposalId)`** - Close a proposal
- **`getGroup(groupId)`** - Get group details
- **`getGroupMembers(groupId)`** - Get group members
- **`addGroupMember(groupId, email)`** - Add a member to a group
- **`getPollOptions(pollId)`** - Get poll options with vote counts

### Usage Example

```typescript
import { loomioService } from '@/integrations/loomio/loomioAPI';

// Get all groups
const groups = await loomioService.getGroups();

// Create a proposal
const proposal = await loomioService.createProposal(
  groupId,
  'Should we adopt TypeScript?',
  'Proposal to evaluate TypeScript adoption',
  ['Yes', 'No', 'Maybe'],
  new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
);

// Cast a vote
await loomioService.castVote(optionId, userId);

// Get proposal with updated vote counts
const updatedProposal = await loomioService.getProposal(proposalId);
```

## Features

### Voting Page (`/voting`)

The voting page provides:

1. **Create Proposal Form**
   - Title input
   - Description textarea
   - Multiple voting options
   - Optional deadline picker

2. **Active Proposals Tab**
   - Display all open proposals
   - Show vote counts and percentages
   - Allow users to cast votes
   - Display remaining time until deadline

3. **Closed Proposals Tab**
   - Display all closed proposals
   - Show final vote results
   - View-only mode (no voting allowed)

### LoomioVoting Component

The reusable `LoomioVoting` component displays:

- Proposal title and description
- Total vote count
- Time remaining until deadline
- Two tabs: "Cast Vote" and "Results"
- Vote progress bars with percentages
- Vote confirmation message

## Configuration

### Environment Variables

Create a `.env.local` file in the harmony-node-flow root directory:

```env
VITE_BICONOMY_API_KEY=your_biconomy_api_key
VITE_LOOMIO_API_URL=http://localhost:3000/api/v1
```

### Loomio Configuration

Edit `/home/ubuntu/loomio/config/database.yml`:

```yaml
development:
  adapter: postgresql
  database: loomio_development
  username: ubuntu
  password: password
```

## Troubleshooting

### Issue: "Cannot connect to Loomio API"

**Solution:**
1. Verify Loomio Rails server is running: `curl http://localhost:3000/api/v1/groups`
2. Check PostgreSQL is running: `sudo service postgresql status`
3. Check database exists: `psql -l | grep loomio_development`

### Issue: "Port already in use"

**Solution:**
- Change the port in the server command:
  ```bash
  rails s -p 3001  # Use different port
  npm run serve -- --port 8085  # For Vue.js
  ```

### Issue: "Database connection error"

**Solution:**
1. Ensure PostgreSQL user exists:
   ```bash
   sudo -u postgres createuser --superuser ubuntu
   ```
2. Recreate database:
   ```bash
   dropdb loomio_development
   createdb loomio_development
   rake db:setup
   ```

## Security Considerations

1. **CORS Configuration**
   - Loomio API should be configured to accept requests from the harmony-node-flow domain
   - Add to Loomio's CORS configuration if needed

2. **Authentication**
   - Implement proper user authentication before allowing votes
   - Store user IDs securely
   - Validate user permissions before creating proposals

3. **API Keys**
   - Keep Biconomy API keys in environment variables
   - Never commit sensitive data to version control

## Future Enhancements

1. **Real-time Updates**
   - Implement WebSocket connections for live vote count updates
   - Use ActionCable for real-time proposal notifications

2. **Advanced Voting Methods**
   - Implement ranked-choice voting
   - Add weighted voting based on user roles
   - Support for consensus-seeking proposals

3. **Analytics**
   - Track voting patterns
   - Generate reports on decision-making trends
   - Analyze proposal outcomes

4. **Integration with Blockchain**
   - Store proposal hashes on blockchain
   - Use smart contracts for automated execution of decisions
   - Implement DAO governance features

## Deployment

### Production Deployment

1. **Build harmony-node-flow**
   ```bash
   cd /home/ubuntu/harmony-node-flow
   npm run build
   ```

2. **Deploy Loomio**
   - Follow Loomio deployment guide: https://github.com/loomio/loomio-deploy
   - Use Docker for containerized deployment

3. **Environment Configuration**
   - Set `VITE_LOOMIO_API_URL` to production Loomio API URL
   - Configure CORS headers appropriately
   - Use HTTPS for all API communications

## Support and Resources

- **Loomio Documentation**: https://www.loomio.com
- **Loomio GitHub**: https://github.com/loomio/loomio
- **harmony-node-flow GitHub**: https://github.com/khedro7777/harmony-node-flow

## License

This integration is part of the harmony-node-flow project and follows the same license as the main project.
