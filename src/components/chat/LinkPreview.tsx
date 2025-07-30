import React, { useEffect, useState } from "react";
import { Link as LucideLink } from "lucide-react";

type LinkPreviewProps = {
  url: string;
  className?: string;
  compact?: boolean;
};

type PreviewData = {
  url: string;
  title?: string;
  description?: string;
  images?: string[];
  domain?: string;
};

function sanitizeUrl(url: string) {
  // force http/https (for og API)
  return url.startsWith("http") ? url : `https://${url}`;
}

export const LinkPreview: React.FC<LinkPreviewProps> = ({
  url,
  className = "",
  compact = false,
}) => {
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fail, setFail] = useState(false);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setFail(false);

    // Prevent calls for nonsense (basic url validation)
    const basicCheck = /^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(url);
    if (!basicCheck) {
      setFail(true);
      setLoading(false);
      return;
    }

    fetch(`https://jsonlink.io/api/extract?url=${encodeURIComponent(url)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!ignore && data && (data.title || data.description)) {
          setPreview({
            url,
            title: data.title,
            description: data.description,
            images: data.images,
            domain: data.hostname || data.url,
          });
        } else if (!ignore) {
          setFail(true);
        }
      })
      .catch(() => !ignore && setFail(true))
      .finally(() => !ignore && setLoading(false));
    return () => {
      ignore = true;
    };
  }, [url]);

  if (fail || (!preview && !loading)) return null;
  if (loading) return (
    <div className={`flex items-center gap-2 text-xs text-muted-foreground px-3 py-2 ${className}`}>
      <LucideLink className="w-4 h-4 animate-spin" /> <span>Loading preview…</span>
    </div>
  );
  if (!preview) return null;

  return (
    <a 
      href={sanitizeUrl(url)} 
      className={`block rounded-xl border border-gray-200 bg-white shadow hover:shadow-md transition cursor-pointer overflow-hidden ${compact ? "max-w-xs" : ""} ${className}`}
      target="_blank" rel="noopener noreferrer"
      tabIndex={0}
      aria-label={preview.title ? `Link preview: ${preview.title}` : "Link preview"}
    >
      <div className="flex">
        {preview.images && preview.images.length > 0 && (
          <img 
            src={preview.images[0]} 
            alt={preview.title || "Preview"} 
            className="object-cover w-20 h-20 flex-shrink-0 border-r border-gray-100"
            style={{ minWidth: 80, minHeight: 80 }}
            onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
          />
        )}
        <div className="p-3 flex-1 flex flex-col justify-center">
          <div className="flex items-center text-xs text-primary gap-1 mb-1">
            <LucideLink className="w-3 h-3 -mt-0.5" />
            <span className="truncate">{preview.domain?.replace(/^https?:\/\//, "")}</span>
          </div>
          {preview.title && (
            <div className="font-medium text-gray-900 text-sm leading-tight truncate">{preview.title}</div>
          )}
          {preview.description && (
            <div className="text-xs text-gray-600 truncate">{preview.description}</div>
          )}
        </div>
      </div>
    </a>
  );
};
