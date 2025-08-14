import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Building2, Users, Globe, Calendar, Camera, MapPin, Link as LinkIcon, ExternalLink, Plus, MessageCircle, Settings, Edit, Save, X, Search, UserMinus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useCompanyPageData } from '@/hooks/useCompanyPageData';
import { useProducts } from '@/hooks/useProducts';
import { toast } from 'sonner';
import { FeedCard } from '@/components/feed/FeedCard';
import { CreatePostCard } from '@/components/feed/CreatePostCard';
import { userApiService, type SearchUser } from '@/services/userApi';
import { useUpdateCompanyPage } from '@/hooks/useUpdateCompanyPage';
import { useSingleFileUpload } from '@/hooks/useSingleFileUpload';
import { useCompanyPageStats } from '@/hooks/useCompanyPageStats';
import { useFollowStatus, useFollowCompanyPage, useUnfollowCompanyPage } from '@/hooks/useCompanyPageFollow';

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
      first_name: "Myaza",
      last_name: "",
      email: "admin@techcompany.com",
      is_vetted: true,
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
  const navigate = useNavigate();
  const [postContent, setPostContent] = React.useState('');
  const [isEditing, setIsEditing] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('feed');
  const [editedData, setEditedData] = React.useState({
    name: '',
    tag_line: '',
    website: '',
    industry: '',
    industry_type: '',
    size: '',
    about: ''
  });
  const [logoFile, setLogoFile] = React.useState<File | null>(null);
  const [coverFile, setCoverFile] = React.useState<File | null>(null);
  const [logoPreview, setLogoPreview] = React.useState<string>('');
  const [coverPreview, setCoverPreview] = React.useState<string>('');
  const [inviteModalOpen, setInviteModalOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedUsers, setSelectedUsers] = React.useState<SearchUser[]>([]);
  const [searchUsers, setSearchUsers] = React.useState<SearchUser[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);

  const { data, isLoading, error } = useCompanyPageData(identifier || '');
  const companyData = data?.data;

  const { data: productsData, isLoading: isLoadingProducts } = useProducts(companyData?._id || '');
  const products = productsData?.data?.products || [];

  const { data: companyStats, isLoading: isLoadingStats } = useCompanyPageStats(companyData?._id || '');
  const stats = companyStats?.data;

  // Follow functionality hooks
  const { data: followStatusData, isLoading: isLoadingFollowStatus } = useFollowStatus(companyData?._id || '');
  const isFollowing = followStatusData?.data?.isFollowing || false;
  const followMutation = useFollowCompanyPage();
  const unfollowMutation = useUnfollowCompanyPage();

  const updateCompanyPage = useUpdateCompanyPage();
  const { uploadFile, isUploading } = useSingleFileUpload();

  // Search users using API
  const searchUsersApi = async (query: string) => {
    if (!query.trim()) {
      setSearchUsers([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await userApiService.searchUsers(query);
      if (response.success) {
        setSearchUsers(response.data);
      }
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Failed to search users');
    } finally {
      setIsSearching(false);
    }
  };

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        searchUsersApi(searchQuery);
      } else {
        setSearchUsers([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Initialize edited data when company data loads
  React.useEffect(() => {
    if (companyData) {
      setEditedData({
        name: companyData.name || '',
        tag_line: companyData.tag_line || '',
        website: companyData.website || '',
        industry: companyData.industry || '',
        industry_type: companyData.industry_type || '',
        size: companyData.size || '',
        about: companyData.about || ''
      });
      setLogoPreview(companyData.logo || '');
      setCoverPreview(companyData.cover_logo || '');
    }
  }, [companyData]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (isEditing) {
      // Reset to original data if canceling
      setEditedData({
        name: companyData?.name || '',
        tag_line: companyData?.tag_line || '',
        website: companyData?.website || '',
        industry: companyData?.industry || '',
        industry_type: companyData?.industry_type || '',
        size: companyData?.size || '',
        about: companyData?.about || ''
      });
      setLogoFile(null);
      setCoverFile(null);
      setLogoPreview(companyData?.logo || '');
      setCoverPreview(companyData?.cover_logo || '');
    }
  };

  const handleSaveChanges = async () => {
    if (!companyData?._id) return;

    try {
      const updateData: any = { ...editedData };

      // Upload logo if new file selected
      if (logoFile) {
        const logoUrl = await uploadFile(logoFile);
        if (logoUrl) {
          updateData.logo = logoUrl;
        }
      }

      // Upload cover if new file selected
      if (coverFile) {
        const coverUrl = await uploadFile(coverFile);
        if (coverUrl) {
          updateData.cover_logo = coverUrl;
        }
      }

      await updateCompanyPage.mutateAsync({
        pageId: companyData._id,
        data: updateData
      });

      toast.success('Company profile updated successfully!');
      setIsEditing(false);
      setLogoFile(null);
      setCoverFile(null);
    } catch (error) {
      console.error('Error updating company profile:', error);
      toast.error('Failed to update company profile');
    }
  };

  const toggleUserSelection = (user: SearchUser) => {
    setSelectedUsers(prev => {
      const isSelected = prev.some(u => u._id === user._id);
      if (isSelected) {
        return prev.filter(u => u._id !== user._id);
      } else {
        return [...prev, user];
      }
    });
  };

  const handleInviteUsers = async () => {
    try {
      // Here you would make an API call to invite users
      toast.success(`Invited ${selectedUsers.length} user(s) successfully!`);
      setInviteModalOpen(false);
      setSelectedUsers([]);
      setSearchQuery('');
    } catch (error) {
      toast.error('Failed to invite users');
    }
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setCoverPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getDefaultCoverImage = () => {
    return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDgwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJncmFkaWVudCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6aHNsKDIyMCwgOCUsIDk1JSk7c3RvcC1vcGFjaXR5OjEiIC8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjpoc2woMjIwLCAxNCUsIDkxJSk7c3RvcC1vcGFjaXR5OjEiIC8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjgwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9InVybCgjZ3JhZGllbnQpIi8+PC9zdmc+";
  };

  const navigateMemberProfile = async (user_id: string) => {
    navigate(`/profile/${user_id}`)
  }

  const handleFollowToggle = async () => {
    if (!companyData?._id) return;

    try {
      if (isFollowing) {
        await unfollowMutation.mutateAsync(companyData._id);
      } else {
        await followMutation.mutateAsync(companyData._id);
      }
    } catch (error) {
      console.error('Error toggling follow status:', error);
    }
  };

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handlePostSubmit = async (postData: any) => {
    try {
      toast.success('Post created successfully!');
      setPostContent('');
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header Banner */}
      <Card className="border-none rounded-none shadow-none bg-card">
        <div className="relative">
          <div className="w-full h-48 relative overflow-hidden border-b bg-cover bg-center" style={{ backgroundImage: `url(${coverPreview || companyData.cover_logo || getDefaultCoverImage()})` }}>
            <div className="absolute inset-0 bg-black/20"></div>
            {isEditing && (
              <div className="absolute top-4 right-4 z-9">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverFileChange}
                  className="hidden"
                  id="cover-upload"
                />
                <Button variant="secondary" size="sm" asChild>
                  <label htmlFor="cover-upload" className="cursor-pointer">
                    <Camera className="w-4 h-4 mr-2" />
                    Edit Cover
                  </label>
                </Button>
              </div>
            )}
          </div>

          {/* Company Logo - Positioned below the cover area */}
          <div className="absolute top-[150px] left-8 z-9">
            <div className="w-24 h-24 rounded-lg border-4 border-white shadow-lg overflow-hidden bg-card relative group">
              {logoPreview || companyData.logo ? (
                <img
                  src={logoPreview || companyData.logo}
                  alt={companyData.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <Building2 className="w-12 h-12 text-muted-foreground" />
                </div>
              )}
              {isEditing && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoFileChange}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label htmlFor="logo-upload" className="cursor-pointer">
                    <Camera className="w-6 h-6 text-white" />
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Company Info in Header - Moved right */}
          <CardContent className="pt-10 pb-4 px-8 ml-24">
            <div className="flex justify-between items-start">
              <div className='ml-5 mt-[-30px]'>
                {isEditing ? (
                  <Input
                    value={editedData.name}
                    onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
                    className="text-3xl font-bold mb-1 border border-border/50 shadow-none bg-transparent p-2 h-auto rounded-md"
                  />
                ) : (
                  <h1 className="text-3xl font-bold mb-1">{companyData.name}</h1>
                )}
                <p className="text-muted-foreground mb-2">@{companyData.company_url}</p>
                {isEditing ? (
                  <Input
                    value={editedData.tag_line}
                    onChange={(e) => setEditedData({ ...editedData, tag_line: e.target.value })}
                    className="mb-3 border border-border/50 shadow-none bg-transparent p-2 h-auto rounded-md"
                  />
                ) : (
                  <p className="mb-3">{companyData.tag_line}</p>
                )}

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <LinkIcon className="w-4 h-4" />
                    {isEditing ? (
                      <Input
                        value={editedData.website}
                        onChange={(e) => setEditedData({ ...editedData, website: e.target.value })}
                        className="text-primary border border-border/50 shadow-none bg-transparent p-1 h-auto rounded-md"
                      />
                    ) : (
                      <a
                        href={companyData.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {companyData.website}
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex gap-4 text-sm">
                  <span><strong>{stats?.total_score || 0}</strong> <span className="text-muted-foreground">Score</span></span>
                  <span><strong>{companyData.followersCount || 0}</strong> <span className="text-muted-foreground">Followers</span></span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full px-4 border-primary text-primary bg-white hover:bg-primary hover:text-white"
                >
                  <MessageCircle className="w-3 h-3 mr-1" />
                  Message
                </Button>
                
                {/* Follow/Unfollow Button */}
                <Button 
                  size="sm"
                  className="rounded-full px-4"
                  onClick={handleFollowToggle}
                  disabled={isLoadingFollowStatus || followMutation.isPending || unfollowMutation.isPending}
                >
                  {followMutation.isPending || unfollowMutation.isPending ? (
                    <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-1" />
                  ) : isFollowing ? (
                    <UserMinus className="w-3 h-3 mr-1" />
                  ) : (
                    <Plus className="w-3 h-3 mr-1" />
                  )}
                  {isFollowing ? 'Unfollow' : 'Follow'}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={isEditing ? handleSaveChanges : handleEditToggle}
                  className="rounded-full"
                  disabled={isUploading || updateCompanyPage.isPending}
                >
                  {isUploading || updateCompanyPage.isPending ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : isEditing ? (
                    <Save className="w-4 h-4" />
                  ) : (
                    <Settings className="w-4 h-4" />
                  )}
                </Button>
                {isEditing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleEditToggle}
                    className="rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </div>
      </Card>

      {/* Navigation Tabs */}
      <div className="bg-white border-b shadow-sm">
        <div className="flex items-center justify-center gap-8 py-2">
          <button 
            onClick={() => setActiveTab('feed')}
            className={`px-6 py-3 text-sm font-medium transition-all ${
              activeTab === 'feed' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Feed
          </button>
          <button 
            onClick={() => setActiveTab('members')}
            className={`px-6 py-3 text-sm font-medium transition-all ${
              activeTab === 'members' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Members
          </button>
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`px-6 py-3 text-sm font-medium transition-all ${
              activeTab === 'analytics' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Analytics
          </button>
          <button 
            onClick={() => setActiveTab('products')}
            className={`px-6 py-3 text-sm font-medium transition-all ${
              activeTab === 'products' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Products
          </button>
          <button 
            onClick={() => setActiveTab('activities')}
            className={`px-6 py-3 text-sm font-medium transition-all ${
              activeTab === 'activities' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Activities
          </button>
          <button 
            onClick={() => setActiveTab('jobs')}
            className={`px-6 py-3 text-sm font-medium transition-all ${
              activeTab === 'jobs' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Jobs
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto">
        {activeTab === 'feed' ? (
          <div className="flex gap-6 mt-6">
            {/* Left Sidebar */}
            <div className="w-[25%] space-y-6">
              {/* About Section */}
              <Card>
                <CardContent className="space-y-4 pt-6">
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      {isEditing ? (
                        <Input
                          value={editedData.industry}
                          onChange={(e) => setEditedData({ ...editedData, industry: e.target.value })}
                          placeholder="Industry type"
                          className="text-sm border border-border/50 bg-transparent p-1 h-auto rounded-md"
                        />
                      ) : (
                        <span className="text-sm">{companyData.industry}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      {isEditing ? (
                        <Input
                          value={editedData.size}
                          onChange={(e) => setEditedData({ ...editedData, size: e.target.value })}
                          placeholder="Company size"
                          className="text-sm border border-border/50 bg-transparent p-1 h-auto rounded-md"
                        />
                      ) : (
                        <span className="text-sm">{companyData.size} employees</span>
                      )}
                    </div>
                    {isEditing && (
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        <Input
                          value={editedData.industry_type}
                          onChange={(e) => setEditedData({ ...editedData, industry_type: e.target.value })}
                          placeholder="Industry type (e.g., private company)"
                          className="text-sm border border-border/50 bg-transparent p-1 h-auto rounded-md"
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Products Section - Redesigned */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Products</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/new/company/product/setup?companyId=${companyData._id}&companyName=${encodeURIComponent(companyData.name)}&companyUrl=${companyData.company_url}`)}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {isLoadingProducts ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : products.length > 0 ? (
                    products.map((product) => (
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
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-sm truncate">{product.name}</h4>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">{product.percentage}%</span>
                                <ProgressCircle percentage={product.percentage} size={32} />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground">No products found</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Team Members */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Members</CardTitle>
                    <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Invite Members</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              placeholder="Search users..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="pl-10"
                            />
                          </div>

                          <div className="max-h-60 overflow-y-auto space-y-2">
                            {isSearching ? (
                              <div className="flex items-center justify-center py-8">
                                <div className="text-sm text-muted-foreground">Searching...</div>
                              </div>
                            ) : searchUsers.length === 0 && searchQuery ? (
                              <div className="flex items-center justify-center py-8">
                                <div className="text-sm text-muted-foreground">No users found</div>
                              </div>
                            ) : (
                              searchUsers.map((user) => {
                              const isSelected = selectedUsers.some(u => u._id === user._id);
                              return (
                                <div
                                  key={user._id}
                                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${isSelected ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'
                                    }`}
                                  onClick={() => toggleUserSelection(user)}
                                >
                                  <Avatar className="w-10 h-10">
                                    <AvatarImage src={user.profile_avatar || ''} />
                                    <AvatarFallback>
                                      {user.first_name[0]}{user.last_name[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm">
                                      {user.first_name} {user.last_name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {user.email}
                                    </p>
                                  </div>
                                  {isSelected && (
                                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                      <Plus className="w-3 h-3 text-primary-foreground rotate-45" />
                                    </div>
                                  )}
                                </div>
                              );
                            })
                            )}
                          </div>

                          {selectedUsers.length > 0 && (
                            <div className="flex items-center justify-between pt-4 border-t">
                              <span className="text-sm text-muted-foreground">
                                {selectedUsers.length} user(s) selected
                              </span>
                              <Button onClick={handleInviteUsers}>
                                Invite Selected
                              </Button>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {companyData.members.slice(0, 5).map((member) => (
                    <div key={member._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={(e) => navigateMemberProfile(member.user_id._id)}
                    >
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
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Middle Feed */}
            <div className="flex-1 space-y-6">
              {/* Create Post - Using CreatePostCard Component */}
              <CreatePostCard
                user={{
                  ...companyData.admin_id,
                  profile_avatar: companyData.logo,
                  user_id: companyData.admin_id._id,
                  role: 'admin'
                } as any}
                onPostCreate={handlePostSubmit}
              />

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
                    {isEditing ? (
                      <Textarea
                        value={editedData.about}
                        onChange={(e) => setEditedData({ ...editedData, about: e.target.value })}
                        className="text-sm border border-border/50 bg-transparent p-3 rounded-md resize-none"
                        rows={4}
                        placeholder="Describe your company..."
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {companyData.about || 'No description available.'}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Posts Feed */}
              <div className="space-y-0">
                {mockPosts.map((post) => (
                  <FeedCard
                    key={post._id}
                    post={post}
                    onLike={() => { }}
                    onUnlike={() => { }}
                    onComment={() => { }}
                    onDeleteComment={() => { }}
                    onDeletePost={() => { }}
                  />
                ))}
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="w-[25%] space-y-6">
              {/* Company Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Company Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Posts</span>
                    {isLoadingStats ? (
                      <div className="h-4 w-8 bg-muted rounded animate-pulse"></div>
                    ) : (
                      <span className="text-sm font-medium">{stats?.posts || 0}</span>
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Products</span>
                    {isLoadingStats ? (
                      <div className="h-4 w-8 bg-muted rounded animate-pulse"></div>
                    ) : (
                      <span className="text-sm font-medium">{stats?.products || 0}</span>
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Team Members</span>
                    {isLoadingStats ? (
                      <div className="h-4 w-8 bg-muted rounded animate-pulse"></div>
                    ) : (
                      <span className="text-sm font-medium">{stats?.team_members || 0}</span>
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Score</span>
                    {isLoadingStats ? (
                      <div className="h-4 w-8 bg-muted rounded animate-pulse"></div>
                    ) : (
                      <span className="text-sm font-medium">{stats?.total_score || 0}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="w-full px-6 py-8">
            <Card className="max-w-6xl mx-auto">
              <CardContent className="p-8">
                {activeTab === 'members' && (
                  <div>
                    <div className="flex justify-end items-center mb-6">
                      <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm" className="flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            Add Members
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
                          <DialogHeader>
                            <DialogTitle>Add Team Members</DialogTitle>
                          </DialogHeader>
                          <div className="flex-1 overflow-hidden flex space-x-6">
                            {/* Left side - User search */}
                            <div className="flex-1 flex flex-col space-y-4">
                              <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                  placeholder="Search users..."
                                  value={searchQuery}
                                  onChange={(e) => setSearchQuery(e.target.value)}
                                  className="pl-10"
                                />
                              </div>

                              <div className="flex-1 overflow-y-auto space-y-3">
                                {isSearching ? (
                                  <div className="flex items-center justify-center py-8">
                                    <div className="text-sm text-muted-foreground">Searching...</div>
                                  </div>
                                ) : searchUsers.length === 0 && searchQuery ? (
                                  <div className="flex items-center justify-center py-8">
                                    <div className="text-sm text-muted-foreground">No users found</div>
                                  </div>
                                ) : (
                                  searchUsers.map((user) => {
                                    const isSelected = selectedUsers.some(u => u._id === user._id);
                                    return (
                                      <div
                                        key={user._id}
                                        className={`flex items-center gap-4 p-3 rounded-lg border cursor-pointer transition-colors ${isSelected ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'
                                          }`}
                                        onClick={() => toggleUserSelection(user)}
                                      >
                                        <Avatar className="w-10 h-10">
                                          <AvatarImage src={user.profile_avatar || ''} />
                                          <AvatarFallback>
                                            {user.first_name[0]}{user.last_name[0]}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                          <p className="font-medium text-sm">
                                            {user.first_name} {user.last_name}
                                          </p>
                                          <p className="text-xs text-muted-foreground">
                                            @{user.email.split('@')[0]}
                                          </p>
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'bg-primary border-primary' : 'border-muted-foreground'}`}>
                                          {isSelected && <Plus className="w-3 h-3 text-primary-foreground rotate-45" />}
                                        </div>
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            </div>

                            {/* Right side - Selected users and roles */}
                            {selectedUsers.length > 0 && (
                              <div className="w-80 border-l pl-6 flex flex-col space-y-4">
                                <h3 className="font-semibold">Selected Members ({selectedUsers.length})</h3>
                                <div className="flex-1 overflow-y-auto space-y-3">
                                  {selectedUsers.map((user) => (
                                    <div key={user._id} className="p-3 rounded-lg border bg-muted/30 space-y-3">
                                      <div className="flex items-center gap-3">
                                        <Avatar className="w-8 h-8">
                                          <AvatarImage src={user.profile_avatar || ''} />
                                          <AvatarFallback className="text-xs">
                                            {user.first_name[0]}{user.last_name[0]}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                          <p className="font-medium text-xs">
                                            {user.first_name} {user.last_name}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="space-y-2">
                                        <label className="text-xs font-medium">Role:</label>
                                        <select 
                                          className="w-full px-2 py-1 border rounded text-xs"
                                          defaultValue="member"
                                          onChange={(e) => {
                                            const updatedUsers = selectedUsers.map(u => 
                                              u._id === user._id ? { ...u, selectedRole: e.target.value } : u
                                            );
                                            setSelectedUsers(updatedUsers as any);
                                          }}
                                        >
                                          <option value="member">Member</option>
                                          <option value="admin">Admin</option>
                                          <option value="manager">Manager</option>
                                        </select>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <Button onClick={handleInviteUsers} className="w-full">
                                  Add Selected Members
                                </Button>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {companyData.members.map((member) => (
                        <Card key={member._id} className="p-4 hover:shadow-md transition-all duration-300 cursor-pointer border border-border/50 bg-card"
                          onClick={() => navigateMemberProfile(member.user_id._id)}
                        >
                          <div className="flex flex-col items-center text-center space-y-3">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src="" />
                              <AvatarFallback className="text-sm font-semibold bg-muted">
                                {member.user_id.first_name[0]}{member.user_id.last_name[0]}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="space-y-1">
                              <h3 className="text-sm font-medium text-foreground">
                                {member.user_id.first_name} {member.user_id.last_name}
                              </h3>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                 {activeTab === 'analytics' && (
                   <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                      <Card className="p-6 text-center">
                        <h3 className="text-3xl font-bold text-primary">{stats?.posts || 0}</h3>
                        <p className="text-muted-foreground">Total Posts</p>
                      </Card>
                      <Card className="p-6 text-center">
                        <h3 className="text-3xl font-bold text-primary">{stats?.products || 0}</h3>
                        <p className="text-muted-foreground">Products</p>
                      </Card>
                      <Card className="p-6 text-center">
                        <h3 className="text-3xl font-bold text-primary">{stats?.team_members || 0}</h3>
                        <p className="text-muted-foreground">Team Members</p>
                      </Card>
                      <Card className="p-6 text-center">
                        <h3 className="text-3xl font-bold text-primary">{stats?.total_score || 0}</h3>
                        <p className="text-muted-foreground">Total Score</p>
                      </Card>
                    </div>
                    <Card className="p-6">
                      <h3 className="text-xl font-semibold mb-4">Performance Overview</h3>
                      <p className="text-muted-foreground">Detailed analytics coming soon...</p>
                    </Card>
                  </div>
                )}

                 {activeTab === 'products' && (
                   <div>
                     <div className="flex justify-end items-center mb-6">
                      <Button
                        onClick={() => navigate(`/new/company/product/setup?companyId=${companyData._id}&companyName=${encodeURIComponent(companyData.name)}&companyUrl=${companyData.company_url}`)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Product
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {products.map((product) => (
                        <Card key={product._id} className="p-6 hover:shadow-md transition-shadow">
                          <div className="flex items-start gap-4">
                            <div className="relative">
                              <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
                                <img
                                  src={product.logo}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-card ${product.is_live ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">{product.percentage}% Complete</span>
                                <ProgressCircle percentage={product.percentage} size={40} />
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                 {activeTab === 'activities' && (
                   <div>
                    <Card className="p-6">
                      <p className="text-muted-foreground">Recent activities will be displayed here...</p>
                    </Card>
                  </div>
                )}

                 {activeTab === 'jobs' && (
                   <div>
                    <Card className="p-6">
                      <p className="text-muted-foreground">Job listings will be displayed here...</p>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyProfile;