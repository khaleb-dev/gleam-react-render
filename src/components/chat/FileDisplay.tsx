import React, { useState } from 'react';
import { ImagePreviewModal } from './ImagePreviewModal';
import { ImageIcon } from 'lucide-react';
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

  // Thumbnails - add compact class for smaller size
  const imageThumbnails = images.map((url, index) => (
    <button
      key={url}
      onClick={() => setModalState({ open: true, startIndex: index })}
      className={`relative aspect-square ${compact ? 'w-12 h-12 min-w-[3rem]' : 'w-20 h-20'} bg-gray-200 rounded-lg overflow-hidden group`}
      tabIndex={0}
    >
      <img
        src={url}
        alt="thumbnail"
        className="w-full h-full object-cover"
        style={compact ? { objectFit: 'cover' } : {}}
      />
      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <ImageIcon className="h-6 w-6 text-white" />
      </div>
    </button>
  ));

  const otherFileLinks = otherFiles.map((url, index) => (
    <FileLink key={index} url={url} compact={compact} />
  ));

  return (
    <>
      <div
        className={`grid gap-2 ${
          (fileUrls.length > 1 && !compact) ? 'grid-cols-2' : 'grid-cols-1'
        }`}
      >
        {imageThumbnails}
        {otherFileLinks}
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
