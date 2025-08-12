

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2, Package, Monitor, Smartphone } from "lucide-react"
import { useNavigate } from "react-router-dom"

const Company = () => {
  const navigate = useNavigate()
  
  const pageTypes = [
    {
      icon: <Building2 className="h-12 w-12 text-primary" />,
      title: "Company / Business",
      description: "Small, medium, and large businesses",
      action: () => navigate("/new/company/setup")
    },
    {
      icon: <Package className="h-12 w-12 text-primary" />,
      title: "Product",
      description: "What new product is your company working on",
      action: () => navigate("/new/company/product/setup")
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-light text-gray-800 mb-4">What would you be creating today?</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Create a page to showcase your brand, or add a product under your page to share with the world.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Page type cards */}
            <div className="space-y-4">
              {pageTypes.map((pageType, index) => (
                <Card
                  key={index}
                  className="hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-200 bg-white hover:border-primary/30"
                  onClick={pageType.action}
                >
                  <CardHeader className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">{pageType.icon}</div>
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold text-gray-800 mb-1">{pageType.title}</CardTitle>
                        <CardDescription className="text-sm text-gray-600">{pageType.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>

            {/* Right side - Visual representation */}
            <div className="flex justify-center items-center">
              <div className="relative">
                {/* Desktop mockup */}
                <div className="bg-gray-800 rounded-lg p-3 shadow-2xl">
                  <div className="bg-white rounded-md p-4 w-80 h-48">

                    <div className="bg-primary h-8 rounded mb-3 flex items-center justify-center">
                      <div className="text-white text-xs font-semibold">Your Page</div>
                    </div>
                    <div className="space-y-2">
                      <div className="bg-gray-200 h-3 rounded w-3/4"></div>
                      <div className="bg-gray-200 h-3 rounded w-1/2"></div>
                      <div className="bg-gray-200 h-3 rounded w-2/3"></div>
                    </div>
                    <div className="mt-4 flex space-x-2">
                      <div className="bg-primary/10 p-2 rounded flex-1 text-center">
                        <Building2 className="h-4 w-4 text-primary mx-auto" />
                      </div>
                      <div className="bg-primary/10 p-2 rounded flex-1 text-center">
                        <Package className="h-4 w-4 text-primary mx-auto" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mobile mockup */}
                <div className="absolute -bottom-4 -right-8 bg-gray-800 rounded-lg p-2 shadow-xl">
                  <div className="bg-white rounded-md p-2 w-20 h-32">
                    <div className="bg-primary h-4 rounded mb-2"></div>
                    <div className="space-y-1">
                      <div className="bg-gray-200 h-1 rounded w-full"></div>
                      <div className="bg-gray-200 h-1 rounded w-3/4"></div>
                      <div className="bg-gray-200 h-1 rounded w-1/2"></div>
                    </div>
                    <div className="mt-2 flex space-x-1">
                      <div className="bg-primary/10 p-1 rounded flex-1 flex justify-center">
                        <Monitor className="h-2 w-2 text-primary" />
                      </div>
                      <div className="bg-primary/10 p-1 rounded flex-1 flex justify-center">
                        <Smartphone className="h-2 w-2 text-primary" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Company
