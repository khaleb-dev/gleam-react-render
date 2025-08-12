
import React from 'react';
import { useParams } from 'react-router-dom';
import { Building2, Users, Globe, Calendar, Camera, MapPin, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useCompanyPageData } from '@/hooks/useCompanyPageData';
import { toast } from 'sonner';
import { FeedCard } from '@/components/feed/FeedCard';

// Mock products data with images
const mockProducts = [
  {
    _id: "689afa289cb6d83447161f1b",
    page_id: "6898c2362ea5da920c341732",
    name: "Chat System",
    description: "A private chat system for secure communication",
    percentage: 75,
    logo: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=100&h=100&fit=crop&crop=center",
    is_live: true,
    createdAt: "2025-08-12T08:24:08.247Z",
    updatedAt: "2025-08-12T08:24:08.247Z",
    __v: 0
  },
  {
    _id: "689afa289cb6d83447161f2b",
    page_id: "6898c2362ea5da920c341732",
    name: "Analytics Dashboard",
    description: "Real-time analytics and reporting platform",
    percentage: 90,
    logo: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&h=100&fit=crop&crop=center",
    is_live: true,
    createdAt: "2025-08-11T08:24:08.247Z",
    updatedAt: "2025-08-11T08:24:08.247Z",
    __v: 0
  },
  {
    _id: "689afa289cb6d83447161f3c",
    page_id: "6898c2362ea5da920c341732",
    name: "Mobile App",
    description: "Cross-platform mobile application",
    percentage: 30,
    logo: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=100&h=100&fit=crop&crop=center",
    is_live: false,
    createdAt: "2025-08-10T08:24:08.247Z",
    updatedAt: "2025-08-10T08:24:08.247Z",
    __v: 0
  }
];

// Mock posts data for feed
const mockPosts = [
  {
    _id: "post1",
    user_id: "company_user_1",
    title: "New Product Launch",
    description: "We're excited to announce our latest product update! 🚀 Our team has been working hard to bring you new features.",
    images: ["https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&h=300&fit=crop"],
    videos: [],
    category: "announcement",
    tags: ["product", "launch", "update"],
    total_score: 245,
    comments_count: 12,
    is_active: true,
    created_at: "2025-08-12T10:30:00.000Z",
    updated_at: "2025-08-12T10:30:00.000Z",
    __v: 0,
    user: {
      profile_avatar: null,
      first_name: "Tech",
      last_name: "Company",
      email: "admin@techcompany.com",
      is_vetted: true,
      responder_info: {
        job_title: "Company Admin",
        years_of_experience: 5,
        skills: ["Leadership", "Product Management"],
        rank_status: {
          _id: "rank1",
          rank_name: "platinum",
          rank_color: "#e5e7eb",
          min_tasks_completed: 100,
          min_rating: 4.5,
          __v: 0,
          createdAt: "2025-01-01T00:00:00.000Z",
          updatedAt: "2025-01-01T00:00:00.000Z"
        },
        availability_status: "available"
      }
    },
    has_scored: false,
    people_score_count: 42
  }
];

const ProgressCircle = ({ percentage, size = 60 }: { percentage: number; size?: number }) => {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(var(--muted))"
          strokeWidth="4"
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(var(--primary))"
          strokeWidth="4"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-semibold">{percentage}%</span>
      </div>
    </div>
  );
};

