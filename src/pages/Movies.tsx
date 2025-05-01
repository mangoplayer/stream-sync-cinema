
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import ContentCard from "@/components/ui/ContentCard";
import { Button } from "@/components/ui/button";
import { Category, Movie } from "@/types";
import { getMovieCategories, getMovies, getMovieStreamUrl } from "@/services/api";

const Movies = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await getMovieCategories();
        setCategories(categoriesData);
        
        // Select the first category by default if there are categories
        if (categoriesData.length > 0) {
          setSelectedCategory(categoriesData[0].category_id);
        }
      } catch (error) {
        console.error("Error loading categories:", error);
      }
    };
    
    loadCategories();
  }, []);
  
  useEffect(() => {
    const loadMovies = async () => {
      if (!selectedCategory) return;
      
      setLoading(true);
      
      try {
        const moviesData = await getMovies(selectedCategory);
        setMovies(moviesData);
      } catch (error) {
        console.error("Error loading movies:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadMovies();
  }, [selectedCategory]);
  
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };
  
  const handleMovieClick = (movie: Movie) => {
    navigate(`/player?src=${encodeURIComponent(getMovieStreamUrl(movie.stream_id))}&title=${encodeURIComponent(movie.name)}`);
  };
  
  return (
    <MainLayout>
      <div className="py-8">
        <h1 className="text-3xl font-bold mb-6">Movies</h1>
        
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
        
        {/* Movies grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-streaming-purple"></div>
          </div>
        ) : movies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {movies.map((movie) => (
              <ContentCard
                key={movie.stream_id}
                title={movie.name}
                image={movie.stream_icon}
                subtitle={movie.releaseDate}
                onClick={() => handleMovieClick(movie)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400">No movies found in this category.</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Movies;
