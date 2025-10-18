import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Application {
  id: string;
  company_name: string;
  company_type: string;
  jurisdiction: string;
  application_type: string;
  application_status: string;
  kyc_status: string;
  created_at: string;
  service_providers?: {
    name: string;
    country: string;
  };
}

const CompanyApplications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadApplications();
    }
  }, [user]);

  const loadApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('company_applications')
        .select(`
          *,
          service_providers (
            name,
            country
          )
        `)
        .eq('applicant_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      draft: { label: 'Draft', variant: 'outline' },
      submitted: { label: 'Submitted', variant: 'secondary' },
      processing: { label: 'Processing', variant: 'default' },
      approved: { label: 'Approved', variant: 'default' },
      rejected: { label: 'Rejected', variant: 'destructive' },
      completed: { label: 'Completed', variant: 'default' },
    };

    const config = statusConfig[status] || { label: status, variant: 'outline' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return <CheckCircle2 className="h-5 w-5 text-success" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-destructive" />;
      case 'processing':
      case 'submitted':
        return <Clock className="h-5 w-5 text-primary" />;
      default:
        return <AlertCircle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (applications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Company Applications</CardTitle>
          <CardDescription>You haven't submitted any applications yet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">No applications available</p>
            <Button onClick={() => navigate('/create-company')}>
              Create New Company
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Company Applications</h2>
      <div className="grid gap-4">
        {applications.map((app) => (
          <Card key={app.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  {getStatusIcon(app.application_status)}
                  <div>
                    <h3 className="font-semibold text-lg">{app.company_name}</h3>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <span>{app.company_type}</span>
                      <span>•</span>
                      <span>{app.jurisdiction}</span>
                    </div>
                  </div>
                </div>
                {getStatusBadge(app.application_status)}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Application Type:</span>
                  <p className="font-medium">
                    {app.application_type === 'new_formation' ? 'New Formation' : 'Existing Company Registration'}
                  </p>
                </div>

                {app.service_providers && (
                  <div>
                    <span className="text-muted-foreground">Service Provider:</span>
                    <p className="font-medium">
                      {app.service_providers.name} ({app.service_providers.country})
                    </p>
                  </div>
                )}

                <div>
                  <span className="text-muted-foreground">KYC Status:</span>
                  <p className="font-medium">{getStatusBadge(app.kyc_status)}</p>
                </div>

                <div>
                  <span className="text-muted-foreground">Created Date:</span>
                  <p className="font-medium">
                    {new Date(app.created_at).toLocaleDateString('en-US')}
                  </p>
                </div>
              </div>

              {app.application_status === 'draft' && (
                <div className="mt-4 pt-4 border-t">
                  <Button 
                    size="sm" 
                    onClick={() => navigate(`/create-company?edit=${app.id}`)}
                  >
                    Complete Application
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CompanyApplications;