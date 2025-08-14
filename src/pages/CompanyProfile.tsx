import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Building2, Users, Globe, Calendar, Camera, MapPin, Link as LinkIcon, ExternalLink, Plus, MessageCircle, Settings, Edit, Save, X, Search, UserMinus } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
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
import { useCompanyPageRoles } from '@/hooks/useCompanyPageRoles';
import { usePermissions } from '@/hooks/usePermissions';

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
  const isMobile = useIsMobile();
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
  const { data: rolesData } = useCompanyPageRoles();
  const permissions = usePermissions(companyData);

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

  // Invite Modal Component
  const InviteModal = () => (
    <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Team Members</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users to invite..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Search Results */}
          {isSearching && (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          )}
          
          {searchUsers.length > 0 && (
            <div className="max-h-48 overflow-y-auto space-y-2">
              {searchUsers.map((user) => (
                <div
                  key={user._id}
                  onClick={() => toggleUserSelection(user)}
                  className={`flex items-center space-x-3 p-2 rounded-lg border cursor-pointer transition-colors ${
                    selectedUsers.some(u => u._id === user._id)
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted/50'
                  }`}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.profile_avatar || ''} />
                    <AvatarFallback>{user.first_name?.[0]}{user.last_name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Selected Users */}
          {selectedUsers.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Selected Users ({selectedUsers.length})</h4>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {selectedUsers.map((user) => (
                  <div key={user._id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={user.profile_avatar || ''} />
                        <AvatarFallback className="text-xs">{user.first_name?.[0]}{user.last_name?.[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{user.first_name} {user.last_name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleUserSelection(user)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setInviteModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleInviteUsers}
              disabled={selectedUsers.length === 0}
            >
              Invite {selectedUsers.length > 0 ? `(${selectedUsers.length})` : ''}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

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
          <div className={`absolute top-[150px] ${isMobile ? 'left-1/2 transform -translate-x-1/2' : 'left-8'} z-9`}>
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

          {/* Company Info in Header */}
          <CardContent className={`pt-10 pb-4 px-8 ${isMobile ? 'text-center' : 'ml-24'}`}>
            <div className={`${isMobile ? 'flex flex-col items-center' : 'flex justify-between items-start'}`}>
              <div className={`${isMobile ? 'flex flex-col items-center' : 'ml-5 mt-[-30px]'}`}>
                {/* Mobile: Show only name and handle first, then score/followers */}
                {isMobile ? (
                  <>
                     {isEditing ? (
                      <Input
                        value={editedData.name}
                        onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
                        className="text-2xl font-bold mb-1 border border-border/50 shadow-none bg-transparent p-2 h-auto rounded-md text-center mt-4"
                      />
                    ) : (
                      <h1 className="text-2xl font-bold mb-1 mt-4">{companyData.name}</h1>
                    )}
                    <p className="text-muted-foreground mb-3">@{companyData.company_url}</p>
                    
                    {/* Score and Followers */}
                    <div className="flex gap-6 text-sm mb-4">
                      <span><strong>{stats?.total_score || 0}</strong> <span className="text-muted-foreground">Score</span></span>
                      <span><strong>{companyData.followersCount || 0}</strong> <span className="text-muted-foreground">Followers</span></span>
                    </div>

                    {/* Company description and details */}
                    {isEditing ? (
                      <Input
                        value={editedData.tag_line}
                        onChange={(e) => setEditedData({ ...editedData, tag_line: e.target.value })}
                        className="mb-3 border border-border/50 shadow-none bg-transparent p-2 h-auto rounded-md text-center"
                      />
                    ) : (
                      <p className="mb-3 text-center">{companyData.tag_line}</p>
                    )}

                    <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-3">
                      <LinkIcon className="w-4 h-4" />
                      {isEditing ? (
                        <Input
                          value={editedData.website}
                          onChange={(e) => setEditedData({ ...editedData, website: e.target.value })}
                          className="text-primary border border-border/50 shadow-none bg-transparent p-1 h-auto rounded-md text-center"
                          placeholder="Website URL"
                        />
                      ) : (
                        <a href={companyData.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          {companyData.website}
                        </a>
                      )}
                    </div>

                    <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        {isEditing ? (
                          <Input
                            value={editedData.industry}
                            onChange={(e) => setEditedData({ ...editedData, industry: e.target.value })}
                            className="border border-border/50 shadow-none bg-transparent p-1 h-auto rounded-md text-center"
                            placeholder="Industry"
                          />
                        ) : (
                          <span>{companyData.industry}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {isEditing ? (
                          <Input
                            value={editedData.size}
                            onChange={(e) => setEditedData({ ...editedData, size: e.target.value })}
                            className="border border-border/50 shadow-none bg-transparent p-1 h-auto rounded-md text-center"
                            placeholder="Size"
                          />
                        ) : (
                          <span>{companyData.size}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>Founded {formatDate(companyData.createdAt)}</span>
                    </div>
                  </>
                ) : (
                  <>
                    {isEditing ? (
                      <Input
                        value={editedData.name}
                        onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
                        className="text-3xl font-bold mb-2 border border-border/50 shadow-none bg-transparent p-2 h-auto rounded-md"
                      />
                    ) : (
                      <h1 className="text-3xl font-bold mb-2">{companyData.name}</h1>
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

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                      <div className="flex items-center gap-1">
                        <LinkIcon className="w-4 h-4" />
                        {isEditing ? (
                          <Input
                            value={editedData.website}
                            onChange={(e) => setEditedData({ ...editedData, website: e.target.value })}
                            className="text-primary border border-border/50 shadow-none bg-transparent p-1 h-auto rounded-md"
                          />
                        ) : (
                          <a href={companyData.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            {companyData.website}
                          </a>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        {isEditing ? (
                          <Input
                            value={editedData.industry}
                            onChange={(e) => setEditedData({ ...editedData, industry: e.target.value })}
                            className="border border-border/50 shadow-none bg-transparent p-1 h-auto rounded-md"
                          />
                        ) : (
                          <span>{companyData.industry}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {isEditing ? (
                          <Input
                            value={editedData.size}
                            onChange={(e) => setEditedData({ ...editedData, size: e.target.value })}
                            className="border border-border/50 shadow-none bg-transparent p-1 h-auto rounded-md"
                          />
                        ) : (
                          <span>{companyData.size}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Founded {formatDate(companyData.createdAt)}</span>
                      </div>
                    </div>

                    <div className="flex gap-6 text-sm">
                      <span><strong>{stats?.total_score || 0}</strong> <span className="text-muted-foreground">Score</span></span>
                      <span><strong>{companyData.followersCount || 0}</strong> <span className="text-muted-foreground">Followers</span></span>
                    </div>
                  </>
                )}
              </div>

              <div className={`flex ${isMobile ? 'flex-row gap-2 mt-4' : 'flex-col gap-2'}`}>
                {!permissions.canManageMembers && (
                  <Button 
                    onClick={handleFollowToggle}
                    variant={isFollowing ? "outline" : "default"}
                    disabled={followMutation.isPending || unfollowMutation.isPending}
                    className={isMobile ? 'flex-1' : ''}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </Button>
                )}
                
                {permissions.canManageMembers && !isEditing && (
                  <Button 
                    onClick={handleEditToggle}
                    variant="outline"
                    className={isMobile ? 'flex-1' : ''}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                )}
                
                {isEditing && (
                  <>
                    <Button 
                      onClick={handleSaveChanges}
                      disabled={updateCompanyPage.isPending || isUploading}
                      className={isMobile ? 'flex-1' : ''}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button 
                      onClick={handleEditToggle}
                      variant="outline"
                      className={isMobile ? 'flex-1' : ''}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </>
                )}

                <Button variant="outline" className={isMobile ? 'flex-1' : ''}>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Message
                </Button>

                {permissions.canManageMembers && (
                  <Button 
                    variant="outline" 
                    className={isMobile ? 'flex-1' : ''}
                    onClick={() => setInviteModalOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {isMobile ? 'Add' : 'Add Member'}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </div>
      </Card>

      {/* Navigation Tabs - Sticky */}
      <div className="sticky top-16 z-10 bg-background border-b">
        <div className="max-w-6xl mx-auto">
          <div className={`flex ${isMobile ? 'overflow-x-auto scrollbar-hide' : 'justify-center'} bg-background`}>
            {['feed', 'about', 'products', 'members', 'analytics'].map((tab) => {
              // Hide analytics tab if user doesn't have permission
              if (tab === 'analytics' && !permissions.canViewAnalytics) {
                return null;
              }
              
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className={`${isMobile ? 'space-y-6' : 'grid grid-cols-12 gap-6'}`}>
          {/* Left Sidebar - Company Info */}
          {!isMobile && (
            <div className="col-span-3 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">About</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditing ? (
                    <Textarea
                      value={editedData.about}
                      onChange={(e) => setEditedData({ ...editedData, about: e.target.value })}
                      placeholder="Tell us about your company..."
                      rows={4}
                      className="resize-none"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {companyData.about || "No description available."}
                    </p>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      <a href={companyData.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        {companyData.website}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      <span>{companyData.industry}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>{companyData.size} employees</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>Founded {formatDate(companyData.createdAt)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Company Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoadingStats ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  ) : (
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Score</span>
                        <span className="font-medium">{stats?.total_score || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Posts</span>
                        <span className="font-medium">{stats?.posts || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Followers</span>
                        <span className="font-medium">{companyData.followersCount || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Following</span>
                        <span className="font-medium">0</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Main Content */}
          <div className={`${isMobile ? '' : 'col-span-6'} space-y-6`}>
            {activeTab === 'feed' && (
              <>
                {permissions.canCreatePosts && (
                  <CreatePostCard 
                    user={companyData?.admin_id ? { 
                      first_name: companyData.admin_id.first_name, 
                      last_name: companyData.admin_id.last_name, 
                      email: companyData.admin_id.email, 
                      user_id: companyData.admin_id._id, 
                      role: 'admin' 
                    } : { first_name: 'Company', last_name: 'Admin', email: '', user_id: '', role: 'admin' }} 
                    onPostCreate={handlePostSubmit} 
                  />
                )}
                
                <div className="space-y-6">
                  {mockPosts.map((post) => (
                    <FeedCard key={post._id} post={post} />
                  ))}
                </div>
              </>
            )}

            {activeTab === 'about' && (
              <Card>
                <CardHeader>
                  <CardTitle>About {companyData.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">Overview</h3>
                    {isEditing ? (
                      <Textarea
                        value={editedData.about}
                        onChange={(e) => setEditedData({ ...editedData, about: e.target.value })}
                        placeholder="Tell us about your company..."
                        rows={6}
                        className="resize-none"
                      />
                    ) : (
                      <p className="text-muted-foreground">
                        {companyData.about || "No description available."}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-3">Company Info</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">Website</span>
                          <a href={companyData.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline ml-auto">
                            {companyData.website}
                          </a>
                        </div>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">Industry</span>
                          <span className="text-sm ml-auto">{companyData.industry}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">Company Size</span>
                          <span className="text-sm ml-auto">{companyData.size}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">Founded</span>
                          <span className="text-sm ml-auto">{formatDate(companyData.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3">Statistics</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Total Score</span>
                          <span className="font-medium">{stats?.total_score || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Posts</span>
                          <span className="font-medium">{stats?.posts || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Followers</span>
                          <span className="font-medium">{companyData.followersCount || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Following</span>
                          <span className="font-medium">0</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'products' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Products</h2>
                  {permissions.canManageMembers && (
                    <Button onClick={() => navigate('/product-setup')}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Product
                    </Button>
                  )}
                </div>

                {isLoadingProducts ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                      <Card key={i}>
                        <CardContent className="p-6">
                          <Skeleton className="h-48 w-full mb-4" />
                          <Skeleton className="h-6 w-3/4 mb-2" />
                          <Skeleton className="h-4 w-full" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {products.length > 0 ? (
                      products.map((product: any) => (
                        <Card key={product._id} className="overflow-hidden">
                          <div className="aspect-video bg-muted flex items-center justify-center">
                            {product.images && product.images[0] ? (
                              <img 
                                src={product.images[0]} 
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Building2 className="w-12 h-12 text-muted-foreground" />
                            )}
                          </div>
                          <CardContent className="p-6">
                            <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                            <p className="text-muted-foreground text-sm mb-4">{product.description}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-2xl font-bold text-primary">
                                ${product.price}
                              </span>
                              <Button size="sm">
                                <ExternalLink className="w-4 h-4 mr-2" />
                                View
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="col-span-2 text-center py-12">
                        <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No products yet</h3>
                        <p className="text-muted-foreground mb-6">Add your first product to showcase what your company offers.</p>
                        {permissions.canManageMembers && (
                          <Button onClick={() => navigate('/product-setup')}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Product
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'members' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Team Members</h2>
                  {permissions.canManageMembers && (
                    <Button onClick={() => setInviteModalOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Member
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {companyData.members?.map((member: any) => (
                    <Card key={member._id} className="text-center">
                      <CardContent className="p-6">
                        <Avatar className="w-16 h-16 mx-auto mb-4">
                          <AvatarImage src={member.user_id?.profile_avatar} />
                          <AvatarFallback>
                            {member.user_id?.first_name?.[0]}{member.user_id?.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <h3 className="font-semibold mb-1">
                          {member.user_id?.first_name} {member.user_id?.last_name}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">{member.role}</p>
                        <div className="flex gap-2 justify-center">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => navigateMemberProfile(member.user_id?._id)}
                          >
                            View Profile
                          </Button>
                          {permissions.canManageMembers && member.role !== 'super_admin' && (
                            <Button size="sm" variant="ghost">
                              <UserMinus className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )) || (
                    <div className="col-span-3 text-center py-12">
                      <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No team members yet</h3>
                      <p className="text-muted-foreground mb-6">Invite your team members to showcase your company together.</p>
                      {permissions.canManageMembers && (
                        <Button onClick={() => setInviteModalOpen(true)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Member
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-6">
                {permissions.canViewAnalytics ? (
                  <>
                    <h2 className="text-2xl font-bold">Analytics</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Card>
                        <CardContent className="p-6 text-center">
                          <ProgressCircle percentage={75} />
                          <h3 className="font-semibold mt-4 mb-2">Engagement Rate</h3>
                          <p className="text-sm text-muted-foreground">75% increase from last month</p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-6 text-center">
                          <ProgressCircle percentage={60} />
                          <h3 className="font-semibold mt-4 mb-2">Follower Growth</h3>
                          <p className="text-sm text-muted-foreground">60% growth this quarter</p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-6 text-center">
                          <ProgressCircle percentage={85} />
                          <h3 className="font-semibold mt-4 mb-2">Content Performance</h3>
                          <p className="text-sm text-muted-foreground">85% above average</p>
                        </CardContent>
                      </Card>
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {[
                            { action: "New follower", user: "John Doe", time: "2 hours ago" },
                            { action: "Post liked", user: "Jane Smith", time: "4 hours ago" },
                            { action: "Comment received", user: "Mike Johnson", time: "6 hours ago" },
                          ].map((activity, i) => (
                            <div key={i} className="flex items-center justify-between py-2 border-b last:border-b-0">
                              <div>
                                <p className="font-medium">{activity.action}</p>
                                <p className="text-sm text-muted-foreground">{activity.user}</p>
                              </div>
                              <span className="text-sm text-muted-foreground">{activity.time}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
                      <p className="text-muted-foreground">You don't have permission to view analytics for this company.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>

          {/* Right Sidebar - Suggested connections, etc. */}
          {!isMobile && (
            <div className="col-span-3 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Similar Companies</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback>C{i}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">Company {i}</p>
                        <p className="text-xs text-muted-foreground">Technology</p>
                      </div>
                      <Button size="sm" variant="outline">Follow</Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Invite Modal */}
      <InviteModal />
    </div>
  );
};

export default CompanyProfile;