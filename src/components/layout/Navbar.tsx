
import { Link, useLocation } from "react-router-dom";
import { Film, Tv, User, Home, Search, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSession, logoutUser } from "@/services/api";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const session = getSession();
  
  const isActive = (path: string) => {
    return location.pathname === path ? "bg-streaming-purple text-white" : "";
  };
  
  const handleLogout = () => {
    logoutUser();
    toast.success("You have been logged out");
    navigate("/login");
  };
  
  return (
    <div className="fixed top-0 left-0 right-0 z-30 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm">
      <div className="container flex items-center justify-between py-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-streaming-purple">StreamSync</span>
        </Link>
        
        <div className="hidden md:flex items-center space-x-1">
          <Link to="/">
            <Button variant="ghost" className={`gap-2 ${isActive("/")}`}>
              <Home size={18} />
              <span>Home</span>
            </Button>
          </Link>
          <Link to="/live">
            <Button variant="ghost" className={`gap-2 ${isActive("/live")}`}>
              <Tv size={18} />
              <span>Live TV</span>
            </Button>
          </Link>
          <Link to="/movies">
            <Button variant="ghost" className={`gap-2 ${isActive("/movies")}`}>
              <Film size={18} />
              <span>Movies</span>
            </Button>
          </Link>
          <Link to="/series">
            <Button variant="ghost" className={`gap-2 ${isActive("/series")}`}>
              <Film size={18} />
              <span>Series</span>
            </Button>
          </Link>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Search size={20} />
          </Button>
          
          {session ? (
            <>
              <Link to="/profile">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User size={20} />
                </Button>
              </Link>
              <Button variant="ghost" size="icon" className="rounded-full" onClick={handleLogout}>
                <LogOut size={20} />
              </Button>
            </>
          ) : (
            <Link to="/login">
              <Button variant="default" className="bg-streaming-purple hover:bg-streaming-purple/90">
                Login
              </Button>
            </Link>
          )}
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-black/90 border-t border-gray-800 px-2 py-3 z-50">
        <div className="flex items-center justify-between">
          <Link to="/" className={`sidebar-link ${isActive("/")}`}>
            <Home size={24} />
          </Link>
          <Link to="/live" className={`sidebar-link ${isActive("/live")}`}>
            <Tv size={24} />
          </Link>
          <Link to="/movies" className={`sidebar-link ${isActive("/movies")}`}>
            <Film size={24} />
          </Link>
          <Link to="/series" className={`sidebar-link ${isActive("/series")}`}>
            <Film size={24} />
          </Link>
          <Link to="/profile" className={`sidebar-link ${isActive("/profile")}`}>
            <User size={24} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
