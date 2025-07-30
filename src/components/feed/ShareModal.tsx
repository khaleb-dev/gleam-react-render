import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Facebook, Twitter, Linkedin, MessageCircle, Copy, X } from 'lucide-react';
import { toast } from 'sonner';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: {
    id: string;
    title: string;
    description: string;
  };
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, post }) => {
  const shareUrl = `${window.location.origin}/feed/${post.id}`;
  const shareText = `Check out this amazing work: ${post.title}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard!');
      onClose();
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const shareOptions = [
    {
      name: 'Facebook',
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      bgColor: 'bg-[#1877F2] hover:bg-[#166FE5]',
      textColor: 'text-white'
    },
    {
      name: 'Twitter',
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      bgColor: 'bg-[#1DA1F2] hover:bg-[#1A91DA]',
      textColor: 'text-white'
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      bgColor: 'bg-[#0A66C2] hover:bg-[#095BA1]',
      textColor: 'text-white'
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      url: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
      bgColor: 'bg-[#25D366] hover:bg-[#22C55E]',
      textColor: 'text-white'
    }
  ];

  const handleShare = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] max-w-sm p-4">
        <DialogHeader className="pb-3">
          <DialogTitle className="text-center text-base font-semibold">Share this post</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Social Media Icons Grid */}
          <div className="grid grid-cols-4 gap-2">
            {shareOptions.map((option) => (
              <div key={option.name} className="flex flex-col items-center space-y-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-10 w-10 rounded-full p-0 ${option.bgColor} ${option.textColor} transition-colors shadow-lg border-0`}
                  onClick={() => handleShare(option.url)}
                  title={`Share on ${option.name}`}
                >
                  <option.icon className="h-4 w-4" />
                </Button>
                <span className="text-[10px] text-gray-600 dark:text-gray-400 text-center truncate w-full leading-tight">
                  {option.name}
                </span>
              </div>
            ))}
          </div>
          
          {/* Copy Link Section */}
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <div className="flex-1 min-w-0 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                  {shareUrl}
                </p>
              </div>
              <Button 
                onClick={handleCopyLink} 
                size="sm"
                className="flex-shrink-0 bg-gray-600 hover:bg-gray-700 text-white h-8 px-3"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
