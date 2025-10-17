-- Create service providers table
CREATE TABLE public.service_providers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  country TEXT NOT NULL,
  services_offered TEXT[] NOT NULL DEFAULT '{}',
  api_endpoint TEXT,
  api_key_hash TEXT,
  pricing JSONB,
  rating NUMERIC(3,2) DEFAULT 0.00,
  total_companies_formed INTEGER DEFAULT 0,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  website_url TEXT,
  logo_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create company applications table
CREATE TABLE public.company_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  service_provider_id UUID REFERENCES public.service_providers(id),
  applicant_id UUID NOT NULL,
  application_type TEXT NOT NULL CHECK (application_type IN ('new_formation', 'existing_registration')),
  company_name TEXT NOT NULL,
  company_type TEXT NOT NULL,
  jurisdiction TEXT NOT NULL,
  business_description TEXT,
  shareholders_info JSONB NOT NULL DEFAULT '[]',
  documents_uploaded JSONB DEFAULT '[]',
  kyc_status TEXT DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'submitted', 'under_review', 'approved', 'rejected')),
  application_status TEXT DEFAULT 'draft' CHECK (application_status IN ('draft', 'submitted', 'processing', 'approved', 'rejected', 'completed')),
  rejection_reason TEXT,
  total_cost NUMERIC(10,2),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  payment_transaction_id TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create storage bucket for company documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'company-docs',
  'company-docs',
  false,
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
);

-- Enable RLS on new tables
ALTER TABLE public.service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for service_providers
CREATE POLICY "Service providers viewable by everyone"
ON public.service_providers
FOR SELECT
USING (is_active = true);

CREATE POLICY "Only admins can manage service providers"
ON public.service_providers
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for company_applications
CREATE POLICY "Users can view own applications"
ON public.company_applications
FOR SELECT
USING (applicant_id = auth.uid());

CREATE POLICY "Users can create applications"
ON public.company_applications
FOR INSERT
WITH CHECK (applicant_id = auth.uid());

CREATE POLICY "Users can update own draft applications"
ON public.company_applications
FOR UPDATE
USING (applicant_id = auth.uid() AND application_status = 'draft');

CREATE POLICY "Service providers can view their applications"
ON public.company_applications
FOR SELECT
USING (
  service_provider_id IN (
    SELECT id FROM public.service_providers 
    WHERE contact_email = (SELECT email FROM public.profiles WHERE id = auth.uid())
  )
);

CREATE POLICY "Admins can view all applications"
ON public.company_applications
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Storage policies for company-docs bucket
CREATE POLICY "Users can upload their own documents"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'company-docs' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'company-docs' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Service providers can view application documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'company-docs' AND
  EXISTS (
    SELECT 1 FROM public.company_applications ca
    JOIN public.service_providers sp ON ca.service_provider_id = sp.id
    WHERE sp.contact_email = (SELECT email FROM public.profiles WHERE id = auth.uid())
    AND (storage.foldername(name))[2] = ca.id::text
  )
);

-- Add triggers for updated_at
CREATE TRIGGER update_service_providers_updated_at
BEFORE UPDATE ON public.service_providers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_company_applications_updated_at
BEFORE UPDATE ON public.company_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample service providers
INSERT INTO public.service_providers (name, country, services_offered, contact_email, description, is_verified, is_active)
VALUES 
('Atlas Formation Services', 'USA', ARRAY['LLC Formation', 'C-Corp Formation', 'Registered Agent'], 'contact@atlasformation.com', 'Leading US company formation service with automated incorporation', true, true),
('UK Companies House', 'United Kingdom', ARRAY['Limited Company', 'LLP Formation'], 'support@companieshouse.gov.uk', 'Official UK company registration service', true, true),
('Dubai Business Setup', 'UAE', ARRAY['Free Zone Company', 'Mainland Company', 'Offshore Company'], 'info@dubaibusiness.ae', 'Complete business setup services in UAE', true, true);