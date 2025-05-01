
import { toast } from "@/components/ui/sonner";
import { 
  LoginCredentials, 
  UserSession, 
  Category, 
  LiveChannel, 
  Movie, 
  Series,
  Season,
  Episode
} from "../types";

// API URLs and endpoints will be built dynamically based on the server info provided during login
let API_BASE_URL = '';
let API_USERNAME = '';
let API_PASSWORD = '';
let USE_PROXY = true; // Flag to determine if we should use a proxy for requests

// Helper to handle API errors
const handleApiError = (error: any, message = "An error occurred") => {
  console.error(error);
  toast.error(message);
  return null;
};

// Format the server URL to ensure it has the correct format
const formatServerUrl = (url: string): string => {
  // Remove trailing slashes
  url = url.replace(/\/+$/, '');
  
  // Ensure the URL has http:// or https:// prefix
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `http://${url}`;
  }
  
  return url;
};

// Helper function to create API URLs with optional proxy support
const getApiUrl = (endpoint: string): string => {
  if (USE_PROXY) {
    // For proxied requests, we need to include the full URL as a query parameter
    const targetUrl = `${API_BASE_URL}${endpoint}`;
    return `/api/proxy?url=${encodeURIComponent(targetUrl)}`;
  } else {
    // Direct request to the API server
    return `${API_BASE_URL}${endpoint}`;
  }
};

export const loginUser = async (credentials: LoginCredentials): Promise<UserSession | null> => {
  try {
    // Format server URL
    API_BASE_URL = formatServerUrl(credentials.server);
    API_USERNAME = credentials.username;
    API_PASSWORD = credentials.password;
    
    // For login, we'll test if we can directly access the API or if we need to use a proxy
    try {
      // First try direct access
      USE_PROXY = false;
      const directResponse = await fetch(`${API_BASE_URL}/player_api.php?username=${credentials.username}&password=${credentials.password}`);
      
      if (!directResponse.ok) {
        throw new Error(`Login failed with status: ${directResponse.status}`);
      }
      
      const data = await directResponse.json();
      console.log("Direct API access successful");
      
      if (data.user_info && data.user_info.auth === 1) {
        // Save the session to localStorage
        const session: UserSession = {
          user_info: data.user_info,
          server_info: data.server_info,
          token: btoa(`${credentials.username}:${credentials.password}`)
        };
        
        localStorage.setItem('iptv_session', JSON.stringify(session));
        return session;
      }
    } catch (error) {
      console.log("Direct API access failed, trying proxy...", error);
      // If direct access fails, enable proxy for subsequent requests
      USE_PROXY = true;
      
      // Try with proxy
      const proxyUrl = `/api/proxy?url=${encodeURIComponent(`${API_BASE_URL}/player_api.php?username=${credentials.username}&password=${credentials.password}`)}`;
      
      const proxyResponse = await fetch(proxyUrl);
      
      if (!proxyResponse.ok) {
        throw new Error(`Login via proxy failed with status: ${proxyResponse.status}`);
      }
      
      const proxyData = await proxyResponse.json();
      
      if (proxyData.user_info && proxyData.user_info.auth === 1) {
        // Save the session to localStorage
        const session: UserSession = {
          user_info: proxyData.user_info,
          server_info: proxyData.server_info,
          token: btoa(`${credentials.username}:${credentials.password}`)
        };
        
        localStorage.setItem('iptv_session', JSON.stringify(session));
        localStorage.setItem('iptv_use_proxy', 'true'); // Remember proxy preference
        return session;
      }
    }
    
    toast.error("Authentication failed. Please check your credentials.");
    return null;
  } catch (error) {
    return handleApiError(error, "Login failed. Please check your server URL and credentials.");
  }
};

export const getSession = (): UserSession | null => {
  try {
    const sessionData = localStorage.getItem('iptv_session');
    if (!sessionData) return null;
    
    const session = JSON.parse(sessionData) as UserSession;
    
    // Restore API variables from session
    const credentials = atob(session.token).split(':');
    API_USERNAME = credentials[0];
    API_PASSWORD = credentials[1];
    API_BASE_URL = formatServerUrl(session.server_info.url);
    
    // Restore proxy preference
    USE_PROXY = localStorage.getItem('iptv_use_proxy') === 'true';
    
    return session;
  } catch {
    return null;
  }
};

export const logoutUser = () => {
  localStorage.removeItem('iptv_session');
  localStorage.removeItem('iptv_use_proxy');
  API_BASE_URL = '';
  API_USERNAME = '';
  API_PASSWORD = '';
};

// Live TV API calls
export const getLiveCategories = async (): Promise<Category[]> => {
  try {
    const session = getSession();
    if (!session) throw new Error("Not logged in");
    
    const endpoint = `/player_api.php?username=${API_USERNAME}&password=${API_PASSWORD}&action=get_live_categories`;
    const response = await fetch(getApiUrl(endpoint));
    
    if (!response.ok) {
      throw new Error(`Failed to fetch live categories with status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    return handleApiError(error, "Failed to load live TV categories") || [];
  }
};

export const getLiveChannels = async (categoryId?: string): Promise<LiveChannel[]> => {
  try {
    const session = getSession();
    if (!session) throw new Error("Not logged in");
    
    let endpoint = `/player_api.php?username=${API_USERNAME}&password=${API_PASSWORD}&action=get_live_streams`;
    if (categoryId) {
      endpoint += `&category_id=${categoryId}`;
    }
    
    const response = await fetch(getApiUrl(endpoint));
    
    if (!response.ok) {
      throw new Error(`Failed to fetch live channels with status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    return handleApiError(error, "Failed to load live channels") || [];
  }
};

export const getLiveStreamUrl = (streamId: number): string => {
  if (USE_PROXY) {
    const originalUrl = `${API_BASE_URL}/live/${API_USERNAME}/${API_PASSWORD}/${streamId}.m3u8`;
    return `/api/proxy?url=${encodeURIComponent(originalUrl)}`;
  }
  return `${API_BASE_URL}/live/${API_USERNAME}/${API_PASSWORD}/${streamId}.m3u8`;
};

// Movies API calls
export const getMovieCategories = async (): Promise<Category[]> => {
  try {
    const session = getSession();
    if (!session) throw new Error("Not logged in");
    
    const endpoint = `/player_api.php?username=${API_USERNAME}&password=${API_PASSWORD}&action=get_vod_categories`;
    const response = await fetch(getApiUrl(endpoint));
    
    if (!response.ok) {
      throw new Error(`Failed to fetch movie categories with status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    return handleApiError(error, "Failed to load movie categories") || [];
  }
};

export const getMovies = async (categoryId?: string): Promise<Movie[]> => {
  try {
    const session = getSession();
    if (!session) throw new Error("Not logged in");
    
    let endpoint = `/player_api.php?username=${API_USERNAME}&password=${API_PASSWORD}&action=get_vod_streams`;
    if (categoryId) {
      endpoint += `&category_id=${categoryId}`;
    }
    
    const response = await fetch(getApiUrl(endpoint));
    
    if (!response.ok) {
      throw new Error(`Failed to fetch movies with status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    return handleApiError(error, "Failed to load movies") || [];
  }
};

export const getMovieStreamUrl = (streamId: number): string => {
  if (USE_PROXY) {
    const originalUrl = `${API_BASE_URL}/movie/${API_USERNAME}/${API_PASSWORD}/${streamId}.mp4`;
    return `/api/proxy?url=${encodeURIComponent(originalUrl)}`;
  }
  return `${API_BASE_URL}/movie/${API_USERNAME}/${API_PASSWORD}/${streamId}.mp4`;
};

// Series API calls
export const getSeriesCategories = async (): Promise<Category[]> => {
  try {
    const session = getSession();
    if (!session) throw new Error("Not logged in");
    
    const endpoint = `/player_api.php?username=${API_USERNAME}&password=${API_PASSWORD}&action=get_series_categories`;
    const response = await fetch(getApiUrl(endpoint));
    
    if (!response.ok) {
      throw new Error(`Failed to fetch series categories with status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    return handleApiError(error, "Failed to load series categories") || [];
  }
};

export const getSeries = async (categoryId?: string): Promise<Series[]> => {
  try {
    const session = getSession();
    if (!session) throw new Error("Not logged in");
    
    let endpoint = `/player_api.php?username=${API_USERNAME}&password=${API_PASSWORD}&action=get_series`;
    if (categoryId) {
      endpoint += `&category_id=${categoryId}`;
    }
    
    const response = await fetch(getApiUrl(endpoint));
    
    if (!response.ok) {
      throw new Error(`Failed to fetch series with status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    return handleApiError(error, "Failed to load series") || [];
  }
};

export const getSeriesInfo = async (seriesId: number): Promise<{ info: Series, seasons: Season[] }> => {
  try {
    const session = getSession();
    if (!session) throw new Error("Not logged in");
    
    const endpoint = `/player_api.php?username=${API_USERNAME}&password=${API_PASSWORD}&action=get_series_info&series_id=${seriesId}`;
    const response = await fetch(getApiUrl(endpoint));
    
    if (!response.ok) {
      throw new Error(`Failed to fetch series info with status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    return handleApiError(error, "Failed to load series information") || { info: {} as Series, seasons: [] };
  }
};

export const getEpisodes = async (seriesId: number, seasonNumber: number): Promise<Record<string, Episode>> => {
  try {
    const session = getSession();
    if (!session) throw new Error("Not logged in");
    
    const endpoint = `/player_api.php?username=${API_USERNAME}&password=${API_PASSWORD}&action=get_episodes&series_id=${seriesId}&season=${seasonNumber}`;
    const response = await fetch(getApiUrl(endpoint));
    
    if (!response.ok) {
      throw new Error(`Failed to fetch episodes with status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    return handleApiError(error, "Failed to load episodes") || {};
  }
};

export const getEpisodeStreamUrl = (seriesId: number, episodeId: string): string => {
  if (USE_PROXY) {
    const originalUrl = `${API_BASE_URL}/series/${API_USERNAME}/${API_PASSWORD}/${episodeId}.mp4`;
    return `/api/proxy?url=${encodeURIComponent(originalUrl)}`;
  }
  return `${API_BASE_URL}/series/${API_USERNAME}/${API_PASSWORD}/${episodeId}.mp4`;
};

// TMDB API for extended information
const TMDB_API_KEY = "42125c682636b68d10d70b487c692685";
const TMDB_API_URL = "https://api.themoviedb.org/3";

export const searchTMDB = async (query: string, type: 'movie' | 'tv' = 'movie') => {
  try {
    const response = await fetch(
      `${TMDB_API_URL}/search/${type}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=tr-TR`
    );
    
    if (!response.ok) {
      throw new Error(`TMDB search failed with status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    return handleApiError(error, "Failed to search TMDB") || { results: [] };
  }
};

export const getTMDBDetails = async (id: number, type: 'movie' | 'tv' = 'movie') => {
  try {
    const response = await fetch(
      `${TMDB_API_URL}/${type}/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits&language=tr-TR`
    );
    
    if (!response.ok) {
      throw new Error(`TMDB details failed with status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    return handleApiError(error, "Failed to load TMDB details") || null;
  }
};
