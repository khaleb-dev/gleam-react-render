"use client"

import React, { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { RotateCcw, ZoomIn, ZoomOut, Move } from "lucide-react"

interface CoverPhotoEditorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  image: File | null
  onSave: (adjustedImage: Blob) => void
}

export const CoverPhotoEditor: React.FC<CoverPhotoEditorProps> = ({
  open,
  onOpenChange,
  image,
  onSave
}) => {
  const [zoom, setZoom] = useState([1])
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [rotation, setRotation] = useState([0])
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const [imageLoaded, setImageLoaded] = useState(false)

  React.useEffect(() => {
    if (image && open) {
      const img = new Image()
      img.onload = () => {
        setImageLoaded(true)
        if (imageRef.current) {
          imageRef.current.src = img.src
        }
      }
      img.src = URL.createObjectURL(image)
    }
  }, [image, open])

  const handleSave = async () => {
    if (!canvasRef.current || !imageRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas dimensions for cover photo (16:9 aspect ratio)
    canvas.width = 1200
    canvas.height = 300

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Save context
    ctx.save()

    // Apply transformations
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.rotate((rotation[0] * Math.PI) / 180)
    ctx.scale(zoom[0], zoom[0])
    ctx.translate(-canvas.width / 2 + position.x, -canvas.height / 2 + position.y)

    // Draw image
    ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height)

    // Restore context
    ctx.restore()

    // Convert to blob
    canvas.toBlob((blob) => {
      if (blob) {
        onSave(blob)
        onOpenChange(false)
      }
    }, 'image/jpeg', 0.9)
  }

  const resetAdjustments = () => {
    setZoom([1])
    setPosition({ x: 0, y: 0 })
    setRotation([0])
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Adjust Cover Photo</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Preview Area */}
          <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
            {image && (
              <img
                ref={imageRef}
                alt="Cover preview"
                className="w-full h-full object-cover transition-transform duration-200"
                style={{
                  transform: `scale(${zoom[0]}) rotate(${rotation[0]}deg) translate(${position.x}px, ${position.y}px)`,
                }}
              />
            )}
          </div>

          {/* Controls */}
          <div className="space-y-4">
            {/* Zoom Control */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <ZoomIn className="h-4 w-4" />
                Zoom: {zoom[0].toFixed(1)}x
              </label>
              <Slider
                value={zoom}
                onValueChange={setZoom}
                min={0.5}
                max={3}
                step={0.1}
                className="w-full"
              />
            </div>

            {/* Rotation Control */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <RotateCcw className="h-4 w-4" />
                Rotation: {rotation[0]}°
              </label>
              <Slider
                value={rotation}
                onValueChange={setRotation}
                min={-180}
                max={180}
                step={1}
                className="w-full"
              />
            </div>

            {/* Position Controls */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">X Position</label>
                <Slider
                  value={[position.x]}
                  onValueChange={(value) => setPosition(prev => ({ ...prev, x: value[0] }))}
                  min={-100}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Y Position</label>
                <Slider
                  value={[position.y]}
                  onValueChange={(value) => setPosition(prev => ({ ...prev, y: value[0] }))}
                  min={-100}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>

            {/* Reset Button */}
            <Button variant="outline" onClick={resetAdjustments} className="w-full">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Adjustments
            </Button>
          </div>

          {/* Hidden canvas for processing */}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!imageLoaded}>
            Save Cover Photo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}