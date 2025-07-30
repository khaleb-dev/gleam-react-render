import React from 'react';
import { X, FileText, Image, Video, File } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileWithPreview {
  file: File;
  preview?: string;
}

interface FilePreviewProps {
  files: FileWithPreview[];
  onRemoveFile: (index: number) => void;
  className?: string;
}

const getFileIcon = (file: File) => {
  const type = file.type;
  if (type.startsWith('image/')) {
    return <Image className="w-5 h-5 text-blue-500" />;
  } else if (type.startsWith('video/')) {
    return <Video className="w-5 h-5 text-purple-500" />;
  } else if (type === 'application/pdf') {
    return <FileText className="w-5 h-5 text-red-500" />;
  }
  return <File className="w-5 h-5 text-gray-500" />;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const FilePreview: React.FC<FilePreviewProps> = ({
  files,
  onRemoveFile,
  className = '',
}) => {
  if (files.length === 0) return null;

  return (
    <div className={`space-y-2 ${className}`}>
      {files.map((fileWithPreview, index) => {
        const { file, preview } = fileWithPreview;
        const isImage = file.type.startsWith('image/');

        return (
          <div
            key={`${file.name}-${index}`}
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border"
          >
            {isImage && preview ? (
              <img
                src={preview}
                alt={file.name}
                className="w-12 h-12 object-cover rounded border"
              />
            ) : (
              <div className="w-12 h-12 flex items-center justify-center bg-white rounded border">
                {getFileIcon(file)}
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {file.name}
              </p>
              <p className="text-xs text-gray-500">
                {formatFileSize(file.size)}
              </p>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onRemoveFile(index)}
              className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        );
      })}
    </div>
  );
};
