export const isVideoUrl = (url: string): boolean => {
  const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.m4v']
  const urlLower = url.toLowerCase()
  return videoExtensions.some(ext => urlLower.includes(ext))
}

export const isImageUrl = (url: string): boolean => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp']
  const urlLower = url.toLowerCase()
  return imageExtensions.some(ext => urlLower.includes(ext))
}

export const getMediaType = (url: string): 'image' | 'video' | 'unknown' => {
  if (isVideoUrl(url)) return 'video'
  if (isImageUrl(url)) return 'image'
  return 'unknown'
}
