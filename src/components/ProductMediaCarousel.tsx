import { useState } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProductMediaCarouselProps {
  mainImage: string;
  additionalImages: string[];
  video?: string;
}

export default function ProductMediaCarousel({ mainImage, additionalImages, video }: ProductMediaCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Combine all media items
  const mediaItems = [
    { type: 'image', url: mainImage },
    ...additionalImages.map(url => ({ type: 'image', url })),
    ...(video ? [{ type: 'video', url: video }] : [])
  ];

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === mediaItems.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? mediaItems.length - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="relative">
      {/* Main Carousel */}
      <div className="relative aspect-square overflow-hidden rounded-lg bg-white">
        {mediaItems[currentIndex].type === 'video' ? (
          <div className="relative w-full h-full">
            <video
              src={mediaItems[currentIndex].url}
              controls
              className="w-full h-full object-contain"
              poster={mainImage}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Play className="h-16 w-16 text-white opacity-50" />
            </div>
          </div>
        ) : (
          <img
            src={mediaItems[currentIndex].url}
            alt="Product"
            className="w-full h-full object-contain"
          />
        )}
      </div>

      {/* Navigation Buttons */}
      {mediaItems.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
            onClick={prevSlide}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
            onClick={nextSlide}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}

      {/* Thumbnails */}
      {mediaItems.length > 1 && (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {mediaItems.map((item, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`flex-shrink-0 border-2 rounded overflow-hidden ${
                currentIndex === index ? 'border-primary' : 'border-transparent'
              }`}
            >
              {item.type === 'video' ? (
                <div className="relative w-16 h-16">
                  <img
                    src={mainImage}
                    alt="Video thumbnail"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Play className="h-6 w-6 text-white" />
                  </div>
                </div>
              ) : (
                <img
                  src={item.url}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-16 h-16 object-cover"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 