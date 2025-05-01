
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Index from "./pages/Index";
import Login from "./pages/Login";
import LiveTV from "./pages/LiveTV";
import Movies from "./pages/Movies";
import Series from "./pages/Series";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import VideoPlayer from "./components/player/VideoPlayer";

const queryClient = new QueryClient();

// Player route component
const Player = () => {
  // Use URLSearchParams to get query parameters from URL
  const params = new URLSearchParams(window.location.search);
  const src = params.get('src') || '';
  const title = params.get('title') || '';
  
  return (
    <div className="h-screen w-screen bg-black">
      <VideoPlayer src={src} title={title} />
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/live" element={<LiveTV />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/series" element={<Series />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/player" element={<Player />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
