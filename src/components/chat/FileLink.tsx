import React from 'react';
import { FileText, File, Download } from 'lucide-react';

const getFileIcon = (url: string, size: number = 24) => {
  try {
    const extension = new URL(url).pathname.split('.').pop()?.toLowerCase() || '';
    if (['pdf'].includes(extension))
      return <FileText size={size} className="text-red-500 flex-shrink-0" />;
    return <File size={size} className="text-gray-500 flex-shrink-0" />;
  } catch {
    return <File size={size} className="text-gray-500 flex-shrink-0" />;
  }
};

interface FileLinkProps {
  url: string;
  compact?: boolean;
}

export const FileLink: React.FC<FileLinkProps> = ({ url, compact = false }) => {
  const fileName = "Submitted file";
  const fileType = (url.split('.').pop() || 'file').toUpperCase();

  // Sizing for compact mode
  const iconSize = compact ? 30 : 24;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      download
      className={`flex items-center gap-2 ${compact ? 'p-1' : 'p-3'} bg-white border rounded-lg hover:bg-gray-50 transition-colors w-fit min-w-[110px]`}
      style={compact ? { minHeight: 44, minWidth: 100, width: 'auto', maxWidth: 160 } : {}}
    >
      {getFileIcon(url, iconSize)}
      <div className={`flex-1 truncate`}>
        <p
          className={`text-xs font-medium text-gray-800 truncate ${
            compact ? '' : ''
          }`}
        >
          {fileName}
        </p>
        {fileType && (
          <p className={`text-[10px] text-gray-500 leading-3`}>
            {fileType}
          </p>
        )}
      </div>
      <Download className={`flex-shrink-0 ${compact ? 'h-3 w-3' : 'h-4 w-4'} text-gray-400`} />
    </a>
  );
};
