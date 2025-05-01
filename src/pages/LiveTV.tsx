
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import ContentCard from "@/components/ui/ContentCard";
import { Button } from "@/components/ui/button";
import { Category, LiveChannel } from "@/types";
import { getLiveCategories, getLiveChannels, getLiveStreamUrl } from "@/services/api";
import { toast } from "@/components/ui/sonner";

const LiveTV = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [channels, setChannels] = useState<LiveChannel[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadCategories = async () => {
      try {
        console.log("Fetching live TV categories...");
        const categoriesData = await getLiveCategories();
        console.log("Live TV categories received:", categoriesData);
        
        if (!categoriesData || categoriesData.length === 0) {
          console.log("No live TV categories found");
          setError("No categories found. Please check your connection.");
          setLoading(false);
          return;
        }
        
        setCategories(categoriesData);
        
        // Select the first category by default if there are categories
        if (categoriesData.length > 0) {
          setSelectedCategory(categoriesData[0].category_id);
        }
      } catch (error) {
        console.error("Error loading categories:", error);
        setError("Failed to load categories. Please check your connection.");
        toast.error("Failed to load categories");
        setLoading(false);
      }
    };
    
    loadCategories();
  }, []);
  
  useEffect(() => {
    const loadChannels = async () => {
      if (!selectedCategory) return;
      
      setLoading(true);
      setError(null);
      
      try {
        console.log("Fetching channels for category:", selectedCategory);
        const channelsData = await getLiveChannels(selectedCategory);
        console.log("Channels data received:", channelsData);
        
        if (!channelsData || channelsData.length === 0) {
          console.log("No channels found in this category");
          setChannels([]);
        } else {
          setChannels(channelsData);
        }
      } catch (error) {
        console.error("Error loading channels:", error);
        setError("Failed to load channels. Please check your connection.");
        toast.error("Failed to load channels");
      } finally {
        setLoading(false);
      }
    };
    
    loadChannels();
  }, [selectedCategory]);
  
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };
  
  const handleChannelClick = (channel: LiveChannel) => {
    const streamUrl = getLiveStreamUrl(channel.stream_id);
    console.log("Opening stream:", streamUrl);
    navigate(`/player?src=${encodeURIComponent(streamUrl)}&title=${encodeURIComponent(channel.name)}`);
  };
  
  return (
    <MainLayout>
      <div className="py-8">
        <h1 className="text-3xl font-bold mb-6">Live TV</h1>
        
        {/* Debug information */}
        <div className="mb-4 p-2 bg-yellow-100/10 rounded border border-yellow-300/30 text-yellow-300 text-sm">
          <div>Session status: {localStorage.getItem('iptv_session') ? 'Active' : 'Not found'}</div>
          <div>Categories loaded: {categories.length}</div>
          <div>Selected category: {selectedCategory || 'None'}</div>
          <div>Channels loaded: {channels.length}</div>
        </div>
        
        {/* Categories filter */}
        <div className="mb-8 overflow-x-auto scrollbar-none">
          <div className="flex space-x-2 pb-2">
            {categories.map((category) => (
              <Button
                key={category.category_id}
                variant={selectedCategory === category.category_id ? "default" : "outline"}
                className={selectedCategory === category.category_id 
                  ? "bg-streaming-purple hover:bg-streaming-purple/90" 
                  : ""}
                onClick={() => handleCategoryChange(category.category_id)}
              >
                {category.category_name}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Error state */}
        {error && (
          <div className="text-center py-8">
            <p className="text-red-400 mb-2">{error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        )}
        
        {/* Channels grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-streaming-purple"></div>
          </div>
        ) : channels.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {channels.map((channel) => (
              <ContentCard
                key={channel.stream_id}
                title={channel.name}
                image={channel.stream_icon}
                aspectRatio="landscape"
                onClick={() => handleChannelClick(channel)}
              />
            ))}
          </div>
        ) : !error ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No channels found in this category.</p>
          </div>
        ) : null}
      </div>
    </MainLayout>
  );
};

export default LiveTV;
