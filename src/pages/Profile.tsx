
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { LogOut, User, Calendar, Activity, Settings } from "lucide-react";
import { getSession, logoutUser } from "@/services/api";
import { toast } from "@/components/ui/sonner";
import { format } from "date-fns";

const Profile = () => {
  const navigate = useNavigate();
  const session = getSession();
  const [darkMode, setDarkMode] = useState(true); // Default to dark mode
  
  useEffect(() => {
    if (!session) {
      navigate("/login");
    }
  }, [session, navigate]);
  
  if (!session || !session.user_info) {
    return null;
  }
  
  const { user_info } = session;
  
  // Format the expiration date
  const formatExpiryDate = (dateStr: string) => {
    try {
      const expDate = new Date(dateStr);
      return format(expDate, 'PPP');
    } catch (error) {
      return dateStr;
    }
  };
  
  const handleLogout = () => {
    logoutUser();
    toast.success("You have been logged out");
    navigate("/login");
  };
  
  return (
    <MainLayout>
      <div className="py-8">
        <h1 className="text-3xl font-bold mb-6">Profile</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* User Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Username</p>
                <p>{user_info.username}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <p>{user_info.status}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Account Type</p>
                <p>{user_info.is_trial === 1 ? "Trial Account" : "Full Account"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Created On</p>
                <p>{user_info.created_at}</p>
              </div>
            </CardContent>
          </Card>
          
          {/* Subscription Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Subscription Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Expiration Date</p>
                <p>{formatExpiryDate(user_info.exp_date)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Connections</p>
                <p>{user_info.active_cons} / {user_info.max_connections}</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">Extend Subscription</Button>
            </CardFooter>
          </Card>
          
          {/* Settings Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="dark-mode">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable dark theme
                  </p>
                </div>
                <Switch
                  id="dark-mode"
                  checked={darkMode}
                  onCheckedChange={setDarkMode}
                />
              </div>
              
              <div className="pt-6">
                <Button 
                  variant="destructive" 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;
