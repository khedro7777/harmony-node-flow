import { supabase } from '@/integrations/supabase/client';

export interface ServiceProviderRequest {
  companyName: string;
  companyType: string;
  jurisdiction: string;
  shareholders: Array<{
    name: string;
    email: string;
    sharePercentage: number;
  }>;
  documents: Array<{
    name: string;
    url: string;
  }>;
}

export interface ServiceProviderResponse {
  success: boolean;
  applicationId?: string;
  estimatedCost?: number;
  estimatedTime?: string;
  error?: string;
}

/**
 * Call external service provider API to initiate company formation
 */
export async function createCompanyViaProvider(
  providerId: string,
  request: ServiceProviderRequest
): Promise<ServiceProviderResponse> {
  try {
    // Get provider details from database
    const { data: provider, error: providerError } = await supabase
      .from('service_providers')
      .select('*')
      .eq('id', providerId)
      .single();

    if (providerError || !provider) {
      throw new Error('Service provider not found');
    }

    // If provider has API endpoint, call it
    if (provider.api_endpoint) {
      const response = await fetch(provider.api_endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${provider.api_key_hash || ''}`,
        },
        body: JSON.stringify({
          ...request,
          callbackUrl: `${window.location.origin}/api/webhooks/partner`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create company with provider');
      }

      const data = await response.json();
      return {
        success: true,
        applicationId: data.applicationId,
        estimatedCost: data.estimatedCost,
        estimatedTime: data.estimatedTime,
      };
    }

    // If no API endpoint, return success (manual processing)
    const pricing = provider.pricing as any;
    return {
      success: true,
      estimatedCost: pricing?.base_cost || 0,
      estimatedTime: '7-14 days',
    };
  } catch (error: any) {
    console.error('Service provider API error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Check status of company formation application
 */
export async function checkApplicationStatus(
  applicationId: string
): Promise<{
  status: string;
  message?: string;
  companyId?: string;
}> {
  try {
    const { data: application, error } = await supabase
      .from('company_applications')
      .select('*, service_providers(*)')
      .eq('id', applicationId)
      .single();

    if (error || !application) {
      throw new Error('Application not found');
    }

    // If provider has API, check with them
    if (application.service_providers?.api_endpoint) {
      const response = await fetch(
        `${application.service_providers.api_endpoint}/status/${applicationId}`,
        {
          headers: {
            'Authorization': `Bearer ${application.service_providers.api_key_hash || ''}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        return {
          status: data.status,
          message: data.message,
          companyId: data.companyId,
        };
      }
    }

    // Return local status
    return {
      status: application.application_status,
      message: application.rejection_reason || undefined,
      companyId: application.company_id || undefined,
    };
  } catch (error: any) {
    console.error('Status check error:', error);
    throw error;
  }
}

/**
 * Handle webhook callback from service provider
 */
export async function handleProviderWebhook(payload: {
  applicationId: string;
  status: string;
  companyId?: string;
  documents?: any;
}) {
  const { applicationId, status, companyId, documents } = payload;

  // Update application status
  const updates: any = {
    application_status: status,
  };

  if (companyId) {
    updates.company_id = companyId;
  }

  if (documents) {
    updates.documents_uploaded = documents;
  }

  if (status === 'approved') {
    updates.approved_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from('company_applications')
    .update(updates)
    .eq('id', applicationId);

  if (error) {
    console.error('Webhook update error:', error);
    throw error;
  }

  return { success: true };
}