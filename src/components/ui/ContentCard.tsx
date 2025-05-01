
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Play } from "lucide-react";

interface ContentCardProps {
  title: string;
  image?: string;
  aspectRatio?: "portrait" | "landscape";
  onClick?: () => void;
  subtitle?: string;
}

const ContentCard = ({
  title,
  image,
  aspectRatio = "portrait",
  onClick,
  subtitle,
}: ContentCardProps) => {
  const [imageError, setImageError] = useState(false);
  
  // Default image if the provided one fails to load
  const handleImageError = () => {
    setImageError(true);
  };

  const placeholderImage = aspectRatio === "portrait" 
    ? "https://via.placeholder.com/300x450?text=No+Image"
    : "https://via.placeholder.com/400x225?text=No+Image";

  return (
    <Card 
      className="content-card cursor-pointer overflow-hidden border-0 bg-transparent"
      onClick={onClick}
    >
      <div 
        className={`relative ${aspectRatio === "portrait" ? "aspect-[2/3]" : "aspect-video"}`}
      >
        <img
          src={imageError ? placeholderImage : (image || placeholderImage)}
          alt={title}
          onError={handleImageError}
          className="h-full w-full object-cover rounded-md"
        />
        
        <div className="content-card-overlay flex flex-col justify-end p-3">
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <div className="rounded-full bg-streaming-purple p-3">
              <Play className="h-6 w-6 text-white" />
            </div>
          </div>
          
          <div className="mt-auto">
            <h3 className="font-medium text-white text-sm md:text-base line-clamp-1">{title}</h3>
            {subtitle && (
              <p className="text-gray-300 text-xs">{subtitle}</p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ContentCard;
