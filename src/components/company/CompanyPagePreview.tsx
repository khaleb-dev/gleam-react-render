
import React from 'react'
import { Building2, HelpCircle, Users, Plus, ExternalLink, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FormData {
  name: string
  beembyteUrl: string
  website: string
  industry: string
  organizationSize: string
  tagline: string
  logo: string
  agreedToTerms: boolean
}

interface CompanyPagePreviewProps {
  formData: FormData
}

export const CompanyPagePreview: React.FC<CompanyPagePreviewProps> = ({ formData }) => {
  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-lg font-semibold text-gray-800">Live Preview</span>
        <HelpCircle className="w-5 h-5 text-gray-400" />
      </div>

      {/* Modern Card Layout */}
      <div className="bg-white rounded-xl overflow-hidden shadow-xl border border-gray-100">
        {/* Minimal Header Bar */}
        <div className="h-2 bg-gradient-to-r from-primary via-primary/80 to-accent"></div>

        {/* Content */}
        <div className="p-8">
          {/* Logo and Company Info in modern layout */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm">
              {formData.logo ? (
                <img 
                  src={formData.logo} 
                  alt="Company logo" 
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <Building2 className="w-10 h-10 text-gray-400" />
              )}
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {formData.name || 'Your Company Name'}
            </h2>

            {formData.beembyteUrl && (
              <p className="text-sm text-gray-500 mb-2">
                beembyte.com/company/{formData.beembyteUrl}
              </p>
            )}
            
            {formData.tagline && (
              <p className="text-gray-600 mb-4 max-w-sm mx-auto leading-relaxed">
                {formData.tagline}
              </p>
            )}
            
            <div className="flex items-center justify-center gap-4 text-sm text-gray-500 mb-6 flex-wrap">
              {formData.industry && (
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-md font-medium">
                  {formData.industry}
                </span>
              )}
              {formData.organizationSize && (
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>Company size</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons - All in one line */}
          <div className="flex gap-3 justify-center items-center">
            {formData.website && (
              <Button
                variant="outline"
                className="px-4 py-2 rounded-lg font-medium border-2 hover:bg-gray-50 transition-all"
                onClick={() => window.open(formData.website, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Visit Website
              </Button>
            )}
            
            <Button className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Follow
            </Button>
            
            <button className="p-3 text-gray-600 hover:text-primary transition-colors">
              <Mail className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
