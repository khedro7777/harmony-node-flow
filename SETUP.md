# GPO DAO Platform - Setup Guide

This guide will help you configure the platform for full functionality including Snapshot.js voting and USDT gasless payments.

## Prerequisites

- Node.js 18+ installed
- MetaMask or another Web3 wallet
- Access to a blockchain network (Ethereum, Polygon, etc.)
- USDT tokens for testing payments

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Supabase (Already configured via Lovable Cloud)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
VITE_SUPABASE_PROJECT_ID=your_project_id

# Snapshot.js Configuration
VITE_SNAPSHOT_HUB_URL=https://hub.snapshot.org
VITE_SNAPSHOT_SPACE_ID=your-space.eth

# Payment Configuration
VITE_BICONOMY_API_KEY=your_biconomy_api_key
VITE_USDT_CONTRACT_ADDRESS=0xdAC17F958D2ee523a2206206994597C13D831ec7
VITE_NETWORK_CHAIN_ID=1
VITE_PAYMENT_RECEIVER_ADDRESS=0xYourReceiverAddress
```

## Configuration Steps

### 1. Snapshot.js Setup

1. **Create a Snapshot Space**:
   - Go to [Snapshot.org](https://snapshot.org)
   - Connect your wallet
   - Click "Create a space"
   - Follow the wizard to set up your DAO space
   - Get your space ENS name (e.g., `your-company.eth`)

2. **Configure Space Settings**:
   - Set voting strategies (token-based, NFT-based, etc.)
   - Configure proposal thresholds
   - Set voting durations

3. **Update Environment Variables**:
   ```env
   VITE_SNAPSHOT_SPACE_ID=your-company.eth
   ```

### 2. USDT Payment Setup

#### Option A: Using Biconomy (Recommended for Gasless)

1. **Get Biconomy API Key**:
   - Go to [Biconomy Dashboard](https://dashboard.biconomy.io)
   - Create an account
   - Create a new project
   - Get your API key from the dashboard

2. **Configure Gasless Transactions**:
   - Add USDT token to your Biconomy DApp
   - Configure meta-transaction methods
   - Fund your Biconomy account for gas sponsorship

3. **Update Environment Variables**:
   ```env
   VITE_BICONOMY_API_KEY=your_api_key
   VITE_PAYMENT_RECEIVER_ADDRESS=0xYourCompanyWallet
   ```

#### Option B: Direct USDT Transfers (No Gasless)

If you don't want gasless transactions, you can skip Biconomy setup. Users will pay gas fees directly.

### 3. Network Configuration

Choose your blockchain network:

**Ethereum Mainnet** (Recommended for production):
```env
VITE_NETWORK_CHAIN_ID=1
VITE_USDT_CONTRACT_ADDRESS=0xdAC17F958D2ee523a2206206994597C13D831ec7
```

**Polygon Mainnet** (Lower gas fees):
```env
VITE_NETWORK_CHAIN_ID=137
VITE_USDT_CONTRACT_ADDRESS=0xc2132D05D31c914a87C6611C10748AEb04B58e8F
```

**Sepolia Testnet** (For testing):
```env
VITE_NETWORK_CHAIN_ID=11155111
VITE_USDT_CONTRACT_ADDRESS=0x... # Deploy test USDT or use faucet
```

## Database Configuration

The database schema is already set up via Lovable Cloud. The following tables are configured:

- `proposals` - Stores governance proposals
- `votes` - Records shareholder votes
- `companies` - Company information
- `shareholders` - Shareholder registry with voting power
- `company_applications` - Company formation applications

**Realtime is enabled** for `proposals` and `votes` tables for live updates.

## Testing the Setup

### 1. Test Snapshot.js Integration

1. Log in as a shareholder
2. Navigate to the Proposals tab
3. Click "Create Proposal"
4. Fill out the form and submit
5. Check your Snapshot space - the proposal should appear

### 2. Test Voting

1. Open an active proposal
2. Click "Vote Now"
3. Select your choice (For/Against/Abstain)
4. Submit - your vote should be recorded both locally and on Snapshot

### 3. Test Payments

1. Go to "Create Company" → "Form New Company"
2. Select a service provider
3. Fill out the form
4. Click the payment button
5. Connect your wallet
6. Confirm the USDT transfer

## Troubleshooting

### Snapshot.js Issues

**Error: "Web3 provider not found"**
- Solution: Ensure MetaMask is installed and unlocked

**Error: "Proposal creation failed"**
- Solution: Check that your wallet is connected to the correct network
- Verify your Snapshot space ID is correct
- Ensure you have the required tokens for creating proposals

### Payment Issues

**Error: "Insufficient balance"**
- Solution: Ensure you have enough USDT in your wallet

**Error: "Payment receiver address not configured"**
- Solution: Set `VITE_PAYMENT_RECEIVER_ADDRESS` in your `.env` file

**Error: "Transaction failed"**
- Solution: Check network connectivity
- Verify USDT contract address matches your network
- Ensure gas fees are covered (if not using gasless)

### Database Issues

**Error: "Permission denied"**
- Solution: Check RLS policies in Lovable Cloud backend
- Ensure user is authenticated
- Verify user is a shareholder of the company

## Security Considerations

1. **Never commit `.env` file** - It's already in `.gitignore`
2. **Use separate wallets** for development and production
3. **Test on testnet first** before mainnet deployment
4. **Regularly audit** RLS policies in the database
5. **Monitor payment transactions** and keep records
6. **Implement rate limiting** for proposal creation
7. **Validate voting power** calculations server-side

## Production Checklist

Before deploying to production:

- [ ] Configure production Snapshot space
- [ ] Set up production payment receiver wallet
- [ ] Configure Biconomy for production network
- [ ] Enable auto-confirm email signups (already done)
- [ ] Test all user flows end-to-end
- [ ] Set up monitoring and alerts
- [ ] Backup database regularly
- [ ] Document operational procedures
- [ ] Configure domain and SSL
- [ ] Set up analytics

## Support

For issues and questions:
- Check the [Snapshot.js Documentation](https://docs.snapshot.org)
- Review [Biconomy Documentation](https://docs.biconomy.io)
- Join the Lovable Discord community
- Open an issue in this repository

## License

This project is open source. See LICENSE file for details.
