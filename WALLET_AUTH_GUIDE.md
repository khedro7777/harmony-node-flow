# Wallet-Based Authentication Guide

## Overview

The harmony-node-flow project has been refactored to use **wallet-based authentication only**. This approach ensures:

- **No personal data storage**: No email, password, or personal information is stored
- **No financial data storage**: No transaction history or financial information is retained
- **Complete privacy**: Users are identified solely by their wallet address
- **Gasless transactions**: All operations use Biconomy's gasless technology
- **External tools integration**: Leverages SnapDAO and other free tools for operations

## Architecture

### Authentication Flow

```
User → Connect Wallet (MetaMask/WalletConnect) → Wallet Address as User ID → Dashboard
```

### Key Components

1. **AuthContext.tsx** - Manages wallet connection state
   - Detects wallet availability (MetaMask, WalletConnect, etc.)
   - Handles wallet connection/disconnection
   - Listens for account and chain changes
   - No database interactions

2. **Auth.tsx** - Authentication page
   - Single "Connect Wallet" button
   - Displays connected wallet address
   - Shows connection status and errors
   - No email/password forms

3. **Dashboard.tsx** - Main application page
   - Uses wallet address as user identifier
   - Displays wallet address in user profile
   - Disconnect button instead of logout

## Setup Instructions

### Prerequisites

- MetaMask or compatible Web3 wallet installed in browser
- Node.js 18+ and npm
- Ethereum testnet or mainnet access

### Installation

```bash
cd /home/ubuntu/harmony-node-flow
npm install
npm run dev
```

### Running the Application

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open browser to `http://localhost:5173`

3. Click "Connect Wallet" button

4. Approve wallet connection in MetaMask/WalletConnect

5. You'll be automatically redirected to the dashboard

## Data Privacy

### What is NOT stored:

- Email addresses
- Passwords
- Personal names
- Financial information
- Transaction history
- Private keys
- Seed phrases

### What is stored (locally in browser):

- Wallet address (only in session/localStorage)
- Chain ID (for network detection)
- Connection status

### What is used (external services):

- **Biconomy**: For gasless transactions
- **SnapDAO**: For governance and voting
- **Loomio**: For decision-making and proposals
- **Blockchain**: For immutable records

## Supported Wallets

The application supports any wallet that implements the Ethereum provider standard:

- MetaMask
- WalletConnect
- Coinbase Wallet
- Ledger Live
- Trezor Suite
- Brave Wallet
- And many others

## Integration with External Services

### Biconomy (Gasless Transactions)

Configuration in `.env.local`:
```env
VITE_BICONOMY_API_KEY=your_biconomy_api_key
VITE_BICONOMY_PROJECT_ID=9be0b72c-f11f-48ca-a741-48a63fca96e3
```

All transactions are sent through Biconomy's relayer network, eliminating gas fees.

### SnapDAO (Governance)

SnapDAO is integrated for:
- Proposal creation
- Voting mechanisms
- Results aggregation
- Governance tokens support

### Loomio (Decision-Making)

Loomio integration provides:
- Collaborative proposals
- Team voting
- Decision tracking
- Discussion threads

## Security Considerations

### Best Practices

1. **Never store wallet private keys** - The application never requests or stores private keys
2. **Use hardware wallets** - For production use, recommend hardware wallets (Ledger, Trezor)
3. **Verify contract addresses** - Always verify contract addresses before signing transactions
4. **Check transaction details** - Review all transaction details before approving in wallet

### CORS Configuration

For production deployment, configure CORS headers:

```
Access-Control-Allow-Origin: https://yourdomain.com
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

## API Integration

### AuthContext Methods

```typescript
// Connect wallet
await connectWallet();

// Disconnect wallet
await disconnectWallet();

// Access current user
const { user } = useAuth();
// user.address - Wallet address
// user.isConnected - Connection status
// user.chainId - Current network chain ID
```

### Usage Example

```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, connectWallet, disconnectWallet, isWalletConnected } = useAuth();

  if (!isWalletConnected) {
    return <button onClick={connectWallet}>Connect Wallet</button>;
  }

  return (
    <div>
      <p>Connected: {user?.address}</p>
      <button onClick={disconnectWallet}>Disconnect</button>
    </div>
  );
}
```

## Environment Variables

Create `.env.local` in the project root:

```env
# Biconomy Configuration
VITE_BICONOMY_API_KEY=your_api_key
VITE_BICONOMY_PROJECT_ID=9be0b72c-f11f-48ca-a741-48a63fca96e3

# Loomio Configuration
VITE_LOOMIO_API_URL=http://localhost:3000/api/v1

# Network Configuration
VITE_CHAIN_ID=1  # 1 for Ethereum Mainnet, 5 for Goerli, etc.
VITE_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/your-key
```

## Troubleshooting

### Issue: "MetaMask is not installed"

**Solution:**
1. Install MetaMask browser extension: https://metamask.io
2. Or use WalletConnect: https://walletconnect.com

### Issue: "Failed to connect wallet"

**Solution:**
1. Ensure MetaMask is unlocked
2. Check browser console for detailed error
3. Try refreshing the page
4. Clear browser cache and cookies

### Issue: "Wrong network"

**Solution:**
1. Open MetaMask
2. Switch to the correct network (Ethereum Mainnet, Goerli, etc.)
3. Refresh the application

### Issue: "Transaction failed"

**Solution:**
1. Check Biconomy API key is valid
2. Verify sufficient balance for gas
3. Check network connectivity
4. Review transaction parameters

## Migration from Email/Password

If migrating from traditional authentication:

1. **Remove Supabase dependencies** - Already removed from AuthContext
2. **Update user references** - Use `user.address` instead of `user.email`
3. **Remove database calls** - No user table needed
4. **Update UI components** - Replace email displays with wallet addresses
5. **Test wallet connection** - Verify all flows work with wallet auth

## Production Deployment

### Checklist

- [ ] Set up production environment variables
- [ ] Configure CORS headers properly
- [ ] Enable HTTPS only
- [ ] Set up monitoring and logging
- [ ] Test with real wallets on mainnet
- [ ] Implement rate limiting
- [ ] Set up backup and recovery procedures
- [ ] Document all external service dependencies
- [ ] Create incident response plan

### Deployment Steps

1. Build the application:
   ```bash
   npm run build
   ```

2. Deploy to hosting service (Vercel, Netlify, etc.)

3. Configure environment variables in hosting dashboard

4. Test wallet connection on production

5. Monitor logs for errors

## Support and Resources

- **Biconomy Docs**: https://docs.biconomy.io
- **SnapDAO Docs**: https://docs.snapshot.org
- **Loomio Docs**: https://www.loomio.com
- **Ethereum Docs**: https://ethereum.org/developers
- **MetaMask Docs**: https://docs.metamask.io

## License

This authentication system is part of the harmony-node-flow project and follows the same license as the main project.
