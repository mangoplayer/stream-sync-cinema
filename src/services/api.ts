
import { toast } from "@/components/ui/sonner";
import { LoginCredentials, UserSession } from "@/types";

export interface Session {
  server: string;
  username?: string;
  password?: string;
  token?: string;
  user_info?: {
    username: string;
    password: string;
    status: string;
    exp_date: string;
    active_cons: number;
    max_connections: number;
    created_at: string;
    is_trial: number;
  };
}

// Function to save session data to localStorage
export const saveSession = (session: Session) => {
  localStorage.setItem("iptv_session", JSON.stringify(session));
};

// Function to retrieve session data from localStorage
export const getSession = (): Session | null => {
  const sessionData = localStorage.getItem("iptv_session");
  return sessionData ? JSON.parse(sessionData) : null;
};

// Function to clear session data from localStorage
export const clearSession = () => {
  localStorage.removeItem("iptv_session");
};

// Function to log user out
export const logoutUser = () => {
  clearSession();
};

// Function to handle user login
export const loginUser = async (credentials: LoginCredentials): Promise<UserSession | null> => {
  console.log("Attempting login with:", { 
    server: credentials.server,
    username: credentials.username,
    // password is hidden for security
  });
  
  try {
    // Make API call to authenticate user
    const url = `${credentials.server}/player_api.php?username=${credentials.username}&password=${credentials.password}`;
    console.log("Login URL:", url);
    
    const response = await fetch(url);
    console.log("Login response status:", response.status);
    
    const data = await response.json();
    console.log("Login response data:", data);

    if (data.user_info) {
      console.log("Login successful");
      // Save session data to localStorage
      const session: Session = {
        server: credentials.server,
        username: credentials.username,
        password: credentials.password, // Store password for API calls
        token: data.user_info.token,
        user_info: data.user_info
      };
      saveSession(session);
      
      // Also enable proxy if CORS is enabled
      if (localStorage.getItem('iptv_use_proxy') === 'true') {
        console.log("Using proxy for API calls");
      }
      
      // Return the user session data
      return {
        user_info: data.user_info,
        server_info: data.server_info,
        token: data.user_info.token || ''
      };
    } else {
      console.log("Login failed - invalid credentials or server response");
      toast.error("Invalid credentials or server response");
      return null;
    }
  } catch (error) {
    console.error("Login failed:", error);
    toast.error("Login failed. Please check your credentials and server URL.");
    
    // Check if it's a CORS error and enable proxy automatically
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.log("Possible CORS error detected, enabling proxy");
      localStorage.setItem('iptv_cors_error', 'true');
      localStorage.setItem('iptv_use_proxy', 'true');
      toast.info("CORS issue detected. Enabled proxy mode for next attempt.");
    }
    
    return null;
  }
};

// Helper function to determine if we should use proxy
function shouldUseProxy(): boolean {
  return localStorage.getItem('iptv_use_proxy') === 'true';
}

// Helper function to construct URL with proxy if needed
function getApiUrl(endpoint: string): string {
  const session = getSession();
  if (!session) return '';
  
  const baseUrl = session.server;
  const fullUrl = `${baseUrl}/${endpoint}`;
  
  if (shouldUseProxy()) {
    // Use the proxy endpoint with the target URL as a parameter
    return `/api/proxy?url=${encodeURIComponent(fullUrl)}`;
  }
  
  return fullUrl;
}

// API error handling
export function handleApiError(error: unknown): void {
  console.error('API error:', error);
  
  // Check if it's a CORS error (this is a best guess as CORS errors don't have specific properties)
  if (error instanceof TypeError && error.message.includes('fetch')) {
    console.log('Possible CORS error, enabling proxy for future requests');
    localStorage.setItem('iptv_cors_error', 'true');
    localStorage.setItem('iptv_use_proxy', 'true');
  }
}

