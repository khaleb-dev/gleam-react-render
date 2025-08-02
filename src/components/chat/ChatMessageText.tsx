
import React from "react";
import { LinkPreview } from "./LinkPreview";

// Simple regex to match all URLs (can be improved further for edge cases)
const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/gi;

// Makes sure links without protocol get "https://" for href attribute
function normalizeUrl(url: string) {
  return url.startsWith("http://") || url.startsWith("https://")
    ? url
    : `https://${url}`;
}

interface ChatMessageTextProps {
  text: string;
  isOwn?: boolean;
}

export const ChatMessageText: React.FC<ChatMessageTextProps> = ({
  text,
  isOwn = false
}) => {
  if (!text) return null;

  // Split text into parts: plain text and links
  const parts = [];
  const urls = [];
  let lastIdx = 0;
  let match;

  // Regenerate regex for each run to reset state
  const regex = new RegExp(urlRegex);
  while ((match = regex.exec(text)) !== null) {
    // Push preceding text
    if (match.index > lastIdx) {
      parts.push(text.slice(lastIdx, match.index));
    }
    // Push link
    const url = match[0];
    urls.push(url);
    parts.push(
      <a
        key={match.index}
        href={normalizeUrl(url)}
        target="_blank"
        rel="noopener noreferrer"
        className={`underline break-all transition-colors ${
          isOwn 
            ? "text-white hover:text-white/80" 
            : "text-white hover:text-white/80"
        }`}
      >
        {url}
      </a>
    );
    lastIdx = match.index + url.length;
  }
  // Push trailing text
  if (lastIdx < text.length) {
    parts.push(text.slice(lastIdx));
  }

  return (
    <div>
      <span>{parts.length ? parts : text}</span>
      {/* Show link preview for the first URL found */}
      {urls.length > 0 && (
        <div className="mt-2">
          <LinkPreview url={urls[0]} compact />
        </div>
      )}
    </div>
  );
};
