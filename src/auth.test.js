import { signUpWithEmail, updateUserWallet } from './lib/supabaseClient.js';

jest.mock('dotenv/config', () => ({}));

jest.mock('./lib/supabaseClient.js', () => ({
  __esModule: true,
  ...jest.requireActual('./lib/supabaseClient.js'),
  supabase: {
    auth: {
      signUp: jest.fn().mockResolvedValue({ data: { user: { id: '123' } }, error: null }),
    },
    from: jest.fn(() => ({
      update: jest.fn().mockResolvedValue({ data: [{ id: '123', wallet: '0xabcdef123456' }], error: null }),
      eq: jest.fn(() => ({
        select: jest.fn().mockResolvedValue({ data: [{ id: '123', wallet: '0xabcdef123456' }], error: null }),
      })),
    })),
  },
}));

describe('Authentication and User Management', () => {
  it('should sign up a new user', async () => {
    const email = 'test@example.com';
    const password = 'password123';
    const data = await signUpWithEmail(email, password);
    expect(data.user.id).toBe('123');
  });

  it('should update a user wallet', async () => {
    const userId = '123';
    const walletAddress = '0xabcdef123456';
    const data = await updateUserWallet(userId, walletAddress);
    expect(data[0].wallet).toBe(walletAddress);
  });
});
