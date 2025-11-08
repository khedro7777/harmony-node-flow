import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { Building2, Upload, UserPlus } from 'lucide-react';

interface Shareholder {
  name: string;
  email: string;
  shareCount: number;
  votingPower: number;
}

const CreateCompany = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('existing');
  
  // Form states
  const [companyName, setCompanyName] = useState('');
  const [companyType, setCompanyType] = useState('');
  const [jurisdiction, setJurisdiction] = useState('');
  const [description, setDescription] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [shareholders, setShareholders] = useState<Shareholder[]>([
    { name: '', email: '', shareCount: 0, votingPower: 0 }
  ]);
  const [serviceProviderId, setServiceProviderId] = useState('');
  const [serviceProviders, setServiceProviders] = useState<any[]>([]);
  const [documents, setDocuments] = useState<File[]>([]);

  // Load service providers
  useState(() => {
    const loadProviders = async () => {
      const { data } = await supabase
        .from('service_providers')
        .select('*')
        .eq('is_active', true)
        .eq('is_verified', true);
      if (data) setServiceProviders(data);
    };
    loadProviders();
  });

  const addShareholder = () => {
    setShareholders([...shareholders, { name: '', email: '', shareCount: 0, votingPower: 0 }]);
  };

  const updateShareholder = (index: number, field: keyof Shareholder, value: any) => {
    const updated = [...shareholders];
    updated[index] = { ...updated[index], [field]: value };
    setShareholders(updated);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setDocuments(Array.from(e.target.files));
    }
  };

  const uploadDocuments = async (applicationId: string) => {
    const uploadedDocs = [];
    
    for (const file of documents) {
      const filePath = `${user!.id}/${applicationId}/${file.name}`;
      const { error, data } = await supabase.storage
        .from('company-docs')
        .upload(filePath, file);
      
      if (!error && data) {
        uploadedDocs.push({
          name: file.name,
          path: data.path,
          size: file.size,
          type: file.type
        });
      }
    }
    
    return uploadedDocs;
  };

  const handleSubmitExisting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    try {
      // Create company directly
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: companyName,
          company_type: companyType,
          jurisdiction,
          description,
          wallet_address: walletAddress,
          status: 'pending'
        })
        .select()
        .single();

      if (companyError) throw companyError;

      // Add shareholders
      const shareholdersData = shareholders
        .filter(sh => sh.email && sh.shareCount > 0)
        .map(sh => ({
          company_id: company.id,
          user_id: user.id,
          wallet_address: walletAddress || '',
          share_count: sh.shareCount,
          voting_power: sh.votingPower,
          role: 'founder' as const
        }));

      if (shareholdersData.length > 0) {
        const { error: shareholdersError } = await supabase
          .from('shareholders')
          .insert(shareholdersData);
        
        if (shareholdersError) throw shareholdersError;
      }

      // Create application record
      const { data: application, error: appError } = await supabase
        .from('company_applications')
        .insert([{
          company_id: company.id,
          applicant_id: user.id,
          application_type: 'existing_registration' as const,
          company_name: companyName,
          company_type: companyType,
          jurisdiction,
          business_description: description,
          shareholders_info: shareholders as any,
          application_status: 'completed' as const,
          kyc_status: 'approved' as const
        }])
        .select()
        .single();

      if (appError) throw appError;

      // Upload documents if any
      if (documents.length > 0) {
        const uploadedDocs = await uploadDocuments(application.id);
        await supabase
          .from('company_applications')
          .update({ documents_uploaded: uploadedDocs })
          .eq('id', application.id);
      }

      toast({
        title: 'Company Registered Successfully',
        description: 'Your company has been added to the platform'
      });

      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitViaProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !serviceProviderId) return;
    
    setLoading(true);
    try {
      // Create application
      const { data: application, error: appError } = await supabase
        .from('company_applications')
        .insert([{
          service_provider_id: serviceProviderId,
          applicant_id: user.id,
          application_type: 'new_formation' as const,
          company_name: companyName,
          company_type: companyType,
          jurisdiction,
          business_description: description,
          shareholders_info: shareholders as any,
          application_status: 'draft' as const
        }])
        .select()
        .single();

      if (appError) throw appError;

      // Upload documents
      if (documents.length > 0) {
        const uploadedDocs = await uploadDocuments(application.id);
        await supabase
          .from('company_applications')
          .update({ 
            documents_uploaded: uploadedDocs,
            application_status: 'submitted',
            kyc_status: 'submitted',
            submitted_at: new Date().toISOString()
          })
          .eq('id', application.id);
      }

      toast({
        title: 'Application Submitted Successfully',
        description: 'Your application will be reviewed by the service provider'
      });

      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/20 py-12 px-4">
      <div className="container max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <Building2 className="h-16 w-16 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-bold mb-2">Create New Company</h1>
          <p className="text-muted-foreground">Choose how to register your company on the platform</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="existing">Existing Company</TabsTrigger>
            <TabsTrigger value="new">Form New Company</TabsTrigger>
          </TabsList>

          <TabsContent value="existing">
            <Card>
              <CardHeader>
                <CardTitle>Register Existing Company</CardTitle>
                <CardDescription>
                  If you already have a registered company, you can add it directly to the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitExisting} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="companyName">Company Name *</Label>
                      <Input
                        id="companyName"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Your company name"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="companyType">Company Type *</Label>
                        <Select value={companyType} onValueChange={setCompanyType} required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="LLC">Limited Liability Company</SelectItem>
                            <SelectItem value="C-Corp">C-Corporation</SelectItem>
                            <SelectItem value="S-Corp">S-Corporation</SelectItem>
                            <SelectItem value="Partnership">Partnership</SelectItem>
                            <SelectItem value="Sole Proprietorship">Sole Proprietorship</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="jurisdiction">Jurisdiction *</Label>
                        <Select value={jurisdiction} onValueChange={setJurisdiction} required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USA">United States</SelectItem>
                            <SelectItem value="UK">United Kingdom</SelectItem>
                            <SelectItem value="UAE">United Arab Emirates</SelectItem>
                            <SelectItem value="Singapore">Singapore</SelectItem>
                            <SelectItem value="Estonia">Estonia</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description">Business Description</Label>
                      <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe your company's business activities..."
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="wallet">Wallet Address (Optional)</Label>
                      <Input
                        id="wallet"
                        value={walletAddress}
                        onChange={(e) => setWalletAddress(e.target.value)}
                        placeholder="0x..."
                      />
                    </div>

                    <div>
                      <Label className="flex items-center gap-2 mb-2">
                        <UserPlus className="h-4 w-4" />
                        Shareholders
                      </Label>
                      {shareholders.map((sh, index) => (
                        <div key={index} className="grid grid-cols-4 gap-2 mb-2">
                          <Input
                            placeholder="Name"
                            value={sh.name}
                            onChange={(e) => updateShareholder(index, 'name', e.target.value)}
                          />
                          <Input
                            placeholder="Email"
                            type="email"
                            value={sh.email}
                            onChange={(e) => updateShareholder(index, 'email', e.target.value)}
                          />
                          <Input
                            placeholder="Shares"
                            type="number"
                            value={sh.shareCount || ''}
                            onChange={(e) => updateShareholder(index, 'shareCount', parseInt(e.target.value) || 0)}
                          />
                          <Input
                            placeholder="Voting Power %"
                            type="number"
                            value={sh.votingPower || ''}
                            onChange={(e) => updateShareholder(index, 'votingPower', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                      ))}
                      <Button type="button" variant="outline" size="sm" onClick={addShareholder} className="mt-2">
                        + Add Shareholder
                      </Button>
                    </div>

                    <div>
                      <Label className="flex items-center gap-2 mb-2">
                        <Upload className="h-4 w-4" />
                        Documents (Certificate of Registration, Articles of Incorporation, etc.)
                      </Label>
                      <Input
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={handleFileSelect}
                      />
                      {documents.length > 0 && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {documents.length} file(s) selected
                        </p>
                      )}
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Registering...' : 'Register Company'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="new">
            <Card>
              <CardHeader>
                <CardTitle>Form New Company</CardTitle>
                <CardDescription>
                  Choose a service provider to help you legally form a new company
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitViaProvider} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="provider">Select Service Provider *</Label>
                      <Select value={serviceProviderId} onValueChange={setServiceProviderId} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select service provider" />
                        </SelectTrigger>
                        <SelectContent>
                          {serviceProviders.map((provider) => (
                            <SelectItem key={provider.id} value={provider.id}>
                              {provider.name} - {provider.country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {serviceProviderId && (
                        <div className="mt-2 p-3 bg-accent/50 rounded-md">
                          {serviceProviders.find(p => p.id === serviceProviderId)?.description}
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="newCompanyName">Desired Company Name *</Label>
                      <Input
                        id="newCompanyName"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="New company name"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="newCompanyType">Company Type *</Label>
                        <Select value={companyType} onValueChange={setCompanyType} required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="LLC">Limited Liability Company</SelectItem>
                            <SelectItem value="C-Corp">C-Corporation</SelectItem>
                            <SelectItem value="S-Corp">S-Corporation</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="newJurisdiction">Jurisdiction *</Label>
                        <Select value={jurisdiction} onValueChange={setJurisdiction} required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USA">United States</SelectItem>
                            <SelectItem value="UK">United Kingdom</SelectItem>
                            <SelectItem value="UAE">United Arab Emirates</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="newDescription">Business Description *</Label>
                      <Textarea
                        id="newDescription"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe your future company's activities..."
                        rows={3}
                        required
                      />
                    </div>

                    <div>
                      <Label className="flex items-center gap-2 mb-2">
                        <UserPlus className="h-4 w-4" />
                        Founder Information
                      </Label>
                      {shareholders.map((sh, index) => (
                        <div key={index} className="grid grid-cols-3 gap-2 mb-2">
                          <Input
                            placeholder="Full Name"
                            value={sh.name}
                            onChange={(e) => updateShareholder(index, 'name', e.target.value)}
                            required
                          />
                          <Input
                            placeholder="Email Address"
                            type="email"
                            value={sh.email}
                            onChange={(e) => updateShareholder(index, 'email', e.target.value)}
                            required
                          />
                          <Input
                            placeholder="Ownership %"
                            type="number"
                            value={sh.votingPower || ''}
                            onChange={(e) => updateShareholder(index, 'votingPower', parseFloat(e.target.value) || 0)}
                            required
                          />
                        </div>
                      ))}
                      <Button type="button" variant="outline" size="sm" onClick={addShareholder} className="mt-2">
                        + Add Founder
                      </Button>
                    </div>

                    <div>
                      <Label className="flex items-center gap-2 mb-2">
                        <Upload className="h-4 w-4" />
                        KYC Documents (Passport, Proof of Address) *
                      </Label>
                      <Input
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileSelect}
                        required
                      />
                      {documents.length > 0 && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {documents.length} file(s) selected
                        </p>
                      )}
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading || !serviceProviderId}>
                    {loading ? 'Submitting...' : 'Submit Application'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CreateCompany;