// Function to fetch data from the API
export const fetchData = async (endpoint: string) => {
  try {
    const session = getSession();
    if (!session) {
      console.error("Session not found. Please login again.");
      toast.error("Session not found. Please login again.");
      return null;
    }

    console.log("Fetching data from endpoint:", endpoint);
    
    const url = getApiUrl(endpoint);
    if (!url) {
      console.error("Unable to construct API URL. Please check your session.");
      toast.error("Unable to construct API URL. Please check your session.");
      return null;
    }

    console.log("Using URL:", url);
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error("API error:", response.status, response.statusText);
      handleApiError(response.statusText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("API response data:", data);
    return data;
  } catch (error) {
    console.error("API fetch error:", error);
    handleApiError(error);
    toast.error("Failed to fetch data. Please check your connection and server URL.");
    return null;
  }
};

// Function to get live TV categories
export const getLiveCategories = async () => {
  const session = getSession();
  if (!session || !session.username) return [];
  
  const endpoint = `player_api.php?username=${session.username}&password=${session.password}&action=get_live_categories`;
  const data = await fetchData(endpoint);
  
  return data || [];
};

// Function to get live TV channels (optionally by category)
export const getLiveChannels = async (categoryId?: string) => {
  const session = getSession();
  if (!session || !session.username) return [];
  
  let endpoint = `player_api.php?username=${session.username}&password=${session.password}&action=get_live_streams`;
  
  if (categoryId) {
    endpoint += `&category_id=${categoryId}`;
  }
  
  const data = await fetchData(endpoint);
  return data || [];
};

// Function to get live stream URL - Updated to accept number or string
export const getLiveStreamUrl = (streamId: string | number) => {
  const session = getSession();
  if (!session || !session.username || !session.password) {
    console.error("Missing session data for stream URL");
    return '';
  }
  
  return `${session.server}/live/${session.username}/${session.password}/${streamId}.m3u8`;
};

// Function to get movie categories
export const getMovieCategories = async () => {
  const session = getSession();
  if (!session || !session.username) return [];
  
  const endpoint = `player_api.php?username=${session.username}&password=${session.password}&action=get_vod_categories`;
  const data = await fetchData(endpoint);
  
  return data || [];
};

// Function to get movies (optionally by category)
export const getMovies = async (categoryId?: string) => {
  const session = getSession();
  if (!session || !session.username) return [];
  
  let endpoint = `player_api.php?username=${session.username}&password=${session.password}&action=get_vod_streams`;
  
  if (categoryId) {
    endpoint += `&category_id=${categoryId}`;
  }
  
  const data = await fetchData(endpoint);
  return data || [];
};

// Function to get movie stream URL - Updated to accept number or string
export const getMovieStreamUrl = (streamId: string | number) => {
  const session = getSession();
  if (!session || !session.username || !session.password) {
    console.error("Missing session data for stream URL");
    return '';
  }
  
  return `${session.server}/movie/${session.username}/${session.password}/${streamId}.mp4`;
};

// Function to get series categories
export const getSeriesCategories = async () => {
  const session = getSession();
  if (!session || !session.username) return [];
  
  const endpoint = `player_api.php?username=${session.username}&password=${session.password}&action=get_series_categories`;
  const data = await fetchData(endpoint);
  
  return data || [];
};

// Function to get series (optionally by category)
export const getSeries = async (categoryId?: string) => {
  const session = getSession();
  if (!session || !session.username) {
    console.error("Session not found or missing username");
    return [];
  }
  
  let endpoint = `player_api.php?username=${session.username}&password=${session.password}&action=get_series`;
  
  if (categoryId) {
    endpoint += `&category_id=${categoryId}`;
  }
  
  const data = await fetchData(endpoint);
  return data || [];
};

// Function to get series info by ID
export const getSeriesInfo = async (seriesId: number | string) => {
  const session = getSession();
  if (!session || !session.username) return null;
  
  const endpoint = `player_api.php?username=${session.username}&password=${session.password}&action=get_series_info&series_id=${seriesId}`;
  const data = await fetchData(endpoint);
  
  return data || null;
};

// Function to get series stream URL
export const getEpisodeStreamUrl = (episodeId: string, containerExtension: string) => {
  const session = getSession();
  if (!session || !session.username || !session.password) return '';
  
  return `${session.server}/series/${session.username}/${session.password}/${episodeId}.${containerExtension}`;
};
