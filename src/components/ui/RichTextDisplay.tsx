import React from "react";
import { LinkPreview } from "@/components/chat/LinkPreview";

// URL regex to match all URLs
const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/gi;

// Function to normalize URLs
function normalizeUrl(url: string) {
  return url.startsWith("http://") || url.startsWith("https://")
    ? url
    : `https://${url}`;
}

interface RichTextDisplayProps {
  text: string;
  className?: string;
  showLinkPreview?: boolean;
}

export const RichTextDisplay: React.FC<RichTextDisplayProps> = ({
  text,
  className = "",
  showLinkPreview = true
}) => {
  if (!text) return null;

  // Check if text contains HTML tags (from rich text editor)
  const isHtmlContent = /<[^>]+>/.test(text);
  
  if (isHtmlContent) {
    // Clean HTML content to remove any inline styles and background colors
    const cleanHtml = (html: string) => {
      // Remove all inline styles
      let cleaned = html.replace(/style="[^"]*"/gi, '');
      
      // Remove specific problematic attributes
      cleaned = cleaned.replace(/background[^;]*;?/gi, '');
      cleaned = cleaned.replace(/color[^;]*;?/gi, '');
      
      // Remove empty style attributes
      cleaned = cleaned.replace(/style=""/gi, '');
      
      return cleaned;
    };

    // Handle HTML content from rich text editor
    const extractUrls = (htmlText: string): string[] => {
      const urls: string[] = [];
      const urlMatches = htmlText.match(urlRegex);
      if (urlMatches) {
        urls.push(...urlMatches.map(url => normalizeUrl(url)));
      }
      return urls;
    };

    const cleanedText = cleanHtml(text);
    const urls = extractUrls(cleanedText);

    return (
      <div className={className}>
        <div 
          className="rich-text-content text-foreground"
          dangerouslySetInnerHTML={{ __html: cleanedText }}
        />
        {/* Show link preview for the first URL found */}
        {showLinkPreview && urls.length > 0 && (
          <div className="mt-3">
            <LinkPreview url={urls[0]} compact />
          </div>
        )}
        <style>{`
          .rich-text-content {
            color: hsl(var(--foreground)) !important;
          }
          
          .rich-text-content * {
            color: inherit !important;
            background: transparent !important;
          }
          
          .rich-text-content ul {
            list-style-type: disc;
            margin-left: 20px;
            margin-bottom: 10px;
          }
          
          .rich-text-content li {
            margin-bottom: 5px;
            color: inherit !important;
          }
          
          .rich-text-content strong {
            font-weight: bold;
            color: inherit !important;
          }
          
          .rich-text-content em {
            font-style: italic;
            color: inherit !important;
          }
          
          .rich-text-content p {
            margin-bottom: 10px;
            color: inherit !important;
          }
          
          .rich-text-content a {
            color: hsl(var(--primary)) !important;
            text-decoration: underline;
            word-break: break-all;
          }
          
          .rich-text-content a:hover {
            color: hsl(var(--primary)) !important;
            opacity: 0.8;
          }
        `}</style>
      </div>
    );
  }

  // Parse and format markdown-style text (existing logic)
  const parseText = (inputText: string) => {
    let processedText = inputText;
    const urls: string[] = [];
    const components: React.ReactNode[] = [];

    // Split text by lines first to handle paragraphs and lists
    const lines = processedText.split('\n');
    
    lines.forEach((line, lineIndex) => {
      if (line.trim() === '') {
        // Empty line - add spacing
        if (lineIndex > 0) {
          components.push(<br key={`br-${lineIndex}`} />);
        }
        return;
      }

      // Check for list items (- or * or numbered)
      const isListItem = /^[\s]*[-*]\s/.test(line) || /^[\s]*\d+\.\s/.test(line);
      
      if (isListItem) {
        // Handle list items
        const listContent = line.replace(/^[\s]*[-*]\s/, '').replace(/^[\s]*\d+\.\s/, '');
        const formattedContent = formatInlineText(listContent, urls);
        components.push(
          <div key={`list-${lineIndex}`} className="flex items-start space-x-2 mb-1">
            <span className="text-muted-foreground mt-1">•</span>
            <span>{formattedContent}</span>
          </div>
        );
      } else {
        // Handle regular paragraphs
        const formattedContent = formatInlineText(line, urls);
        components.push(
          <div key={`para-${lineIndex}`} className={lineIndex > 0 ? "mt-2" : ""}>
            {formattedContent}
          </div>
        );
      }
    });

    return { components, urls };
  };

  // Format inline text (bold, italic, links)
  const formatInlineText = (text: string, urls: string[]) => {
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let partIndex = 0;

    // Process text character by character to handle formatting
    while (remaining.length > 0) {
      // Check for URLs first
      const urlMatch = remaining.match(urlRegex);
      if (urlMatch && urlMatch.index === 0) {
        const url = urlMatch[0];
        urls.push(url);
        parts.push(
          <a
            key={`url-${partIndex++}`}
            href={normalizeUrl(url)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 underline break-all"
          >
            {url}
          </a>
        );
        remaining = remaining.slice(url.length);
        continue;
      }

      // Check for bold text (**text** or __text__)
      const boldMatch = remaining.match(/^(\*\*|__)(.*?)\1/);
      if (boldMatch) {
        parts.push(
          <strong key={`bold-${partIndex++}`} className="font-bold">
            {boldMatch[2]}
          </strong>
        );
        remaining = remaining.slice(boldMatch[0].length);
        continue;
      }

      // Check for italic text (*text* or _text_)
      const italicMatch = remaining.match(/^(\*|_)(.*?)\1/);
      if (italicMatch && !remaining.startsWith('**') && !remaining.startsWith('__')) {
        parts.push(
          <em key={`italic-${partIndex++}`} className="italic">
            {italicMatch[2]}
          </em>
        );
        remaining = remaining.slice(italicMatch[0].length);
        continue;
      }

      // Check for inline code `code`
      const codeMatch = remaining.match(/^`(.*?)`/);
      if (codeMatch) {
        parts.push(
          <code key={`code-${partIndex++}`} className="bg-muted px-1 py-0.5 rounded text-sm font-mono">
            {codeMatch[1]}
          </code>
        );
        remaining = remaining.slice(codeMatch[0].length);
        continue;
      }

      // No special formatting found, add the next character as regular text
      const nextChar = remaining.charAt(0);
      const lastPart = parts[parts.length - 1];
      
      if (typeof lastPart === 'string') {
        parts[parts.length - 1] = lastPart + nextChar;
      } else {
        parts.push(nextChar);
      }
      
      remaining = remaining.slice(1);
    }

    return parts;
  };

  const { components, urls } = parseText(text);

  return (
    <div className={`text-foreground ${className}`}>
      {components}
      {/* Show link preview for the first URL found */}
      {showLinkPreview && urls.length > 0 && (
        <div className="mt-3">
          <LinkPreview url={urls[0]} compact />
        </div>
      )}
    </div>
  );
};
