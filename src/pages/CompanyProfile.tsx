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
import { SuggestedPagesCard } from '@/components/feed/SuggestedPagesCard';
import { MembersCard } from '@/components/company/MembersCard';
import { PendingMembersList } from '@/components/company/PendingMembersList';
import { usePageMembers } from '@/hooks/usePageMembers';
import { usePagePermissions } from '@/hooks/usePagePermissions';
import { useSendMultiplePageInvites } from '@/hooks/useSendPageInvite';
import { API_BASE_URL } from '@/config/env';
import { useFeed } from '@/hooks/useFeed';

// Mock posts data for feed
const mockPosts = [
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
  const permissions = usePagePermissions(companyData?._id || '');

  // Follow functionality hooks
  const { data: followStatusData, isLoading: isLoadingFollowStatus } = useFollowStatus(companyData?._id || '');
  const isFollowing = followStatusData?.data?.isFollowing || false;
  const followMutation = useFollowCompanyPage();
  const unfollowMutation = useUnfollowCompanyPage();

  const updateCompanyPage = useUpdateCompanyPage();
  const { data: rolesData } = useCompanyPageRoles();
  const { uploadFile, isUploading } = useSingleFileUpload();
  const sendMultipleInvites = useSendMultiplePageInvites();
  const { createPost } = useFeed();

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
    if (!companyData?._id || selectedUsers.length === 0) return;

    try {
      // Get the default role (first available role) for invites
      const defaultRole = rolesData?.data?.[0];
      if (!defaultRole) {
        toast.error('No roles available for invitation');
        return;
      }

      // Prepare invites array with user-selected roles or default role
      const invites = selectedUsers.map(user => ({
        user_id: user._id,
        role_id: (user as any).selectedRole || defaultRole._id
      }));

      // Use the multiple invites API
      await sendMultipleInvites.mutateAsync({
        pageId: companyData._id,
        invites
      });

      setInviteModalOpen(false);
      setSelectedUsers([]);
      setSearchQuery('');
    } catch (error) {
      console.error('Failed to invite users:', error);
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

  const handleMessageChannel = () => {
    const queryParams = new URLSearchParams({
      userId: companyData._id,
      firstName: companyData.name,
      lastName: "",
      profileAvatar: companyData.logo || "",
      isPage: "true",
      chatType: "page_channel"
    })

    navigate(`/messages?${queryParams.toString()}`)
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
      await createPost(postData);
      toast.success('Post created successfully!');
      setPostContent('');
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    }
  };

  // Members Tab Component
  const MembersTabContentLocal = ({
    companyId,
    setInviteModalOpen
  }: {
    companyId: string;
    setInviteModalOpen: (open: boolean) => void;
  }) => {
    const { data: membersData, isLoading } = usePageMembers(companyId);

    if (isLoading) {
      return (
        <div className="space-y-6">
          {/* Pending Members Loading */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Pending Invites</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 mb-6">
              {[1, 2].map((i) => (
                <div key={i} className="p-3 border rounded-lg animate-pulse">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Team Members Loading */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Team Members</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-3 border rounded-lg animate-pulse">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    const members = membersData?.data?.members?.filter(member => member.status === 'approved') || [];

    return (
      <div className="space-y-6">
        {/* Pending Invites - Only visible to admin and super admin */}
        {(permissions.isAdmin || permissions.isSuperAdmin) && (
          <PendingMembersList pageId={companyId} showTitle={true} />
        )}

        {/* Team Members */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Team Members</h3>
          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {members.map((member) => (
              <MembersCard key={member._id} member={member} />
            ))}
            {members.length === 0 && (
              <div className="col-span-full">
                <Card className="p-8 text-center">
                  <div className="space-y-3">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                      <Users className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium">No members found</h3>
                    <p className="text-muted-foreground text-sm">
                      {permissions.canAddMembers
                        ? "Add team members to get started!"
                        : "No team members are currently listed."
                      }
                    </p>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    );
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
                        maxLength={50}
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
                  </>
                ) : (
                  <>
                    {/* Desktop layout */}
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
                        maxLength={50}
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
                  </>
                )}
              </div>

              <div className={`flex gap-2 ${isMobile ? 'w-full justify-center mt-4' : ''}`}>
                {permissions.canSeeChannelButton && (
                  <Button
                    variant="outline"
                    size={isMobile ? "sm" : "sm"}
                    className={`rounded-full ${isMobile ? 'flex-1 px-2 text-xs' : 'px-4'} border-primary text-primary bg-white hover:bg-primary hover:text-white`}
                    onClick={handleMessageChannel}
                  >
                    <MessageCircle className={`${isMobile ? 'w-3 h-3 mr-1' : 'w-3 h-3 mr-1'}`} />
                    Channel
                  </Button>
                )}

                {/* Follow/Unfollow Button */}
                <Button
                  size={isMobile ? "sm" : "sm"}
                  className={`rounded-full ${isMobile ? 'flex-1 px-2 text-xs' : 'px-4'}`}
                  onClick={handleFollowToggle}
                  disabled={isLoadingFollowStatus || followMutation.isPending || unfollowMutation.isPending}
                >
                  {followMutation.isPending || unfollowMutation.isPending ? (
                    <div className={`${isMobile ? 'w-3 h-3 mr-1' : 'w-3 h-3 mr-1'} border-2 border-current border-t-transparent rounded-full animate-spin`} />
                  ) : isFollowing ? (
                    <UserMinus className={`${isMobile ? 'w-3 h-3 mr-1' : 'w-3 h-3 mr-1'}`} />
                  ) : (
                    <Plus className={`${isMobile ? 'w-3 h-3 mr-1' : 'w-3 h-3 mr-1'}`} />
                  )}
                  {isFollowing ? 'Unfollow' : 'Follow'}
                </Button>

                {permissions.canManagePage && (
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
                )}
                {isEditing && permissions.canManagePage && (
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

      {/* Navigation Tabs - Sticky */}
      <div className="sticky top-[64px] z-10 bg-background border-b shadow-sm w-full left-0 right-0">
        <div className={`${isMobile ? 'flex overflow-x-auto scrollbar-hide px-2 py-1 gap-2' : 'flex items-center justify-center gap-8 py-2'} max-w-none w-full`}>
          {[
            { id: 'feed', label: 'Feed' },
            { id: 'members', label: 'Members' },
            ...(permissions.canViewAnalytics ? [{ id: 'analytics', label: 'Analytics' }] : []),
            { id: 'products', label: 'Products' },
            ...(permissions.canViewActivities ? [{ id: 'activities', label: 'Activities' }] : []),
            { id: 'jobs', label: 'Jobs' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${isMobile ? 'whitespace-nowrap min-w-fit px-3 py-2' : 'px-6 py-3'} text-sm font-medium transition-all ${activeTab === tab.id
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto">
        {activeTab === 'feed' ? (
          <div className={`${isMobile ? 'px-1 mt-4' : 'flex gap-6 mt-6'}`}>
            {/* Left Sidebar - Only show on desktop */}
            {!isMobile && <div className="w-[25%] space-y-6">
              {/* About Section */}
              <Card className={isMobile ? 'mx-1' : ''}>
                <CardContent className="space-y-4 pt-6">
                  {/* About Description - Now first */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">About</h4>
                    {isEditing ? (
                      <Textarea
                        value={editedData.about}
                        onChange={(e) => setEditedData({ ...editedData, about: e.target.value })}
                        placeholder="Tell us about your company..."
                        className="text-sm min-h-[80px] resize-none"
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {companyData.about || "No description available"}
                      </p>
                    )}
                  </div>

                  {/* Company Details - Now after About */}
                  <div className="pt-4 border-t border-border/30 space-y-2">
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
                    {permissions.canCreateProduct && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/new/company/product/setup?companyId=${companyData._id}&companyName=${encodeURIComponent(companyData.name)}&companyUrl=${companyData.company_url}`)}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    )}
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
                      <p className="text-sm text-muted-foreground">No products available or created yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Team Members */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Members</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {companyData.members.slice(0, 5).map((member) => (
                    <div key={member._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveTab("members");
                      }}
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
                        {permissions.canSeeUserRoles && (
                          <p className="text-xs text-muted-foreground capitalize">
                            {member.role_id.role_name.replace(/_/g, ' ')}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>}

            {/* Feed Content */}
            <div className={`${isMobile ? 'w-full' : 'flex-1'} space-y-6`}>
              {/* Create Post - Only show on desktop */}
              {!isMobile && permissions.canCreatePosts && (
                <CreatePostCard
                  user={{
                    ...companyData.admin_id,
                    profile_avatar: companyData.logo,
                    user_id: companyData.admin_id._id,
                    role: 'admin'
                  } as any}
                  onPostCreate={handlePostSubmit}
                  pageId={companyData._id}
                  pageName={companyData.name}
                />
              )}

              {/* Posts Feed */}
              <div className="space-y-0">
                {mockPosts.length > 0 ? (
                  mockPosts.map((post) => (
                    <FeedCard
                      key={post._id}
                      post={post}
                      onLike={() => { }}
                      onUnlike={() => { }}
                      onComment={() => { }}
                      onDeleteComment={() => { }}
                      onDeletePost={() => { }}
                    />
                  ))
                ) : (
                  <Card className="p-8 text-center">
                    <div className="space-y-3">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                        <MessageCircle className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium">No posts yet</h3>
                      <p className="text-muted-foreground text-sm">
                        {permissions.canCreatePosts
                          ? "Be the first to share something with your team!"
                          : "No posts have been shared yet."
                        }
                      </p>
                    </div>
                  </Card>
                )}
              </div>
            </div>

            {/* Right Sidebar - Only show on desktop */}
            {!isMobile && <div className="w-[25%] space-y-6">
              {/* Company Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Company Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">Posts</span>
                    {isLoadingStats ? (
                      <div className="h-4 w-8 bg-muted rounded animate-pulse"></div>
                    ) : (
                      <span className="text-xs font-medium">{stats?.posts || 0}</span>
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">Products</span>
                    {isLoadingStats ? (
                      <div className="h-4 w-8 bg-muted rounded animate-pulse"></div>
                    ) : (
                      <span className="text-xs font-medium">{stats?.products || 0}</span>
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">Team Members</span>
                    {isLoadingStats ? (
                      <div className="h-4 w-8 bg-muted rounded animate-pulse"></div>
                    ) : (
                      <span className="text-xs font-medium">{stats?.team_members || 0}</span>
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">Total Score</span>
                    {isLoadingStats ? (
                      <div className="h-4 w-8 bg-muted rounded animate-pulse"></div>
                    ) : (
                      <span className="text-xs font-medium">{stats?.total_score || 0}</span>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Suggested Pages */}
              <SuggestedPagesCard />
            </div>}
          </div>
        ) : (
          <div className={`w-full ${isMobile ? 'px-1 py-4' : 'px-6 py-8'}`}>
            <Card className={`max-w-6xl mx-auto ${isMobile ? 'mx-1' : ''}`}>
              <CardContent className="p-8">
                {activeTab === 'members' && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold">Team Members</h2>
                      <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
                        {permissions.canAddMembers && (
                          <DialogTrigger asChild>
                            <Button size="sm" className="flex items-center gap-2">
                              <Plus className="w-4 h-4" />
                              Add Members
                            </Button>
                          </DialogTrigger>
                        )}
                        <DialogContent className={`${isMobile ? 'max-w-[95vw] p-4' : 'sm:max-w-4xl'} max-h-[90vh] overflow-y-auto flex flex-col`}>
                          <DialogHeader>
                            <DialogTitle>Add Team Members</DialogTitle>
                          </DialogHeader>
                          <div className={`flex-1 ${isMobile ? 'flex flex-col space-y-4' : 'flex space-x-6'}`}>
                            {/* Left side - User search */}
                            <div className={`${isMobile ? 'w-full' : 'flex-1'} flex flex-col space-y-4`}>
                              <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                  placeholder="Search users..."
                                  value={searchQuery}
                                  onChange={(e) => setSearchQuery(e.target.value)}
                                  className="pl-10"
                                />
                              </div>

                              <div className="space-y-3">

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
                              <div className={`${isMobile ? 'w-full border-t pt-4 mt-4' : 'w-80 border-l pl-6'} flex flex-col space-y-4`}>
                                <h3 className="font-semibold">Selected Members ({selectedUsers.length})</h3>
                                <div className="space-y-3">
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
                                          defaultValue={rolesData?.data.find(r => r.role_name === 'employee')?._id || rolesData?.data[0]?._id || ''}
                                          onChange={(e) => {
                                            const updatedUsers = selectedUsers.map(u =>
                                              u._id === user._id ? { ...u, selectedRole: e.target.value } : u
                                            );
                                            setSelectedUsers(updatedUsers as any);
                                          }}
                                        >
                                          {rolesData?.data?.map((role) => (
                                            <option key={role._id} value={role._id}>
                                              {role.role_name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                            </option>
                                          )) || (
                                              <>
                                                <option value="employee">Employee</option>
                                                <option value="admin">Admin</option>
                                                <option value="moderator">Moderator</option>
                                              </>
                                            )}
                                        </select>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <Button
                                  onClick={handleInviteUsers}
                                  className="w-full"
                                  disabled={sendMultipleInvites.isPending}
                                >
                                  {sendMultipleInvites.isPending ? 'Sending Invites...' : 'Add Selected Members'}
                                </Button>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>

                    {/* Display members using direct hook call */}
                    <MembersTabContentLocal companyId={companyData._id} setInviteModalOpen={setInviteModalOpen} />
                  </div>
                )}

                {activeTab === 'analytics' && permissions.canViewAnalytics && (
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
                    {(stats?.posts || 0) + (stats?.products || 0) + (stats?.team_members || 0) > 0 ? (
                      <Card className="p-6">
                        <h3 className="text-xl font-semibold mb-4">Performance Overview</h3>
                        <p className="text-muted-foreground">Detailed analytics coming soon...</p>
                      </Card>
                    ) : (
                      <Card className="p-8 text-center">
                        <div className="space-y-3">
                          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                            <Calendar className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <h3 className="text-lg font-medium">No analytics available</h3>
                          <p className="text-muted-foreground text-sm">Analytics data will appear here as your company grows and engages.</p>
                        </div>
                      </Card>
                    )}
                  </div>
                )}

                {activeTab === 'products' && (
                  <div>
                    <div className="flex justify-end items-center mb-6">
                      {permissions.canCreateProduct && (
                        <Button
                          onClick={() => navigate(`/new/company/product/setup?companyId=${companyData._id}&companyName=${encodeURIComponent(companyData.name)}&companyUrl=${companyData.company_url}`)}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Product
                        </Button>
                      )}
                    </div>
                    {products.length > 0 ? (
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
                    ) : (
                      <Card className="p-8 text-center">
                        <div className="space-y-3">
                          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                            <Building2 className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <h3 className="text-lg font-medium">No products available or created yet</h3>
                          <p className="text-muted-foreground text-sm">
                            {permissions.canCreateProduct
                              ? "Create your first product to get started!"
                              : "No products have been created for this company."
                            }
                          </p>
                        </div>
                      </Card>
                    )}
                  </div>
                )}

                {activeTab === 'activities' && permissions.canViewActivities && (
                  <div>
                    <Card className="p-8 text-center">
                      <div className="space-y-3">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                          <Calendar className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium">No activities available</h3>
                        <p className="text-muted-foreground text-sm">Recent company activities will be displayed here when available.</p>
                      </div>
                    </Card>
                  </div>
                )}

                {activeTab === 'jobs' && (
                  <div>
                    <Card className="p-8 text-center">
                      <div className="space-y-3">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                          <Building2 className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium">No jobs available</h3>
                        <p className="text-muted-foreground text-sm">Job listings will be displayed here when available.</p>
                      </div>
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