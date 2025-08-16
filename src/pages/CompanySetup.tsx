
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Upload, Building2 } from 'lucide-react'
import { useSingleFileUpload } from '@/hooks/useSingleFileUpload'
import { useCreateCompanyPage } from '@/hooks/useCompanyPage'
import { CompanyPagePreview } from '@/components/company/CompanyPagePreview'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'

const CompanySetup = () => {
  const [formData, setFormData] = useState({
    name: '',
    beembyteUrl: '',
    website: '',
    industry: '',
    industryType: '',
    organizationSize: '',
    tagline: '',
    logo: '',
    agreedToTerms: false
  })

  const { uploadFile, isUploading } = useSingleFileUpload()
  const { mutate: createPage, isPending: isCreatingPage } = useCreateCompanyPage()
  const navigate = useNavigate()

  const industryTypes = [
    'Private Company',
    'Public Company',
    'Non-Governmental Organization',
    'Government Agency',
    'Educational Institution',
    'Non-Profit Organization'
  ]

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const logoUrl = await uploadFile(file)
      if (logoUrl) {
        handleInputChange('logo', logoUrl)
      }
    }
  }

  const getCharCount = (text: string) => {
    return text.length;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.beembyteUrl || !formData.industry || !formData.industryType || !formData.organizationSize || !formData.agreedToTerms) {
      toast.error('Please fill in all required fields')
      return
    }

    const taglineCharCount = getCharCount(formData.tagline);
    if (taglineCharCount > 50) {
      toast.error('Tagline must not exceed 50 characters')
      return
    }

    const payload = {
      name: formData.name,
      company_url: formData.beembyteUrl,
      website: formData.website,
      industry: formData.industry,
      industry_type: formData.industryType,
      size: formData.organizationSize,
      logo: formData.logo,
      page_image: formData.logo, // Using logo as page image since we removed separate page image upload
      tag_line: formData.tagline,
      agreed_terms: formData.agreedToTerms
    }

    createPage(payload, {
      onSuccess: (response) => {
        console.log('Company page created successfully:', response)
        toast.success('Company page created successfully!')
        navigate(`/company/page/${formData.beembyteUrl}`)
      },
      onError: (error) => {
        console.error('Failed to create company page:', error)
      }
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-light text-foreground">
                Let's get started with a few details about your company.
              </h1>
            </div>
            <p className="text-sm text-muted-foreground ml-15">
              <span className="text-destructive">*</span> indicates required
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form Section */}
            <div className="bg-card rounded-lg shadow-sm border border-border p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Company Name */}
                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-card-foreground">
                    Name<span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="Add your organization's name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>

                {/* BeemByte URL */}
                <div>
                  <Label htmlFor="beembyteUrl" className="text-sm font-medium text-card-foreground">
                    beembyte.com/company/<span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="beembyteUrl"
                    placeholder="Add your unique BeemByte address"
                    value={formData.beembyteUrl}
                    onChange={(e) => handleInputChange('beembyteUrl', e.target.value)}
                    className="mt-1"
                    required
                  />
                  <button
                    type="button"
                    className="text-primary text-sm mt-2 hover:underline"
                  >
                    Learn more about the Company Public URL
                  </button>
                </div>

                {/* Website */}
                <div>
                  <Label htmlFor="website" className="text-sm font-medium text-card-foreground">
                    Website
                  </Label>
                  <Input
                    id="website"
                    placeholder="Begin with http://, https:// or www."
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    className="mt-1"
                  />
                </div>

                {/* Industry */}
                <div>
                  <Label htmlFor="industry" className="text-sm font-medium text-card-foreground">
                    Industry<span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="industry"
                    placeholder="e.g: Information Services"
                    value={formData.industry}
                    onChange={(e) => handleInputChange('industry', e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>

                {/* Industry Type */}
                <div>
                  <Label htmlFor="industryType" className="text-sm font-medium text-card-foreground">
                    Industry Type<span className="text-destructive">*</span>
                  </Label>
                  <Select value={formData.industryType} onValueChange={(value) => handleInputChange('industryType', value)} required>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select industry type" />
                    </SelectTrigger>
                    <SelectContent>
                      {industryTypes.map((type) => (
                        <SelectItem key={type} value={type.toLowerCase().replace(/\s+/g, '_')}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Organization Size */}
                <div>
                  <Label htmlFor="organizationSize" className="text-sm font-medium text-card-foreground">
                    Organization size<span className="text-destructive">*</span>
                  </Label>
                  <Select value={formData.organizationSize} onValueChange={(value) => handleInputChange('organizationSize', value)} required>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10">1-10 employees</SelectItem>
                      <SelectItem value="11-50">11-50 employees</SelectItem>
                      <SelectItem value="51-200">51-200 employees</SelectItem>
                      <SelectItem value="201-500">201-500 employees</SelectItem>
                      <SelectItem value="501-1000">501-1000 employees</SelectItem>
                      <SelectItem value="1000+">1000+ employees</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Logo Upload */}
                <div>
                  <Label className="text-sm font-medium text-card-foreground">Logo</Label>
                  <div className="mt-1">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80 border-border">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground">
                          <span className="font-semibold">Choose file</span>
                        </p>
                        <p className="text-xs text-muted-foreground">Upload to see preview</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/jpeg,image/jpg,image/png"
                        onChange={handleLogoUpload}
                        disabled={isUploading}
                      />
                    </label>
                    <p className="text-xs text-muted-foreground mt-2">
                      300 x 300px recommended. JPGs, JPEGs, and PNGs supported.
                    </p>
                  </div>
                </div>

                {/* Tagline */}
                <div>
                  <Label htmlFor="tagline" className="text-sm font-medium text-card-foreground">
                    Tagline
                  </Label>
                  <Textarea
                    id="tagline"
                    placeholder="e.g: An information services firm helping small businesses succeed."
                    value={formData.tagline}
                    onChange={(e) => handleInputChange('tagline', e.target.value)}
                    className="mt-1"
                    rows={3}
                    maxLength={50}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Use your tagline to briefly describe what your organization does. This can be changed later. {getCharCount(formData.tagline)}/50 characters
                  </p>
                </div>

                {/* Terms Agreement */}
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={formData.agreedToTerms}
                    onCheckedChange={(checked) => handleInputChange('agreedToTerms', checked as boolean)}
                    required
                  />
                  <Label htmlFor="terms" className="text-xs text-muted-foreground leading-relaxed">
                    I verify that I am an authorized representative of this organization and have
                    the right to act on its behalf in the creation and management of this page.
                    The organization and I agree to the additional terms for Company Pages.
                  </Label>
                </div>

                <button
                  type="button"
                  className="text-primary text-sm hover:underline"
                >
                  Read the BeemByte Company Pages Terms
                </button>

                {/* Submit Button */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2 rounded"
                    disabled={isCreatingPage || isUploading || !formData.agreedToTerms || !formData.name || !formData.beembyteUrl || !formData.industry || !formData.industryType || !formData.organizationSize}
                  >
                    {isCreatingPage ? 'Creating page...' : 'Create page'}
                  </Button>
                </div>
              </form>
            </div>

            {/* Page Preview Section */}
            <div className="bg-card rounded-lg shadow-sm border border-border p-6 h-[fit-content] sticky top-20">
              <CompanyPagePreview formData={formData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CompanySetup
