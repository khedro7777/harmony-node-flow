CREATE TABLE users (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  wallet_address text,
  role text default 'member',
  created_at timestamp default now()
);

CREATE TABLE companies (
  id uuid primary key default uuid_generate_v4(),
  name text,
  founder_id uuid references users(id),
  status text default 'active'
);

CREATE TABLE proposals (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references companies(id),
  title text,
  description text,
  created_by uuid references users(id),
  status text default 'pending',
  created_at timestamp default now()
);

CREATE TABLE votes (
  id uuid primary key default uuid_generate_v4(),
  proposal_id uuid references proposals(id),
  voter_id uuid references users(id),
  vote text,
  created_at timestamp default now()
);

CREATE TABLE decisions (
  id uuid primary key default uuid_generate_v4(),
  proposal_id uuid references proposals(id),
  decision text,
  created_at timestamp default now()
);

CREATE TABLE treasury (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references companies(id),
  balance numeric default 0,
  last_update timestamp default now()
);

CREATE TABLE safe_wallet (
  id uuid primary key default uuid_generate_v4(),
  safe_address text,
  threshold integer,
  owners text[]
);

CREATE TABLE transactions (
  id uuid primary key default uuid_generate_v4(),
  tx_hash text,
  amount numeric,
  asset text,
  status text,
  required_signers integer,
  signed_by text[],
  created_at timestamp default now()
);

CREATE TABLE wallet_transfers (
  id uuid primary key default uuid_generate_v4(),
  sender_id uuid references users(id),
  receiver_id uuid references users(id),
  amount numeric,
  purpose text,
  timestamp timestamp default now()
);
