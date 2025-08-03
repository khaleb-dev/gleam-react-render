import React, { useRef, useState, useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, Loader2 } from 'lucide-react'
import { Button } from './button'
import { Slider } from './slider'
import { useVideoAutoPlay } from '@/hooks/useVideoAutoPlay'
import { useVideoContext } from '@/context/VideoContext'

interface VideoPlayerProps {
  src: string
  className?: string
  autoPlay?: boolean
  muted?: boolean
  enableScrollAutoPlay?: boolean
  enablePictureInPicture?: boolean
  autoPlayWithSound?: boolean
  showMinimalControls?: boolean
  enableClickToPlay?: boolean
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  className = "",
  autoPlay = false,
  muted = false,
  enableScrollAutoPlay = true,
  enablePictureInPicture = true,
  autoPlayWithSound = false,
  showMinimalControls = false,
  enableClickToPlay = false
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(autoPlayWithSound ? false : muted)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(autoPlayWithSound ? 0.8 : 1)
  const [showControls, setShowControls] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [hasNetworkError, setHasNetworkError] = useState(false)
  const controlsTimeoutRef = useRef<NodeJS.Timeout>()
  const { setCurrentVideo } = useVideoContext()

  // Use auto-play hook if enabled
  const autoPlayResult = enableScrollAutoPlay ? useVideoAutoPlay(
    videoRef,
    {
      threshold: 0.5,
      enablePictureInPicture: enablePictureInPicture,
      autoPlayWithSound: autoPlayWithSound
    }
  ) : { isInView: true, isAutoPlaying: false }
  
  const { isInView, isAutoPlaying } = autoPlayResult

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Set initial video properties
    video.muted = autoPlayWithSound ? false : true
    video.volume = autoPlayWithSound ? 0.8 : 1
    
    console.log('Video initialized with autoPlayWithSound:', autoPlayWithSound)
    console.log('Video muted:', video.muted, 'Volume:', video.volume)

    const updateTime = () => setCurrentTime(video.currentTime)
    const updateDuration = () => setDuration(video.duration)
    
    const handlePlay = () => {
      console.log('Video started playing')
      setIsPlaying(true)
    }
    
    const handlePause = () => {
      console.log('Video paused')
      setIsPlaying(false)
    }
    
    const handleEnded = () => {
      console.log('Video ended')
      setIsPlaying(false)
    }

    const handleLoadStart = () => {
      setIsLoading(true)
      setHasNetworkError(false)
    }

    const handleCanPlay = () => {
      setIsLoading(false)
      setHasNetworkError(false)
    }

    const handleWaiting = () => {
      setIsLoading(true)
    }

    const handleError = () => {
      setIsLoading(false)
      setHasNetworkError(true)
      console.error('Video playback error')
    }

    const handleStalled = () => {
      setIsLoading(true)
    }
    
    video.addEventListener('timeupdate', updateTime)
    video.addEventListener('loadedmetadata', updateDuration)
    video.addEventListener('ended', handleEnded)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('loadstart', handleLoadStart)
    video.addEventListener('canplay', handleCanPlay)
    video.addEventListener('waiting', handleWaiting)
    video.addEventListener('error', handleError)
    video.addEventListener('stalled', handleStalled)

