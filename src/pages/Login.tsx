
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "@/components/auth/LoginForm";
import { getSession } from "@/services/api";
import MainLayout from "@/components/layout/MainLayout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const session = getSession();
  const [corsError, setCorsError] = useState(false);
  
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
  }, [session, navigate]);
  
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
        <LoginForm />
      </div>
    </MainLayout>
  );
};

export default Login;
