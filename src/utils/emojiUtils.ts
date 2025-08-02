// Utility functions for emoji handling

export const isSingleEmoji = (text: string): boolean => {
  if (!text || typeof text !== 'string') return false;
  
  // Remove whitespace
  const trimmed = text.trim();
  
  // Check if it's a single emoji using regex
  // This regex matches most common emoji patterns
  const emojiRegex = /^[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F018}-\u{1F270}]|[\u{238C}-\u{2454}]|[\u{20D0}-\u{20FF}]$/u;
  
  // Also check for common text-based emoticons
  const emoticonRegex = /^(:\)|:\(|:D|:P|:o|:O|<3|>:\(|:\*|;-?\)|8-?\)|:-?\||:-?\/|:-?\\|:-?\[|:-?\]|:-?\{|:-?\}|:-?@|:-?#|:-?\$|:-?%|:-?\^|:-?&|:-?\*|:-?\+|:-?=|:-?_|:-?`|:-?~|:-?')$/;
  
  return emojiRegex.test(trimmed) || emoticonRegex.test(trimmed);
};

export const isOnlyEmojis = (text: string): boolean => {
  if (!text || typeof text !== 'string') return false;
  
  // Remove whitespace
  const trimmed = text.trim();
  
  // Check if the entire string consists only of emojis
  const emojiRegex = /^[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F018}-\u{1F270}\u{238C}-\u{2454}\u{20D0}-\u{20FF}\s]*$/u;
  
  return emojiRegex.test(trimmed) && trimmed.length > 0;
};