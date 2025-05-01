
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { getSession } from "@/services/api";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface MainLayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, requireAuth = true }) => {
  const navigate = useNavigate();
  const session = getSession();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If authentication is required but user is not logged in, redirect to login
    if (requireAuth && !session) {
      console.log("No session found, redirecting to login");
      navigate("/login");
      return;
    }

    // Verify session has required fields
    if (requireAuth && session) {
      if (!session.username || !session.password) {
        console.error("Session is missing username or password");
        setError("Invalid session data. Please log in again.");
      }
    }
  }, [requireAuth, session, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("iptv_session");
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
