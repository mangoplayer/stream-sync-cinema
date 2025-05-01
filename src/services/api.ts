import { toast } from "@/components/ui/sonner";

export interface Session {
  server: string;
  username?: string;
  password?: string;
  token?: string;
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

// Function to handle user login
export const loginUser = async (credentials: Session): Promise<Session | null> => {
  try {
    // Make API call to authenticate user
    const response = await fetch(`${credentials.server}/player_api.php?username=${credentials.username}&password=${credentials.password}&action=get_player_info`);
    const data = await response.json();

    if (data.user_info) {
      // Save session data to localStorage
      const session: Session = {
        server: credentials.server,
        username: credentials.username,
        token: data.user_info.token,
      };
      saveSession(session);
      return session;
    } else {
      toast.error("Invalid credentials");
      return null;
    }
  } catch (error) {
    console.error("Login failed:", error);
    toast.error("Login failed. Please check your credentials and server URL.");
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
      toast.error("Session not found. Please login again.");
      return null;
    }

    const url = getApiUrl(endpoint);
    if (!url) {
      toast.error("Unable to construct API URL. Please check your session.");
      return null;
    }

    const response = await fetch(url);
    if (!response.ok) {
      handleApiError(response.statusText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    handleApiError(error);
    toast.error("Failed to fetch data. Please check your connection and server URL.");
    return null;
  }
};
