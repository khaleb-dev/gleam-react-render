
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Upload, Package } from 'lucide-react'
import { useSingleFileUpload } from '@/hooks/useSingleFileUpload'
import { useCreateProduct } from '@/hooks/useCreateProduct'
import { useUserPages } from '@/hooks/useUserPages'
import { ProductPreview } from '@/components/product/ProductPreview'
import { toast } from 'sonner'
import { useNavigate, useSearchParams } from 'react-router-dom'

const ProductSetup = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    website: '',
    percentage: 0,
    isLive: false,
    logo: '',
    pageId: ''
  })
  
  // Store the selected company URL for navigation
  const [selectedCompanyUrl, setSelectedCompanyUrl] = useState('')

  const { uploadFile, isUploading } = useSingleFileUpload()
  const { mutate: createProduct, isPending: isCreatingProduct } = useCreateProduct()
  const { data: userPages, isLoading: isLoadingPages } = useUserPages()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Get company info from URL params if available
  const companyId = searchParams.get('companyId')
  const companyName = searchParams.get('companyName')
  const companyUrl = searchParams.get('companyUrl')

  const userPagesData = userPages?.data?.pages || []

  // Set default pageId and companyUrl if coming from company profile
  React.useEffect(() => {
    if (companyId && companyUrl && !formData.pageId) {
      setFormData(prev => ({ ...prev, pageId: companyId }))
      setSelectedCompanyUrl(companyUrl)
    }
  }, [companyId, companyUrl, formData.pageId])

  const handleInputChange = (field: string, value: string | boolean | number) => {
    // Limit description to 200 characters
    if (field === 'description' && typeof value === 'string') {
      value = value.slice(0, 200)
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleCompanySelection = (pageId: string) => {
    handleInputChange('pageId', pageId)
    
    // Find the selected company and store its URL
    const selectedPage = userPagesData.find((page: any) => page._id === pageId)
    if (selectedPage && selectedPage.company_url) {
      setSelectedCompanyUrl(selectedPage.company_url)
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.description || !formData.pageId) {
      toast.error('Please fill in all required fields')
      return
    }

    const payload = {
      page_id: formData.pageId,
      name: formData.name,
      description: formData.description,
      website: formData.website,
      percentage: formData.percentage,
      is_live: formData.isLive,
      logo: formData.logo
    }

    createProduct(payload, {
      onSuccess: (response) => {
        console.log('Product created successfully:', response)
        toast.success('Product created successfully!')
        
        // Use the stored company URL or fallback to the URL from search params
        const navigationUrl = selectedCompanyUrl || companyUrl
        if (navigationUrl) {
          navigate(`/company/page/${encodeURIComponent(navigationUrl)}`)
        } else {
          // Fallback to feed or wherever appropriate
          navigate('/feed')
        }
      },
      onError: (error) => {
        console.error('Failed to create product:', error)
      }
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
              </div>
              <h1 className="text-xl sm:text-2xl font-light text-foreground">
                Let's create your product.
              </h1>
            </div>
            <p className="text-sm text-muted-foreground ml-13 sm:ml-15">
              <span className="text-destructive">*</span> indicates required
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
            {/* Form Section */}
            <div className="bg-card rounded-lg shadow-sm border border-border p-4 sm:p-6">
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                {/* Company/Page Selection */}
                <div>
                  <Label htmlFor="pageId" className="text-sm font-medium text-card-foreground">
                    Select Company Page<span className="text-destructive">*</span>
                  </Label>
                  <Select value={formData.pageId} onValueChange={handleCompanySelection} required>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder={companyName ? `${companyName}` : "Select a company page"} />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingPages ? (
                        <SelectItem value="loading" disabled>Loading pages...</SelectItem>
                      ) : userPagesData.length > 0 ? (
                        userPagesData.map((page: any) => (
                          <SelectItem key={page._id} value={page._id}>
                            {page.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-pages" disabled>No pages available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Product Name */}
                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-card-foreground">
                    Product Name<span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="Enter your product name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description" className="text-sm font-medium text-card-foreground">
                    Description<span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your product"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="mt-1"
                    rows={4}
                    maxLength={200}
                    required
                  />
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-muted-foreground">
                      Brief description of your product
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {200 - formData.description.length} characters left
                    </p>
                  </div>
                </div>

                {/* Website URL */}
                <div>
                  <Label htmlFor="website" className="text-sm font-medium text-card-foreground">
                    Website URL
                  </Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://example.com"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Optional: Link to your product's website
                  </p>
                </div>

                {/* Percentage */}
                <div>
                  <Label htmlFor="percentage" className="text-sm font-medium text-card-foreground">
                    Progress Percentage
                  </Label>
                  <Input
                    id="percentage"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="0"
                    value={formData.percentage}
                    onChange={(e) => handleInputChange('percentage', parseInt(e.target.value) || 0)}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    How complete is your product? (0-100%)
                  </p>
                </div>

                {/* Logo Upload */}
                <div>
                  <Label className="text-sm font-medium text-card-foreground">Product Logo</Label>
                  <div className="mt-1">
                    <label className="flex flex-col items-center justify-center w-full h-24 sm:h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80 border-border">
                      <div className="flex flex-col items-center justify-center pt-3 pb-4 sm:pt-5 sm:pb-6">
                        <Upload className="w-6 h-6 sm:w-8 sm:h-8 mb-2 sm:mb-4 text-muted-foreground" />
                        <p className="mb-1 sm:mb-2 text-xs sm:text-sm text-muted-foreground">
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

                {/* Is Live */}
                <div>
                  <Label className="text-sm font-medium text-card-foreground">Product Status</Label>
                  <div className="mt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isLive"
                        checked={formData.isLive}
                        onCheckedChange={(checked) => handleInputChange('isLive', checked as boolean)}
                      />
                      <Label htmlFor="isLive" className="text-sm text-muted-foreground">
                        Product is live/active
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2 rounded"
                    disabled={isCreatingProduct || isUploading || !formData.name || !formData.description || !formData.pageId}
                  >
                    {isCreatingProduct ? 'Creating product...' : 'Create product'}
                  </Button>
                </div>
              </form>
            </div>

            {/* Product Preview Section - Hidden on mobile */}
            <div className="hidden lg:block bg-card rounded-lg shadow-sm border border-border p-6 h-[fit-content] sticky top-20">
              <ProductPreview formData={formData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductSetup
