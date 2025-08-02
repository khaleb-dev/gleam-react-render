import React from "react";
import { X, FileText, ImageIcon } from "lucide-react";

const getIcon = (file: File) => {
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) {
    return <ImageIcon className="w-5 h-5 text-blue-500" />;
  }
  if (["pdf"].includes(ext)) {
    return <FileText className="w-5 h-5 text-red-600" />;
  }
  return <FileText className="w-5 h-5 text-gray-400" />;
};

interface FilePreviewProps {
  files: File[];
  onRemoveFile: (index: number) => void;
}

export const FilePreview: React.FC<FilePreviewProps> = ({ files, onRemoveFile }) => {
  return (
    <div className="flex flex-wrap gap-2 mt-1">
      {files.map((file, i) => {
        const ext = file.name.split(".").pop()?.toLowerCase();
        const isImg = ["jpg", "jpeg", "png", "gif", "webp"].includes(ext || "");
        return (
          <div
            key={file.name + i}
            className="relative rounded-lg border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 w-16 h-16 flex items-center justify-center"
          >
            {isImg ? (
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                className="w-14 h-14 rounded object-cover"
              />
            ) : (
              <div className="w-14 h-14 flex items-center justify-center">
                {getIcon(file)}
              </div>
            )}
            <button
              type="button"
              className="absolute -top-2 -right-2 rounded-full bg-red-500 text-white p-0.5 shadow hover:bg-red-600 z-10"
              aria-label="Remove file"
              tabIndex={0}
              onClick={() => onRemoveFile(i)}
            >
              <X size={12} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
