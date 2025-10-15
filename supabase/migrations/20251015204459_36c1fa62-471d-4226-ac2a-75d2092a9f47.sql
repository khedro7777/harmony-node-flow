-- Create enum types
CREATE TYPE company_status AS ENUM ('pending', 'active', 'suspended', 'dissolved');
CREATE TYPE proposal_status AS ENUM ('draft', 'active', 'passed', 'rejected', 'executed');
CREATE TYPE vote_choice AS ENUM ('for', 'against', 'abstain');
CREATE TYPE arbitration_status AS ENUM ('filed', 'under_review', 'hearing', 'ruling_issued', 'closed');
CREATE TYPE shareholder_role AS ENUM ('founder', 'investor', 'employee', 'advisor');

-- Companies table
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  company_type TEXT NOT NULL,
  jurisdiction TEXT,
  formation_date DATE,
  status company_status DEFAULT 'pending',
  wallet_address TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shareholders table
CREATE TABLE shareholders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  wallet_address TEXT NOT NULL,
  share_count INTEGER NOT NULL DEFAULT 0,
  voting_power DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  role shareholder_role DEFAULT 'investor',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, user_id)
);

-- Proposals table
CREATE TABLE proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  proposal_type TEXT NOT NULL,
  status proposal_status DEFAULT 'draft',
  contract_address TEXT,
  ipfs_hash TEXT,
  voting_starts_at TIMESTAMPTZ,
  voting_ends_at TIMESTAMPTZ,
  quorum_required DECIMAL(5,2) DEFAULT 50.00,
  approval_threshold DECIMAL(5,2) DEFAULT 50.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Votes table
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID REFERENCES proposals(id) ON DELETE CASCADE NOT NULL,
  voter_id UUID REFERENCES auth.users(id) NOT NULL,
  choice vote_choice NOT NULL,
  voting_power DECIMAL(5,2) NOT NULL,
  signature TEXT,
  voted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(proposal_id, voter_id)
);

-- Arbitration cases table
CREATE TABLE arbitration_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  filed_by UUID REFERENCES auth.users(id) NOT NULL,
  respondent_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status arbitration_status DEFAULT 'filed',
  arbitrator_id UUID REFERENCES auth.users(id),
  ruling TEXT,
  evidence_ipfs_hash TEXT,
  filed_at TIMESTAMPTZ DEFAULT NOW(),
  ruling_issued_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Evidence documents table
CREATE TABLE evidence_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES arbitration_cases(id) ON DELETE CASCADE NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id) NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  ipfs_hash TEXT,
  description TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE shareholders ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE arbitration_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for companies
CREATE POLICY "Companies are viewable by shareholders"
  ON companies FOR SELECT
  USING (
    id IN (
      SELECT company_id FROM shareholders WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own companies"
  ON companies FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Company shareholders can update"
  ON companies FOR UPDATE
  USING (
    id IN (
      SELECT company_id FROM shareholders WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for shareholders
CREATE POLICY "Shareholders viewable by company members"
  ON shareholders FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM shareholders WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Company members can add shareholders"
  ON shareholders FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM shareholders WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for proposals
CREATE POLICY "Proposals viewable by company shareholders"
  ON proposals FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM shareholders WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Shareholders can create proposals"
  ON proposals FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM shareholders WHERE user_id = auth.uid()
    ) AND created_by = auth.uid()
  );

CREATE POLICY "Proposal creators can update their proposals"
  ON proposals FOR UPDATE
  USING (created_by = auth.uid());

-- RLS Policies for votes
CREATE POLICY "Votes viewable by company shareholders"
  ON votes FOR SELECT
  USING (
    proposal_id IN (
      SELECT p.id FROM proposals p
      INNER JOIN shareholders s ON p.company_id = s.company_id
      WHERE s.user_id = auth.uid()
    )
  );

CREATE POLICY "Shareholders can cast votes"
  ON votes FOR INSERT
  WITH CHECK (
    proposal_id IN (
      SELECT p.id FROM proposals p
      INNER JOIN shareholders s ON p.company_id = s.company_id
      WHERE s.user_id = auth.uid()
    ) AND voter_id = auth.uid()
  );

-- RLS Policies for arbitration_cases
CREATE POLICY "Cases viewable by company shareholders"
  ON arbitration_cases FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM shareholders WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Shareholders can file cases"
  ON arbitration_cases FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM shareholders WHERE user_id = auth.uid()
    ) AND filed_by = auth.uid()
  );

CREATE POLICY "Case parties can update"
  ON arbitration_cases FOR UPDATE
  USING (
    filed_by = auth.uid() OR 
    respondent_id = auth.uid() OR 
    arbitrator_id = auth.uid()
  );

-- RLS Policies for evidence_documents
CREATE POLICY "Evidence viewable by case participants"
  ON evidence_documents FOR SELECT
  USING (
    case_id IN (
      SELECT ac.id FROM arbitration_cases ac
      INNER JOIN shareholders s ON ac.company_id = s.company_id
      WHERE s.user_id = auth.uid()
    )
  );

CREATE POLICY "Case participants can upload evidence"
  ON evidence_documents FOR INSERT
  WITH CHECK (
    case_id IN (
      SELECT ac.id FROM arbitration_cases ac
      WHERE ac.filed_by = auth.uid() OR ac.respondent_id = auth.uid()
    ) AND uploaded_by = auth.uid()
  );

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proposals_updated_at
  BEFORE UPDATE ON proposals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_arbitration_cases_updated_at
  BEFORE UPDATE ON arbitration_cases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();