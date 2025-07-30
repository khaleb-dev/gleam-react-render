import React, { createContext, useContext, useRef, ReactNode } from 'react'

interface VideoContextType {
  currentVideoRef: React.MutableRefObject<HTMLVideoElement | null>
  stopAllVideos: () => void
  setCurrentVideo: (video: HTMLVideoElement) => void
}

const VideoContext = createContext<VideoContextType | undefined>(undefined)

export const useVideoContext = () => {
  const context = useContext(VideoContext)
  if (!context) {
    throw new Error('useVideoContext must be used within a VideoProvider')
  }
  return context
}

interface VideoProviderProps {
  children: ReactNode
}

export const VideoProvider: React.FC<VideoProviderProps> = ({ children }) => {
  const currentVideoRef = useRef<HTMLVideoElement | null>(null)
  const allVideosRef = useRef<Set<HTMLVideoElement>>(new Set())

  const stopAllVideos = () => {
    allVideosRef.current.forEach(video => {
      if (!video.paused) {
        video.pause()
      }
    })
  }

  const setCurrentVideo = (video: HTMLVideoElement) => {
    // Pause the current video if it's different
    if (currentVideoRef.current && currentVideoRef.current !== video && !currentVideoRef.current.paused) {
      currentVideoRef.current.pause()
    }
    
    // Add to the set of all videos
    allVideosRef.current.add(video)
    
    // Set as current
    currentVideoRef.current = video
  }

  return (
    <VideoContext.Provider value={{ currentVideoRef, stopAllVideos, setCurrentVideo }}>
      {children}
    </VideoContext.Provider>
  )
}
