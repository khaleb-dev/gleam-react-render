import React from 'react'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Package } from 'lucide-react'

interface FormData {
  name: string
  description: string
  percentage: number
  isLive: boolean
  logo: string
  pageId: string
}

interface ProductPreviewProps {
  formData: FormData
}

export const ProductPreview: React.FC<ProductPreviewProps> = ({ formData }) => {
  return (
    <div>
      <h3 className="text-lg font-semibold text-card-foreground mb-4">Product Preview</h3>

      <Card className="border border-border">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              {formData.logo ? (
                <AvatarImage
                  src={formData.logo}
                  alt={formData.name || 'Product logo'}
                  className="object-cover"
                />
              ) : (
                <AvatarFallback className="bg-primary/10">
                  <Package className="h-8 w-8 text-primary" />
                </AvatarFallback>
              )}
            </Avatar>

            <div className="flex-1">
              <h4 className="text-lg font-semibold text-card-foreground">
                {formData.name || 'Product Name'}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={formData.isLive ? "default" : "secondary"} className="text-xs">
                  {formData.isLive ? 'Live' : 'In Development'}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {/* Description */}
            <div>
              <p className="text-sm text-muted-foreground">
                {formData.description || 'Product description will appear here...'}
              </p>
            </div>

            {/* Progress */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-card-foreground">Progress</span>
                <span className="text-sm text-muted-foreground">{formData.percentage}%</span>
              </div>
              <Progress value={formData.percentage} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  )
}