import { useEffect, useRef, useState } from 'react'

interface UseVideoAutoPlayOptions {
  threshold?: number
  rootMargin?: string
  enablePictureInPicture?: boolean
  autoPlayWithSound?: boolean
}

export const useVideoAutoPlay = (
  videoRef: React.RefObject<HTMLVideoElement>,
  options: UseVideoAutoPlayOptions = {}
) => {
  const {
    threshold = 0.5,
    rootMargin = '0px',
    enablePictureInPicture = true,
    autoPlayWithSound = false
  } = options

  const [isInView, setIsInView] = useState(false)
  const [isAutoPlaying, setIsAutoPlaying] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const isProcessingRef = useRef(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleIntersection = async (entries: IntersectionObserverEntry[]) => {
      const entry = entries[0]
      const isCurrentlyInView = entry.isIntersecting
      
      // Prevent rapid state changes
      if (isProcessingRef.current) return
      isProcessingRef.current = true

      setIsInView(isCurrentlyInView)

      try {
        if (isCurrentlyInView) {
          // Video is in view - auto play
          console.log('Video entered view, attempting to play with sound:', autoPlayWithSound)
          if (video.paused) {
            // Set volume and muted state based on autoPlayWithSound
            if (autoPlayWithSound) {
              video.muted = false
              video.volume = 0.8 // Set reasonable volume
              console.log('Video unmuted, volume set to 0.8')
            } else {
              video.muted = true
              console.log('Video muted for auto-play')
            }
            
            // Ensure video is ready to play
            if (video.readyState >= 2) {
              await video.play()
              setIsAutoPlaying(true)
              console.log('Video started playing', autoPlayWithSound ? 'with sound' : 'muted')
            } else {
              // Wait for video to load
              const handleLoadedData = async () => {
                try {
                  await video.play()
                  setIsAutoPlaying(true)
                  console.log('Video started playing after loading', autoPlayWithSound ? 'with sound' : 'muted')
                } catch (error) {
                  console.log('Auto-play failed after loading:', error)
                }
                video.removeEventListener('loadeddata', handleLoadedData)
              }
              video.addEventListener('loadeddata', handleLoadedData)
            }
          }
        } else {
          // Video is out of view
          console.log('Video left view')
          
          if (document.pictureInPictureElement === video && enablePictureInPicture) {
            // If video is already in PiP, keep it playing
            console.log('Video in PiP mode, continuing to play')
            return
          }
          
          if (!video.paused) {
            if (enablePictureInPicture && document.pictureInPictureEnabled && video.readyState >= 2) {
              // Try to enter picture-in-picture mode
              try {
                console.log('Attempting to enter PiP mode')
                await video.requestPictureInPicture()
                console.log('Entered PiP mode successfully')
              } catch (pipError) {
                console.log('PiP failed, pausing video:', pipError)
                video.pause()
                setIsAutoPlaying(false)
              }
            } else {
              // Just pause the video
              console.log('Pausing video')
              video.pause()
              setIsAutoPlaying(false)
            }
          }
        }
      } catch (error) {
        console.log('Auto-play error:', error)
        setIsAutoPlaying(false)
      } finally {
        // Reset processing flag after a short delay
        setTimeout(() => {
          isProcessingRef.current = false
        }, 100)
      }
    }

    observerRef.current = new IntersectionObserver(handleIntersection, {
      threshold,
      rootMargin
    })

    observerRef.current.observe(video)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
      isProcessingRef.current = false
    }
  }, [videoRef, threshold, rootMargin, enablePictureInPicture, autoPlayWithSound])

  // Handle picture-in-picture events
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleEnterPiP = () => {
      console.log('Entered picture-in-picture mode')
    }

    const handleLeavePiP = () => {
      console.log('Left picture-in-picture mode')
      // If video left PiP and is not in view, pause it
      if (!isInView && !video.paused) {
        video.pause()
        setIsAutoPlaying(false)
      }
    }

    const handleLoadedData = () => {
      // Ensure video is ready for PiP when loaded
      console.log('Video data loaded, ready for interactions')
    }

    video.addEventListener('enterpictureinpicture', handleEnterPiP)
    video.addEventListener('leavepictureinpicture', handleLeavePiP)
    video.addEventListener('loadeddata', handleLoadedData)

    return () => {
      video.removeEventListener('enterpictureinpicture', handleEnterPiP)
      video.removeEventListener('leavepictureinpicture', handleLeavePiP)
      video.removeEventListener('loadeddata', handleLoadedData)
    }
  }, [videoRef, isInView])

  return {
    isInView,
    isAutoPlaying
  }
}
