
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "@/components/auth/LoginForm";
import { getSession } from "@/services/api";
import MainLayout from "@/components/layout/MainLayout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button"; 

const Login = () => {
  const navigate = useNavigate();
  const session = getSession();
  const [corsError, setCorsError] = useState(false);
  const [proxyEnabled, setProxyEnabled] = useState(false);
  
  useEffect(() => {
    // If already logged in, redirect to home
    if (session) {
      navigate("/");
    }
    
    // Check if there was a recent CORS error (set by the API service)
    const hasCorsError = localStorage.getItem('iptv_cors_error');
    if (hasCorsError === 'true') {
      setCorsError(true);
      // Clear the error flag so it doesn't show on refresh
      localStorage.removeItem('iptv_cors_error');
    }
    
    // Check if proxy is enabled
    const isProxyEnabled = localStorage.getItem('iptv_use_proxy');
    setProxyEnabled(isProxyEnabled === 'true');
  }, [session, navigate]);
  
  const toggleProxy = () => {
    const newProxyState = !proxyEnabled;
    localStorage.setItem('iptv_use_proxy', newProxyState ? 'true' : 'false');
    setProxyEnabled(newProxyState);
  };
  
  return (
    <MainLayout requireAuth={false}>
      <div className="min-h-[80vh] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        {corsError && (
          <Alert variant="destructive" className="mb-6 max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Connection Error</AlertTitle>
            <AlertDescription>
              Unable to connect to the IPTV server due to CORS restrictions. 
              The application will try to use a proxy to access the content.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="bg-black/30 p-3 rounded-md mb-4 max-w-md w-full">
          <p className="text-sm text-gray-300 mb-2">
            Proxy Mode: {proxyEnabled ? "Enabled" : "Disabled"}
          </p>
          <Button 
            size="sm" 
            variant={proxyEnabled ? "default" : "outline"} 
            onClick={toggleProxy}
            className="text-xs"
          >
            {proxyEnabled ? "Disable Proxy" : "Enable Proxy"}
          </Button>
          <p className="text-xs text-gray-400 mt-2">
            Try toggling this if you have connection issues.
          </p>
        </div>
        
        <LoginForm />
      </div>
    </MainLayout>
  );
};

export default Login;
