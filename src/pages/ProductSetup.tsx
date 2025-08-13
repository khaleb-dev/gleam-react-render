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
import { useNavigate } from 'react-router-dom'

const ProductSetup = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    percentage: 0,
    isLive: false,
    logo: '',
    pageId: ''
  })

  const { uploadFile, isUploading } = useSingleFileUpload()
  const { mutate: createProduct, isPending: isCreatingProduct } = useCreateProduct()
  const { data: userPages, isLoading: isLoadingPages } = useUserPages()
  const navigate = useNavigate()

  const handleInputChange = (field: string, value: string | boolean | number) => {
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
      percentage: formData.percentage,
      is_live: formData.isLive,
      logo: formData.logo
    }

    createProduct(payload, {
      onSuccess: (response) => {
        console.log('Product created successfully:', response)
        toast.success('Product created successfully!')
        navigate('/feed')
      },
      onError: (error) => {
        console.error('Failed to create product:', error)
      }
    })
  }

  const userPagesData = userPages?.data?.pages || []

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-light text-gray-800">
                Let's create your product.
              </h1>
            </div>
            <p className="text-sm text-gray-500 ml-15">
              <span className="text-red-500">*</span> indicates required
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Company/Page Selection */}
                <div>
                  <Label htmlFor="pageId" className="text-sm font-medium text-gray-700">
                    Select Company Page<span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.pageId} onValueChange={(value) => handleInputChange('pageId', value)} required>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select a company page" />
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
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                    Product Name<span className="text-red-500">*</span>
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
                  <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                    Description<span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your product"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="mt-1"
                    rows={4}
                    required
                  />
                </div>

                {/* Percentage */}
                <div>
                  <Label htmlFor="percentage" className="text-sm font-medium text-gray-700">
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
                  <p className="text-xs text-gray-500 mt-1">
                    How complete is your product? (0-100%)
                  </p>
                </div>

                {/* Logo Upload */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">Product Logo</Label>
                  <div className="mt-1">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-4 text-gray-500" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Choose file</span>
                        </p>
                        <p className="text-xs text-gray-500">Upload to see preview</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/jpeg,image/jpg,image/png"
                        onChange={handleLogoUpload}
                        disabled={isUploading}
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      300 x 300px recommended. JPGs, JPEGs, and PNGs supported.
                    </p>
                  </div>
                </div>

                {/* Is Live */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">Product Status</Label>
                  <div className="mt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isLive"
                        checked={formData.isLive}
                        onCheckedChange={(checked) => handleInputChange('isLive', checked as boolean)}
                      />
                      <Label htmlFor="isLive" className="text-sm text-gray-600">
                        Product is live/active
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    className="bg-primary text-white hover:bg-primary/90 px-6 py-2 rounded"
                    disabled={isCreatingProduct || isUploading || !formData.name || !formData.description || !formData.pageId}
                  >
                    {isCreatingProduct ? 'Creating product...' : 'Create product'}
                  </Button>
                </div>
              </form>
            </div>

            {/* Product Preview Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-[fit-content] sticky top-20">
              <ProductPreview formData={formData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductSetup