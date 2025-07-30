import { longFormatters } from "date-fns";

// Format price to currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(amount);
};

// Format date to readable string
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  }).format(new Date(date));
};

// Format date to month and year
export const formatMonthYear = (date: Date): string => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
  }).format(new Date(date));
};

// Generate random price for demo purposes
export const generatePrice = (min: number = 15, max: number = 100): number => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

// Handle file size formatting
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Truncate text with ellipsis
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

export const getCookie = (name: string): string | null => {
  const match = document.cookie.match(
    new RegExp("(^|;\\s*)" + name + "=([^;]*)")
  );
  return match ? decodeURIComponent(match[2]) : null;
};

import type React from "react";

interface FeedCardProps {
  post: {
    id: string;
    user: {
      username: string;
      profilePic: string;
    };
    content: string;
    image?: string;
    likes: number;
    comments: number;
    timeAgo: string;
  };
}

export const formatTimeAgo = (timeAgo: string | undefined | null): string => {
  // Handle undefined, null, or empty values
  if (!timeAgo) {
    return "just now";
  }

  // If it's already in the desired format, return as is
  if (timeAgo.includes("just now") || timeAgo.match(/^\d+[mhdwy]$/)) {
    return timeAgo;
  }

  // Convert common formats to abbreviated
  const timeMap: { [key: string]: string } = {
    "just now": "just now",
    "1 minute": "1m",
    "1 min": "1m",
    "2 minutes": "2m",
    "2 mins": "2m",
    "1 hour": "1h",
    "2 hours": "2h",
    "1 day": "1d",
    "2 days": "2d",
    "1 week": "1w",
    "2 weeks": "2w",
    "1 month": "1mo",
    "2 months": "2mo",
    "1 year": "1y",
    "2 years": "2y",
  };

  // Handle patterns like "2h", "5h", "1d" - convert to our format
  if (timeAgo.match(/^\d+h$/)) {
    return timeAgo; // Already in correct format
  }
  if (timeAgo.match(/^\d+d$/)) {
    return timeAgo; // Already in correct format
  }

  // For any other format, try to extract number and unit
  const match = timeAgo.match(
    /(\d+)\s*(minute|min|hour|day|week|month|year)s?/i
  );
  if (match) {
    const num = match[1];
    const unit = match[2].toLowerCase();

    switch (unit) {
      case "minute":
      case "min":
        return `${num}m`;
      case "hour":
        return `${num}h`;
      case "day":
        return `${num}d`;
      case "week":
        return `${num}w`;
      case "month":
        return `${num}mo`;
      case "year":
        return `${num}y`;
      default:
        return timeAgo;
    }
  }

  return timeAgo;
};
