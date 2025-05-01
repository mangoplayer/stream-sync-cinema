import { useRef, useEffect, useState } from "react";
import { X, Play, Pause, Volume1, VolumeX, Settings, Maximize, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

// Dynamically import HLS.js to reduce initial bundle size
const loadHls = async () => {
  return (await import('hls.js')).default;
};

interface VideoPlayerProps {
  src: string;
  title?: string;
  autoPlay?: boolean;
  onClose?: () => void;
}

const VideoPlayer = ({ src, title, autoPlay = true, onClose }: VideoPlayerProps) => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(autoPlay);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [controlsTimer, setControlsTimer] = useState<NodeJS.Timeout | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Create instance of HLS.js when component mounts
    const initPlayer = async () => {
      if (!videoRef.current) return;
      
      try {
        // First try with native HLS support (Safari)
        if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
          videoRef.current.src = src;
        }
        // Otherwise use HLS.js
        else {
          const Hls = await loadHls();
          
          if (Hls.isSupported()) {
            const hls = new Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            
            hls.loadSource(src);
            hls.attachMedia(videoRef.current);
            
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              if (autoPlay && videoRef.current) {
                videoRef.current.play().catch(error => {
                  console.error("Autoplay failed:", error);
                  setPlaying(false);
                });
              }
            });
            
            hls.on(Hls.Events.ERROR, (_, data) => {
              console.error("HLS error:", data);
              if (data.fatal) {
                switch (data.type) {
                  case Hls.ErrorTypes.NETWORK_ERROR:
                    console.error("Network error - trying to recover");
                    hls.startLoad();
                    break;
                  case Hls.ErrorTypes.MEDIA_ERROR:
                    console.error("Media error - trying to recover");
                    hls.recoverMediaError();
                    break;
                  default:
                    console.error("Fatal error, cannot recover");
                    hls.destroy();
                    break;
                }
              }
            });
            
            // Cleanup
            return () => {
              hls.destroy();
            };
          } else {
            console.error("HLS not supported in this browser");
          }
        }
      } catch (error) {
        console.error("Error initializing video player:", error);
      }
    };
    
    initPlayer();
  }, [src, autoPlay]);
  
  // Handle play/pause
  const togglePlay = () => {
    if (!videoRef.current) return;
    
    if (playing) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(err => {
        console.error("Play failed:", err);
      });
    }
    
    setPlaying(!playing);
  };
  
  // Handle fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (!fullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    
    setFullscreen(!fullscreen);
  };
  
  // Handle mute
  const toggleMute = () => {
    if (!videoRef.current) return;
    
    videoRef.current.muted = !muted;
    setMuted(!muted);
  };
  
  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    
    const newVolume = parseFloat(e.target.value);
    videoRef.current.volume = newVolume;
    setVolume(newVolume);
    
    // Unmute if volume is changed and was previously muted
    if (muted && newVolume > 0) {
      setMuted(false);
      videoRef.current.muted = false;
    }
  };
  
  // Auto-hide controls after inactivity
  useEffect(() => {
    const resetControlsTimer = () => {
      // Clear existing timer
      if (controlsTimer) {
        clearTimeout(controlsTimer);
      }
      
      // Set controls to show
      setShowControls(true);
      
      // Set a new timer to hide controls
      const timer = setTimeout(() => {
        if (playing) {
          setShowControls(false);
        }
      }, 3000);
      
      setControlsTimer(timer);
    };
    
    // Reset controls timer whenever playing state changes
    resetControlsTimer();
    
    // Add event listeners to show controls on mouse movement
    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', resetControlsTimer);
      container.addEventListener('click', () => setShowControls(true));
    }
    
    return () => {
      if (controlsTimer) {
        clearTimeout(controlsTimer);
      }
      
      if (container) {
        container.removeEventListener('mousemove', resetControlsTimer);
        container.removeEventListener('click', resetControlsTimer);
      }
    };
  }, [playing, controlsTimer]);
  
  // Handle video events
  useEffect(() => {
    const videoElement = videoRef.current;
    
    if (!videoElement) return;
    
    const handlePlaying = () => setPlaying(true);
    const handlePause = () => setPlaying(false);
    const handleWaiting = () => setLoading(true);
    const handlePlayed = () => setLoading(false);
    
    videoElement.addEventListener('play', handlePlaying);
    videoElement.addEventListener('playing', handlePlayed);
    videoElement.addEventListener('waiting', handleWaiting);
    videoElement.addEventListener('pause', handlePause);
    
    return () => {
      videoElement.removeEventListener('play', handlePlaying);
      videoElement.removeEventListener('playing', handlePlayed);
      videoElement.removeEventListener('waiting', handleWaiting);
      videoElement.removeEventListener('pause', handlePause);
    };
  }, []);
  
  // Close button handler
  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate(-1);
    }
  };
  
  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full bg-black overflow-hidden"
      onDoubleClick={toggleFullscreen}
    >
      {/* Video element */}
      <video
        ref={videoRef}
        className="w-full h-full"
        autoPlay={autoPlay}
        playsInline
        onClick={togglePlay}
      />
      
      {/* Loading spinner */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-10">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-streaming-purple"></div>
        </div>
      )}
      
      {/* Controls overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-t from-black/80 to-black/10 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-black/20 hover:bg-black/40"
            onClick={handleClose}
          >
            {onClose ? <X size={20} /> : <ArrowLeft size={20} />}
          </Button>
          
          {title && (
            <span className="text-white font-medium">{title}</span>
          )}
          
          <div className="w-10" /> {/* Empty space for balance */}
        </div>
        
        {/* Center play/pause */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full w-16 h-16 bg-black/20 hover:bg-black/40"
            onClick={togglePlay}
          >
            {playing ? <Pause size={36} /> : <Play size={36} />}
          </Button>
        </div>
        
        {/* Bottom control bar */}
        <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col gap-2">
          {/* Progress bar (placeholder, to be implemented later) */}
          <div className="w-full bg-white/30 h-1 rounded">
            <div className="bg-streaming-purple h-full rounded" style={{width: "25%"}}></div>
          </div>
          
          {/* Control buttons */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={togglePlay}
              >
                {playing ? <Pause size={20} /> : <Play size={20} />}
              </Button>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  onClick={toggleMute}
                >
                  {muted ? <VolumeX size={20} /> : <Volume1 size={20} />}
                </Button>
                
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={muted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-20 accent-streaming-purple"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={() => {}}
              >
                <Settings size={20} />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={toggleFullscreen}
              >
                <Maximize size={20} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
