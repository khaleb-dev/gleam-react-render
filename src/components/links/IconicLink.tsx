import React from 'react';
import { Github, Facebook, Youtube, Link, FileText } from 'lucide-react';

const getIconForUrl = (url: string) => {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    
    if (hostname.includes('github.com')) {
      return <Github size={16} className="text-gray-800 flex-shrink-0" />;
    }
    if (hostname.includes('facebook.com')) {
      return <Facebook size={16} className="text-blue-600 flex-shrink-0" />;
    }
    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
      return <Youtube size={16} className="text-red-500 flex-shrink-0" />;
    }
  } catch (e) {
    // invalid URL, ignore and return null
  }
  
  return null;
};

interface IconicLinkProps {
  url: string;
  label?: string;
  isFile?: boolean;
}

export const IconicLink: React.FC<IconicLinkProps> = ({ url, label, isFile = false }) => {
  let icon = getIconForUrl(url);
  
  if (!icon) {
      icon = isFile ? <FileText size={16} className="text-primary flex-shrink-0" /> : <Link size={16} className="text-gray-500 flex-shrink-0" />;
  }
  
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 bg-gray-50 rounded border hover:bg-gray-100 group">
      {icon}
      <span className="text-xs truncate text-blue-600 group-hover:underline">
        {label || url}
      </span>
    </a>
  );
};