const CompanyProfile = () => {
  const { identifier } = useParams<{ identifier: string }>();
  const [postContent, setPostContent] = React.useState('');

  const { data, isLoading, error } = useCompanyPageData(identifier || '');

  if (!identifier) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Company Not Found</h1>
          <p className="text-muted-foreground">No company identifier provided.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="max-w-6xl mx-auto px-4">
          <Skeleton className="w-full h-48" />
          <div className="flex gap-6 mt-4">
            <Skeleton className="w-72 h-96" />
            <Skeleton className="flex-1 h-96" />
            <Skeleton className="w-72 h-96" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Company Not Found</h1>
          <p className="text-muted-foreground">The company you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  const companyData = data.data;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handlePostSubmit = () => {
    if (!postContent.trim()) return;
    toast.success('Post created successfully!');
    setPostContent('');
  };

  return (
    <div className="min-h-screen">
      {/* Header Banner */}
      <Card className="border-none rounded-none shadow-none">
        <div className="relative">
          <div className="w-full h-48 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute top-4 right-4">
              <Button variant="secondary" size="sm">
                <Camera className="w-4 h-4 mr-2" />
                Edit Cover
              </Button>
            </div>
            
            {/* Company Logo - Positioned at bottom of cover */}
            <div className="absolute bottom-4 left-6">
              <div className="w-24 h-24 rounded-lg border-4 border-white shadow-lg overflow-hidden bg-card">
                {companyData.logo ? (
                  <img 
                    src={companyData.logo} 
                    alt={companyData.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <Building2 className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Company Info in Header */}
          <CardContent className="pt-6 pb-4 px-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold mb-1">{companyData.name}</h1>
                <p className="text-muted-foreground mb-2">@{companyData.company_url}</p>
                <p className="mb-3">{companyData.tag_line}</p>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <LinkIcon className="w-4 h-4" />
                    <a 
                      href={companyData.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {companyData.website}
                    </a>
                  </div>
                </div>

                <div className="flex gap-4 text-sm">
                  <span><strong>1.2K</strong> <span className="text-muted-foreground">Following</span></span>
                  <span><strong>5.8K</strong> <span className="text-muted-foreground">Followers</span></span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" className="rounded-full px-6">
                  Message
                </Button>
                <Button className="rounded-full px-6">
                  Follow
                </Button>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex gap-6 mt-6">
          
          {/* Left Sidebar */}
          <div className="w-72 space-y-6">
            {/* About Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">About</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{companyData.tag_line}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{companyData.industry}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{companyData.size} employees</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Products Section - Redesigned */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Products</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockProducts.map((product) => (
                  <div key={product._id} className="group">
                    <div className="flex items-start gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted">
                          <img 
                            src={product.logo} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-card ${product.is_live ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-sm truncate">{product.name}</h4>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">{product.percentage}%</span>
                            <ProgressCircle percentage={product.percentage} size={32} />
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{product.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Team Members */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Team</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {companyData.members.slice(0, 5).map((member) => (
                  <div key={member._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src="" />
                      <AvatarFallback>
                        {member.user_id.first_name[0]}{member.user_id.last_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">
                        {member.user_id.first_name} {member.user_id.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {member.role_id.role_name.replace(/_/g, ' ')}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-xs">
                      View
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Middle Feed */}
          <div className="flex-1 space-y-6">
            {/* Create Post - Using Feed Style */}
            <Card>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={companyData.logo} />
                    <AvatarFallback>
                      <Building2 className="w-6 h-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Textarea
                      placeholder={`What's happening at ${companyData.name}?`}
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      className="min-h-[120px] resize-none border-0 shadow-none focus-visible:ring-0 text-base placeholder:text-base p-0"
                    />
                    <div className="flex justify-between items-center mt-4 pt-4 border-t">
                      <div className="flex gap-3">
                        <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
                          <Camera className="w-5 h-5" />
                        </Button>
                      </div>
                      <Button 
                        onClick={handlePostSubmit} 
                        disabled={!postContent.trim()}
                        className="rounded-full px-8"
                      >
                        Post
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Company About Description */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">About {companyData.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {companyData.tag_line}
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-card-foreground">Industry:</span>
                      <p className="text-muted-foreground">{companyData.industry}</p>
                    </div>
                    <div>
                      <span className="font-medium text-card-foreground">Company Size:</span>
                      <p className="text-muted-foreground">{companyData.size} employees</p>
                    </div>
                    <div>
                      <span className="font-medium text-card-foreground">Website:</span>
                      <a 
                        href={companyData.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline block"
                      >
                        {companyData.website}
                      </a>
                    </div>
                    <div>
                      <span className="font-medium text-card-foreground">Founded:</span>
                      <p className="text-muted-foreground">{formatDate(companyData.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Posts Feed */}
            <div className="space-y-0">
              {mockPosts.map((post) => (
                <FeedCard
                  key={post._id}
                  post={post}
                  onLike={() => {}}
                  onUnlike={() => {}}
                  onComment={() => {}}
                  onDeleteComment={() => {}}
                  onDeletePost={() => {}}
                />
              ))}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-72 space-y-6">
            {/* Company Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Company Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Posts</span>
                  <span className="text-sm font-medium">142</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Products</span>
                  <span className="text-sm font-medium">{mockProducts.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Team Members</span>
                  <span className="text-sm font-medium">{companyData.members.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Score</span>
                  <span className="text-sm font-medium">12.5K</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile;
