
import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ContentCard from "@/components/ui/ContentCard";
import { Button } from "@/components/ui/button";

interface ContentRowProps {
  title: string;
  items: {
    id: number | string;
    title: string;
    image?: string;
    subtitle?: string;
  }[];
  onItemClick: (item: any) => void;
  aspectRatio?: "portrait" | "landscape";
}

const ContentRow = ({ title, items, onItemClick, aspectRatio = "portrait" }: ContentRowProps) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  
  const scroll = (direction: "left" | "right") => {
    if (rowRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
      
      // Calculate scroll distance (about 80% of container width)
      const scrollDistance = Math.floor(clientWidth * 0.8);
      
      const newScrollLeft = direction === "right" 
        ? scrollLeft + scrollDistance 
        : scrollLeft - scrollDistance;
      
      rowRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });
      
      // Update arrow visibility after scroll
      setTimeout(() => {
        if (!rowRef.current) return;
        
        setShowLeftArrow(rowRef.current.scrollLeft > 0);
        setShowRightArrow(
          rowRef.current.scrollLeft + rowRef.current.clientWidth < rowRef.current.scrollWidth - 10
        );
      }, 300);
    }
  };
  
  if (!items || items.length === 0) {
    return null;
  }
  
  return (
    <div className="my-8 animate-fade-in">
      <h2 className="text-xl md:text-2xl font-semibold mb-4">{title}</h2>
      
      <div className="relative group">
        {/* Left scroll arrow */}
        {showLeftArrow && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 rounded-full p-1.5"
            onClick={() => scroll("left")}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
        )}
        
        {/* Row container */}
        <div 
          ref={rowRef}
          className="flex gap-4 overflow-x-auto pb-4 scrollbar-none scroll-smooth"
          onScroll={() => {
            if (!rowRef.current) return;
            setShowLeftArrow(rowRef.current.scrollLeft > 0);
            setShowRightArrow(
              rowRef.current.scrollLeft + rowRef.current.clientWidth < rowRef.current.scrollWidth - 10
            );
          }}
        >
          {items.map((item) => (
            <div 
              key={item.id} 
              className={aspectRatio === "portrait" ? "flex-shrink-0 w-32 md:w-44" : "flex-shrink-0 w-64 md:w-80"}
            >
              <ContentCard
                title={item.title}
                image={item.image}
                aspectRatio={aspectRatio}
                subtitle={item.subtitle}
                onClick={() => onItemClick(item)}
              />
            </div>
          ))}
        </div>
        
        {/* Right scroll arrow */}
        {showRightArrow && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 rounded-full p-1.5"
            onClick={() => scroll("right")}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default ContentRow;
