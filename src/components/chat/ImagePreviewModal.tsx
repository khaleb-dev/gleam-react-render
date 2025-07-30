import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, X } from 'lucide-react';

interface ImagePreviewModalProps {
  images: string[];
  startIndex: number;
  onClose: () => void;
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ images, startIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = React.useState(startIndex);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };
  
  if (!images || images.length === 0) {
    return null;
  }

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl w-full h-[90vh] p-0 flex flex-col bg-black/80 border-none">
        <DialogHeader className="p-4 text-white flex-row justify-between items-center">
            <DialogTitle>{`Image ${currentIndex + 1} of ${images.length}`}</DialogTitle>
            <DialogClose asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 hover:text-white">
                    <X className="h-6 w-6" />
                </Button>
            </DialogClose>
        </DialogHeader>
        <div className="flex-1 flex items-center justify-center relative min-h-0">
          {images.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white bg-black/30 hover:bg-black/50"
              onClick={goToPrev}
            >
              <ArrowLeft />
            </Button>
          )}

          <img
            src={images[currentIndex]}
            alt={`Preview ${currentIndex + 1}`}
            className="max-w-full max-h-full object-contain"
          />

          {images.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white bg-black/30 hover:bg-black/50"
              onClick={goToNext}
            >
              <ArrowRight />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
