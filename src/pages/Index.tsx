
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import FeaturedContent from "@/components/home/FeaturedContent";
import ContentRow from "@/components/home/ContentRow";
import { 
  getLiveChannels, 
  getMovies, 
  getSeries, 
  getLiveStreamUrl, 
  getMovieStreamUrl
} from "@/services/api";
import { LiveChannel, Movie, Series } from "@/types";

const Index = () => {
  const navigate = useNavigate();
  const [featuredContent, setFeaturedContent] = useState<any>(null);
  const [liveChannels, setLiveChannels] = useState<LiveChannel[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [series, setSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      
      try {
        // Fetch some sample content
        const [channelsData, moviesData, seriesData] = await Promise.all([
          getLiveChannels(),
          getMovies(),
          getSeries()
        ]);
        
        setLiveChannels(channelsData.slice(0, 20)); // Limit to first 20 items for performance
        setMovies(moviesData.slice(0, 20));
        setSeries(seriesData.slice(0, 20));
        
        // Set a featured content from movies if available
        if (moviesData.length > 0) {
          setFeaturedContent({
            id: moviesData[0].stream_id,
            title: moviesData[0].name,
            description: moviesData[0].plot || "No description available",
            image: moviesData[0].stream_icon,
            type: "movie"
          });
        } else if (seriesData.length > 0) {
          // Use series if no movies available
          setFeaturedContent({
            id: seriesData[0].series_id,
            title: seriesData[0].name,
            description: seriesData[0].plot || "No description available",
            image: seriesData[0].cover,
            type: "series"
          });
        }
      } catch (error) {
        console.error("Error loading content:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadContent();
  }, []);
  
  const handlePlayFeatured = () => {
    if (!featuredContent) return;
    
    if (featuredContent.type === "movie") {
      navigate(`/player?src=${encodeURIComponent(getMovieStreamUrl(featuredContent.id))}&title=${encodeURIComponent(featuredContent.title)}`);
    } else if (featuredContent.type === "series") {
      navigate(`/series/${featuredContent.id}`);
    } else if (featuredContent.type === "live") {
      navigate(`/player?src=${encodeURIComponent(getLiveStreamUrl(featuredContent.id))}&title=${encodeURIComponent(featuredContent.title)}`);
    }
  };
  
  const handleLiveChannelClick = (channel: LiveChannel) => {
    navigate(`/player?src=${encodeURIComponent(getLiveStreamUrl(channel.stream_id))}&title=${encodeURIComponent(channel.name)}`);
  };
  
  const handleMovieClick = (movie: Movie) => {
    navigate(`/player?src=${encodeURIComponent(getMovieStreamUrl(movie.stream_id))}&title=${encodeURIComponent(movie.name)}`);
  };
  
  const handleSeriesClick = (series: Series) => {
    navigate(`/series/${series.series_id}`);
  };
  
  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-streaming-purple"></div>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      {featuredContent && (
        <FeaturedContent
          title={featuredContent.title}
          description={featuredContent.description}
          image={featuredContent.image}
          type={featuredContent.type}
          onPlay={handlePlayFeatured}
        />
      )}
      
      <div className="pb-10">
        {liveChannels.length > 0 && (
          <ContentRow
            title="Live Channels"
            items={liveChannels.map(channel => ({
              id: channel.stream_id,
              title: channel.name,
              image: channel.stream_icon
            }))}
            onItemClick={handleLiveChannelClick}
            aspectRatio="landscape"
          />
        )}
        
        {movies.length > 0 && (
          <ContentRow
            title="Movies"
            items={movies.map(movie => ({
              id: movie.stream_id,
              title: movie.name,
              image: movie.stream_icon,
              subtitle: movie.releaseDate
            }))}
            onItemClick={handleMovieClick}
          />
        )}
        
        {series.length > 0 && (
          <ContentRow
            title="Series"
            items={series.map(series => ({
              id: series.series_id,
              title: series.name,
              image: series.cover,
              subtitle: series.genre
            }))}
            onItemClick={handleSeriesClick}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default Index;
