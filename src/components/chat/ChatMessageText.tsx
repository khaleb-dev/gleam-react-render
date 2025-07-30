import React from "react";

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
    parts.push(
      <a
        key={match.index}
        href={normalizeUrl(url)}
        target="_blank"
        rel="noopener noreferrer"
        // Use dark color for white bubbles, white for own messages (colored bubbles)
        className={
          isOwn
            ? "text-white underline break-all transition-colors"
            : "text-primary underline break-all transition-colors hover:text-primary/80"
        }
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

  return <span>{parts.length ? parts : text}</span>;
};
