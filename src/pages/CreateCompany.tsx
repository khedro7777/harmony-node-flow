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
        title: 'تم تسجيل الشركة بنجاح',
        description: 'تم إضافة شركتك إلى المنصة'
      });

      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: 'خطأ',
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
        title: 'تم إرسال الطلب بنجاح',
        description: 'سيتم مراجعة طلبك من قبل مزود الخدمة'
      });

      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: 'خطأ',
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
          <h1 className="text-4xl font-bold mb-2">إنشاء شركة جديدة</h1>
          <p className="text-muted-foreground">اختر طريقة تسجيل شركتك على المنصة</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="existing">شركة موجودة</TabsTrigger>
            <TabsTrigger value="new">تأسيس شركة جديدة</TabsTrigger>
          </TabsList>

          <TabsContent value="existing">
            <Card>
              <CardHeader>
                <CardTitle>تسجيل شركة موجودة</CardTitle>
                <CardDescription>
                  إذا كانت لديك شركة مسجلة بالفعل، يمكنك إضافتها مباشرة إلى المنصة
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitExisting} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="companyName">اسم الشركة *</Label>
                      <Input
                        id="companyName"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="اسم شركتك"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="companyType">نوع الشركة *</Label>
                        <Select value={companyType} onValueChange={setCompanyType} required>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر النوع" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="LLC">شركة ذات مسؤولية محدودة</SelectItem>
                            <SelectItem value="C-Corp">شركة مساهمة</SelectItem>
                            <SelectItem value="S-Corp">شركة مساهمة صغيرة</SelectItem>
                            <SelectItem value="Partnership">شراكة</SelectItem>
                            <SelectItem value="Sole Proprietorship">مؤسسة فردية</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="jurisdiction">الاختصاص القضائي *</Label>
                        <Select value={jurisdiction} onValueChange={setJurisdiction} required>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر الدولة" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USA">الولايات المتحدة</SelectItem>
                            <SelectItem value="UK">المملكة المتحدة</SelectItem>
                            <SelectItem value="UAE">الإمارات</SelectItem>
                            <SelectItem value="Singapore">سنغافورة</SelectItem>
                            <SelectItem value="Estonia">إستونيا</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description">وصف النشاط التجاري</Label>
                      <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="صف نشاط شركتك..."
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="wallet">عنوان المحفظة (اختياري)</Label>
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
                        المساهمون
                      </Label>
                      {shareholders.map((sh, index) => (
                        <div key={index} className="grid grid-cols-4 gap-2 mb-2">
                          <Input
                            placeholder="الاسم"
                            value={sh.name}
                            onChange={(e) => updateShareholder(index, 'name', e.target.value)}
                          />
                          <Input
                            placeholder="البريد الإلكتروني"
                            type="email"
                            value={sh.email}
                            onChange={(e) => updateShareholder(index, 'email', e.target.value)}
                          />
                          <Input
                            placeholder="الأسهم"
                            type="number"
                            value={sh.shareCount || ''}
                            onChange={(e) => updateShareholder(index, 'shareCount', parseInt(e.target.value) || 0)}
                          />
                          <Input
                            placeholder="قوة التصويت %"
                            type="number"
                            value={sh.votingPower || ''}
                            onChange={(e) => updateShareholder(index, 'votingPower', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                      ))}
                      <Button type="button" variant="outline" size="sm" onClick={addShareholder} className="mt-2">
                        + إضافة مساهم
                      </Button>
                    </div>

                    <div>
                      <Label className="flex items-center gap-2 mb-2">
                        <Upload className="h-4 w-4" />
                        المستندات (شهادة التسجيل، عقد التأسيس، إلخ)
                      </Label>
                      <Input
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={handleFileSelect}
                      />
                      {documents.length > 0 && (
                        <p className="text-sm text-muted-foreground mt-1">
                          تم اختيار {documents.length} ملف
                        </p>
                      )}
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'جاري التسجيل...' : 'تسجيل الشركة'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="new">
            <Card>
              <CardHeader>
                <CardTitle>تأسيس شركة جديدة</CardTitle>
                <CardDescription>
                  اختر مزود خدمة لمساعدتك في تأسيس شركة جديدة قانونياً
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitViaProvider} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="provider">اختر مزود الخدمة *</Label>
                      <Select value={serviceProviderId} onValueChange={setServiceProviderId} required>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر مزود الخدمة" />
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
                      <Label htmlFor="newCompanyName">اسم الشركة المطلوب *</Label>
                      <Input
                        id="newCompanyName"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="اسم الشركة الجديدة"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="newCompanyType">نوع الشركة *</Label>
                        <Select value={companyType} onValueChange={setCompanyType} required>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر النوع" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="LLC">شركة ذات مسؤولية محدودة</SelectItem>
                            <SelectItem value="C-Corp">شركة مساهمة</SelectItem>
                            <SelectItem value="S-Corp">شركة مساهمة صغيرة</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="newJurisdiction">الاختصاص القضائي *</Label>
                        <Select value={jurisdiction} onValueChange={setJurisdiction} required>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر الدولة" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USA">الولايات المتحدة</SelectItem>
                            <SelectItem value="UK">المملكة المتحدة</SelectItem>
                            <SelectItem value="UAE">الإمارات</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="newDescription">وصف النشاط التجاري *</Label>
                      <Textarea
                        id="newDescription"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="صف نشاط شركتك المستقبلية..."
                        rows={3}
                        required
                      />
                    </div>

                    <div>
                      <Label className="flex items-center gap-2 mb-2">
                        <UserPlus className="h-4 w-4" />
                        معلومات المؤسسين
                      </Label>
                      {shareholders.map((sh, index) => (
                        <div key={index} className="grid grid-cols-3 gap-2 mb-2">
                          <Input
                            placeholder="الاسم الكامل"
                            value={sh.name}
                            onChange={(e) => updateShareholder(index, 'name', e.target.value)}
                            required
                          />
                          <Input
                            placeholder="البريد الإلكتروني"
                            type="email"
                            value={sh.email}
                            onChange={(e) => updateShareholder(index, 'email', e.target.value)}
                            required
                          />
                          <Input
                            placeholder="نسبة الملكية %"
                            type="number"
                            value={sh.votingPower || ''}
                            onChange={(e) => updateShareholder(index, 'votingPower', parseFloat(e.target.value) || 0)}
                            required
                          />
                        </div>
                      ))}
                      <Button type="button" variant="outline" size="sm" onClick={addShareholder} className="mt-2">
                        + إضافة مؤسس
                      </Button>
                    </div>

                    <div>
                      <Label className="flex items-center gap-2 mb-2">
                        <Upload className="h-4 w-4" />
                        مستندات KYC (جواز السفر، إثبات العنوان) *
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
                          تم اختيار {documents.length} ملف
                        </p>
                      )}
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading || !serviceProviderId}>
                    {loading ? 'جاري الإرسال...' : 'إرسال الطلب'}
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