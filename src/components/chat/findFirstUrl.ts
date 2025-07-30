export function findFirstUrl(str: string): string | null {
  if (!str) return null;
  // Regex for matching URLs
  const match = str.match(/(https?:\/\/[^\s]+)|(www\.[^\s]+)/i);
  if (match && match[0]) {
    // always return with http/https
    let url = match[0];
    if (!/^https?:\/\//i.test(url)) url = "https://" + url;
    return url;
  }
  return null;
}
