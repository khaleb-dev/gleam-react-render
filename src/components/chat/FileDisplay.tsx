import React, { useState } from 'react';
import { ImagePreviewModal } from './ImagePreviewModal';
import { ImageIcon, FileText, File } from 'lucide-react';
import { FileLink } from './FileLink';

const isImageUrl = (url: string) => {
  try {
    const parsedUrl = new URL(url);
    const extension = parsedUrl.pathname.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '');
  } catch {
    return false;
  }
};

const getFileIcon = (url: string) => {
  try {
    const extension = new URL(url).pathname.split('.').pop()?.toLowerCase() || '';
    if (['pdf'].includes(extension))
      return <FileText className="w-8 h-8 text-red-500" />;
    return <File className="w-8 h-8 text-gray-500" />;
  } catch {
    return <File className="w-8 h-8 text-gray-500" />;
  }
};

interface FileDisplayProps {
  fileUrls: string[];
  compact?: boolean;
}

export const FileDisplay: React.FC<FileDisplayProps> = ({
  fileUrls,
  compact = false,
}) => {
  const [modalState, setModalState] = useState<{
    open: boolean;
    startIndex: number;
  }>({ open: false, startIndex: 0 });

  const images = fileUrls.filter(isImageUrl);
  const otherFiles = fileUrls.filter((url) => !isImageUrl(url));

  // Image thumbnails
  const imageThumbnails = images.map((url, index) => (
    <button
      key={url}
      onClick={() => setModalState({ open: true, startIndex: index })}
      className={`relative aspect-square ${compact ? 'w-12 h-12 min-w-[3rem]' : 'w-20 h-20'} bg-gray-200 rounded-lg overflow-hidden group`}
      tabIndex={0}
    >
      <img
        src={url}
        alt="File thumbnail"
        className="w-full h-full object-cover"
        style={compact ? { objectFit: 'cover' } : {}}
      />
      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <ImageIcon className="h-6 w-6 text-white" />
      </div>
    </button>
  ));

  // Non-image file thumbnails (no names shown)
  const otherFileThumbnails = otherFiles.map((url, index) => (
    <a
      key={index}
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      download
      className={`flex items-center justify-center ${compact ? 'w-12 h-12 min-w-[3rem]' : 'w-20 h-20'} bg-white border rounded-lg hover:bg-gray-50 transition-colors`}
    >
      {getFileIcon(url)}
    </a>
  ));

  return (
    <>
      <div
        className={`grid gap-2 ${
          (fileUrls.length > 1 && !compact) ? 'grid-cols-2' : 'grid-cols-1'
        }`}
      >
        {imageThumbnails}
        {otherFileThumbnails}
      </div>
      {modalState.open && (
        <ImagePreviewModal
          images={images}
          startIndex={modalState.startIndex}
          onClose={() => setModalState({ open: false, startIndex: 0 })}
        />
      )}
    </>
  );
};