    return () => {
      video.removeEventListener('timeupdate', updateTime)
      video.removeEventListener('loadedmetadata', updateDuration)
      video.removeEventListener('ended', handleEnded)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('loadstart', handleLoadStart)
      video.removeEventListener('canplay', handleCanPlay)
      video.removeEventListener('waiting', handleWaiting)
      video.removeEventListener('error', handleError)
      video.removeEventListener('stalled', handleStalled)
    }
  }, [autoPlayWithSound])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      // Set this video as the current playing video
      setCurrentVideo(video)
      // Ensure video is unmuted when playing manually
      if (video.muted && !autoPlayWithSound) {
        video.muted = false
        setIsMuted(false)
      }
      video.play().catch((error) => {
        console.error('Error playing video:', error)
        setHasNetworkError(true)
      })
    }
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return

    video.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const handleSeek = (value: number[]) => {
    const video = videoRef.current
    if (!video) return

    video.currentTime = value[0]
    setCurrentTime(value[0])
  }

  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current
    if (!video) return

    const newVolume = value[0]
    video.volume = newVolume
    setVolume(newVolume)
    
    if (newVolume === 0) {
      setIsMuted(true)
      video.muted = true
    } else if (isMuted) {
      setIsMuted(false)
      video.muted = false
    }
  }

  const skipBackward = () => {
    const video = videoRef.current
    if (!video) return

    video.currentTime = Math.max(0, video.currentTime - 5)
  }

  const skipForward = () => {
    const video = videoRef.current
    if (!video) return

    video.currentTime = Math.min(duration, video.currentTime + 5)
  }

  const showControlsTemporarily = () => {
    setShowControls(true)
    
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false)
    }, 3000)
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div 
      className={`relative group ${className}`}
      onClick={enableClickToPlay ? togglePlay : undefined}
      onMouseMove={showControlsTemporarily}
      onMouseLeave={() => {
        if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current)
        }
        setShowControls(false)
      }}
    >
      <video
        ref={videoRef}
        src={src}
        className={`w-full h-full object-cover bg-black ${showMinimalControls ? 'rounded-lg' : ''}`}
        autoPlay={false} // Let the hook handle auto-play
        muted={autoPlayWithSound ? false : true}
        playsInline
        preload="metadata"
      />
      
      {/* Controls Overlay */}
      <div 
        className={`absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent transition-opacity duration-300 ${
          showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Play Button Overlay */}
        {!isPlaying && !isLoading && (enableClickToPlay || !showMinimalControls) && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              size="lg"
              variant="secondary"
              className="rounded-full bg-white/20 hover:bg-white/30 hover:bg-primary/20 backdrop-blur-sm border border-white/20"
              onClick={togglePlay}
            >
              <Play className="h-8 w-8 text-white fill-white" />
            </Button>
          </div>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black/50 rounded-full p-4 backdrop-blur-sm">
              <Loader2 className="h-8 w-8 text-white animate-spin" />
            </div>
          </div>
        )}

        {/* Network Error Indicator */}
        {hasNetworkError && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-red-500/20 rounded-lg p-4 backdrop-blur-sm border border-red-500/30">
              <p className="text-white text-sm text-center">Network error. Tap to retry.</p>
              <Button
                size="sm"
                variant="secondary"
                className="mt-2 w-full bg-white/20 hover:bg-white/30 border border-white/20"
                onClick={() => {
                  setHasNetworkError(false)
                  togglePlay()
                }}
              >
                Retry
              </Button>
            </div>
          </div>
        )}
        
        {/* Bottom Controls */}
        {!showMinimalControls && (
          <div className="absolute bottom-0 left-0 right-0 p-4">
            {/* Progress Bar */}
            <div className="mb-3">
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={1}
                onValueChange={handleSeek}
                className="w-full [&>:first-child]:h-1 [&_[role=slider]]:h-3 [&_[role=slider]]:w-3 [&_[role=slider]]:border-white [&_.bg-primary]:bg-white [&_.bg-secondary]:bg-white/30"
              />
            </div>
            
            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20 hover:bg-primary/10"
                  onClick={togglePlay}
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20 hover:bg-primary/10"
                  onClick={skipBackward}
                >
                  <SkipBack className="h-4 w-4" />
                </Button>
                
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20 hover:bg-primary/10"
                  onClick={skipForward}
                >
                  <SkipForward className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/20 hover:bg-primary/10"
                    onClick={toggleMute}
                  >
                    {isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                  
                  <div className="w-20">
                    <Slider
                      value={[isMuted ? 0 : volume]}
                      max={1}
                      step={0.1}
                      onValueChange={handleVolumeChange}
                      className="[&>:first-child]:h-1 [&_[role=slider]]:h-3 [&_[role=slider]]:w-3 [&_[role=slider]]:border-white [&_.bg-primary]:bg-white [&_.bg-secondary]:bg-white/30"
                    />
                  </div>
                </div>
              </div>
              
              <div className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>
          </div>
        )}

        {/* Minimal Controls - Just progress bar and play button */}
        {showMinimalControls && (
          <div className="absolute bottom-0 left-0 right-0 p-2">
            {/* Progress Bar */}
            <div className="mb-2">
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={1}
                onValueChange={handleSeek}
                className="w-full [&>:first-child]:h-1 [&_[role=slider]]:h-3 [&_[role=slider]]:w-3 [&_[role=slider]]:border-white [&_.bg-primary]:bg-white [&_.bg-secondary]:bg-white/30"
              />
            </div>
            
            {/* Just play/pause button */}
            <div className="flex items-center justify-center">
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20 hover:bg-primary/10"
                onClick={togglePlay}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
