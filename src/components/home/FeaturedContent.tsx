
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FeaturedContentProps {
  title: string;
  description?: string;
  image?: string;
  type?: "movie" | "series" | "live";
  onPlay?: () => void;
}

const FeaturedContent = ({
  title,
  description,
  image,
  type = "movie",
  onPlay,
}: FeaturedContentProps) => {
  // Default hero image if none provided
  const defaultImage = "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?q=80&w=2070";
  const imageUrl = image || defaultImage;
  
  return (
    <div className="relative w-full h-[50vh] md:h-[70vh] overflow-hidden -mt-20">
      {/* Background image with gradient overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ 
          backgroundImage: `url(${imageUrl})`,
        }}
      >
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/30 to-transparent"></div>
      </div>
      
      {/* Content overlay */}
      <div className="relative z-10 container h-full flex flex-col justify-end pb-10 md:pb-20 pt-32">
        <div className="max-w-xl animate-fade-in">
          <div className="mb-3">
            <span className="px-2 py-1 bg-streaming-purple rounded-sm text-xs uppercase font-semibold">
              {type === "movie" ? "Movie" : type === "series" ? "Series" : "Live"}
            </span>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-bold mb-3 text-white">{title}</h1>
          
          {description && (
            <p className="text-sm md:text-base text-gray-200 line-clamp-3 mb-6">{description}</p>
          )}
          
          <Button 
            className="bg-streaming-purple hover:bg-streaming-purple/90 gap-2"
            onClick={onPlay}
          >
            <Play size={16} />
            Play Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FeaturedContent;
