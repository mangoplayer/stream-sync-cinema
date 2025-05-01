
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { getSession, clearSession } from "@/services/api";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { toast } from "@/components/ui/sonner";

interface MainLayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, requireAuth = true }) => {
  const navigate = useNavigate();
  const [session, setSession] = useState(getSession());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if session exists and is valid
    const currentSession = getSession();
    setSession(currentSession);

    // If authentication is required but user is not logged in, redirect to login
    if (requireAuth && !currentSession) {
      console.log("No session found, redirecting to login");
      toast.error("Please log in to continue");
      navigate("/login");
      return;
    }

    // Verify session has required fields
    if (requireAuth && currentSession) {
      if (!currentSession.username || !currentSession.password) {
        console.error("Session is missing username or password");
        setError("Invalid session data. Please log in again.");
      }
      
      // Check for server URL format
      if (!currentSession.server || !currentSession.server.startsWith('http')) {
        console.error("Invalid server URL format in session");
        setError("Invalid server URL in session. Please log in again.");
      }
    }
  }, [requireAuth, navigate]);

  const handleLogout = () => {
    clearSession();
    toast.success("You have been logged out");
    navigate("/login");
  };

  // If auth is required but no session, don't render anything (will redirect)
  if (requireAuth && !session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-streaming-blue to-black text-white">
      <Navbar />
      <main className="container pt-20 pb-20 md:pb-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button size="sm" onClick={handleLogout}>Log out</Button>
            </AlertDescription>
          </Alert>
        )}
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
