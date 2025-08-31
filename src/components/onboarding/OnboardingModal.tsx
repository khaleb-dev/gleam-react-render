import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, User, PenTool } from 'lucide-react';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/config/env';
import { useSingleFileUpload } from '@/hooks/useSingleFileUpload';
import type { User as UserType } from '@/types';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType;
  isFirstTime: boolean;
  onComplete: (updatedUser: UserType) => void;
}

interface CreatePostPayload {
  title: string;
  description: string;
  images: string[];
  videos: string[];
  category: string;
  tags: string[];
  visibility: "public" | "private" | "followers";
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  user,
  isFirstTime,
  onComplete
}) => {
  const [step, setStep] = useState<'avatar' | 'post'>('avatar');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isCreatingPost, setIsCreatingPost] = useState(false);

  const { uploadFile, isUploading } = useSingleFileUpload();

  // Post form data
  const [postData, setPostData] = useState({
    title: '',
    description: '',
    category: 'introduction',
    tags: ['introduction', 'welcome']
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File size should be less than 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const uploadAvatar = async () => {
    if (!selectedFile) {
      toast.error('Please select an image');
      return;
    }

    setIsUploadingAvatar(true);
    try {
      // First upload the file to get the URL
      const uploadedUrl = await uploadFile(selectedFile);

      if (!uploadedUrl) {
        toast.error('Failed to upload image');
        return;
      }

      // Then update the profile with the uploaded URL
      const response = await fetch(`${API_BASE_URL}/users/edit-profile`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profile_avatar: uploadedUrl
        }),
      });

      const result = await response.json();

      if (result.success) {
        const updatedUser = { ...user, profile_avatar: uploadedUrl };
        toast.success('Profile picture uploaded successfully!');
        
        // Update the user context first
        onComplete(updatedUser);
        
        // Small delay to ensure context update, then handle step transition
        setTimeout(() => {
          if (isFirstTime) {
            setStep('post');
          } else {
            onClose();
          }
        }, 100);
      } else {
        toast.error(result.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast.error('Failed to upload profile picture');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const createFirstPost = async () => {
    if (!postData.title.trim() || !postData.description.trim()) {
      toast.error('Please fill in both title and description');
      return;
    }

    setIsCreatingPost(true);
    try {
      const payload: CreatePostPayload = {
        title: postData.title,
        description: postData.description,
        images: [],
        videos: [],
        category: postData.category,
        tags: postData.tags,
        visibility: 'public'
      };

      const response = await fetch(`${API_BASE_URL}/feed/create-post`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success('Welcome post created successfully!');
        onClose();
      } else {
        toast.error(result.message || 'Failed to create post');
      }
    } catch (error) {
      console.error('Create post error:', error);
      toast.error('Failed to create post');
    } finally {
      setIsCreatingPost(false);
    }
  };

  const skipAvatarUpload = () => {
    if (isFirstTime) {
      setStep('post');
    } else {
      onClose();
    }
  };

  const skipPostCreation = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => { }}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step === 'avatar' ? (
              <>
                <User className="h-5 w-5" />
                Welcome! Let's set up your profile
              </>
            ) : (
              <>
                <PenTool className="h-5 w-5" />
                Create your first post
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        {step === 'avatar' && (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                {isFirstTime
                  ? "Let's start by adding a profile picture to help others recognize you."
                  : "We noticed you don't have a profile picture. Add one to complete your profile."
                }
              </p>

              <div className="flex flex-col items-center gap-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={previewUrl || user.profile_avatar || ''} />
                  <AvatarFallback className="text-lg">
                    {user.first_name?.[0]}{user.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>

                <div className="space-y-2">
                  <Label htmlFor="avatar-upload" className="cursor-pointer">
                    <div className="flex items-center gap-2 px-4 py-2 border border-dashed border-muted-foreground rounded-lg hover:bg-muted transition-colors">
                      <Upload className="h-4 w-4" />
                      Choose Photo
                    </div>
                  </Label>
                  <Input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG or GIF (max 5MB)
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={skipAvatarUpload}
                className="flex-1"
              >
                Skip for now
              </Button>
              <Button
                onClick={uploadAvatar}
                disabled={!selectedFile || isUploadingAvatar || isUploading}
                className="flex-1"
              >
                {(isUploadingAvatar || isUploading) ? 'Uploading...' : 'Continue'}
              </Button>
            </div>
          </div>
        )}

        {step === 'post' && (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                Introduce yourself to the community! Share a bit about who you are and what you're interested in.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="post-title">Title</Label>
                <Input
                  id="post-title"
                  placeholder="e.g., Hello everyone! I'm new here"
                  value={postData.title}
                  onChange={(e) => setPostData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="post-description">Tell us about yourself</Label>
                <Textarea
                  id="post-description"
                  placeholder="Share your interests, background, or what brings you to our community..."
                  value={postData.description}
                  onChange={(e) => setPostData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={skipPostCreation}
                className="flex-1"
              >
                Skip for now
              </Button>
              <Button
                onClick={createFirstPost}
                disabled={isCreatingPost || !postData.title.trim() || !postData.description.trim()}
                className="flex-1"
              >
                {isCreatingPost ? 'Creating...' : 'Create Post'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};