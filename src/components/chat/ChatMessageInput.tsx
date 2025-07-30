import React, { useRef, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Paperclip, Loader, Send } from "lucide-react";
import { FilePreview } from "@/components/ui/FilePreview";
import { Task } from "@/types";
import { LinkPreview } from "./LinkPreview";
import { findFirstUrl } from "./findFirstUrl";
import { useFileUpload } from "@/hooks/useFileUpload";

type Props = {
  newMessage: string;
  setNewMessage: React.Dispatch<React.SetStateAction<string>>;
  files: File[];
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
  handleSendMessage: (e: React.FormEvent) => Promise<void>;
  isSending: boolean;
  task: Task;
};

interface FileWithPreview {
  file: File;
  preview?: string;
}

export const ChatMessageInput: React.FC<Props> = ({
  newMessage,
  setNewMessage,
  files,
  setFiles,
  handleSendMessage,
  isSending,
  task,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isUploading } = useFileUpload();
  const [filesWithPreviews, setFilesWithPreviews] = useState<FileWithPreview[]>([]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 92) + 'px';
    }
  }, [newMessage]);

  // Update files with previews when files change
  useEffect(() => {
    const updateFilesWithPreviews = async () => {
      const newFilesWithPreviews: FileWithPreview[] = [];
      
      for (const file of files) {
        let preview: string | undefined;
        if (file.type.startsWith('image/')) {
          preview = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(file);
          });
        }
        newFilesWithPreviews.push({ file, preview });
      }
      
      setFilesWithPreviews(newFilesWithPreviews);
    };

    updateFilesWithPreviews();
  }, [files]);

  // Detect the first link in the input value
  const detectedUrl = useMemo(() => findFirstUrl(newMessage), [newMessage]);

  // Handle file input change (multi-file)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      // Add new files to existing files instead of replacing
      setFiles(prev => [...prev, ...newFiles]);
      // Clear the input to allow selecting the same files again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Remove a file before sending
  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Handle file upload button click
  const handleFileUploadClick = () => {
    fileInputRef.current?.click();
  };

  const isDisabled = isSending || isUploading;

  return (
    <div className="p-4 border-t border-gray-200 bg-white">
      <form onSubmit={handleSendMessage} className="flex gap-1 items-end">
        <div className="flex-1 relative">
          <div
            className="bg-white flex items-center border border-[#26b386] rounded-3xl shadow-sm px-3 gap-1 hover:border-primary transition-all focus-within:border-primary min-h-[44px]"
            style={{ minHeight: 44, maxHeight: 92 }}
          >
            <Textarea
              ref={textareaRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={`Message ${task.responder ? `${task.responder.first_name}` : "responder"}...`}
              className="min-h-[28px] max-h-[92px] resize-none border-none bg-transparent text-gray-900 placeholder-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none text-[14px] flex-1 px-1.5 py-2 leading-[1.21]"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e as any);
                }
              }}
              style={{ fontSize: 14, lineHeight: "1.21" }}
              disabled={isDisabled}
            />
            <button
              type="button"
              onClick={handleFileUploadClick}
              className={`cursor-pointer flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors ring-0 focus:ring-2 focus:ring-primary ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              title="Upload files"
              style={{ height: 32, width: 32, marginRight: 4 }}
              disabled={isDisabled}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                multiple
                onChange={handleFileChange}
                accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/*"
                disabled={isDisabled}
              />
              <Paperclip className="h-5 w-5 text-gray-400 hover:text-primary" />
            </button>
          </div>
          
          {filesWithPreviews.length > 0 && (
            <div className="mt-2">
              <FilePreview 
                files={filesWithPreviews} 
                onRemoveFile={handleRemoveFile} 
              />
            </div>
          )}
          
          {/* Show inline link preview below the textbox if typing a link */}
          {detectedUrl && (
            <div className="mt-2">
              <LinkPreview url={detectedUrl} compact />
            </div>
          )}
        </div>
        <Button
          type="submit"
          disabled={(!newMessage.trim() && files.length === 0) || isDisabled}
          size="icon"
          className="flex-shrink-0 h-10 w-10 rounded-full bg-primary hover:bg-primary/90 shadow-md flex items-center justify-center"
          style={{ marginLeft: "2px", minWidth: 40, minHeight: 40 }}
        >
          {isDisabled ? <Loader className="h-4 w-4 animate-spin" /> : <Send className="h-5 w-5" />}
        </Button>
      </form>
    </div>
  );
};
