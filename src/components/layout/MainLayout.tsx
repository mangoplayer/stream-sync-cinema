
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { getSession } from "@/services/api";

interface MainLayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, requireAuth = true }) => {
  const navigate = useNavigate();
  const session = getSession();

  useEffect(() => {
    // If authentication is required but user is not logged in, redirect to login
    if (requireAuth && !session) {
      navigate("/login");
    }
  }, [requireAuth, session, navigate]);

  // If auth is required but no session, don't render anything (will redirect)
  if (requireAuth && !session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-streaming-blue to-black text-white">
      <Navbar />
      <main className="container pt-20 pb-20 md:pb-8">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
