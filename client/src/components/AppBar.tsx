import { ArrowLeft, Bell, Search, Settings, Moon, Sun } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "./ui/button";
import { useTheme } from "./ThemeProvider";
import { useState, useEffect } from "react";
import axios from "axios";

interface AppBarProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  actions?: React.ReactNode;
}

const API_BASE = "http://localhost/ProgressMonitoringProject/api";

export function AppBar({ title, showBack = false, onBack, actions }: AppBarProps) {
  const [, setLocation] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [unreadCount, setUnreadCount] = useState(0);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user?.id;

  useEffect(() => {
    if (userId) {
      fetchUnreadCount();
      // Poll every 30 seconds for new notifications
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [userId]);

  const fetchUnreadCount = async () => {
    try {
      const res = await axios.get(`${API_BASE}/notifications/get-all/${userId}`);
      const unread = res.data.filter((n: any) => n.IsRead === 0 || !n.IsRead).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
      localStorage.setItem("type",JSON.stringify("FYP-1"));
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-card-border">
      <div className="h-14 px-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {showBack && (
            <Button
              size="icon"
              variant="ghost"
              onClick={handleBack}
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <h1 className="text-lg font-semibold truncate">{title}</h1>
        </div>
        <div className="flex items-center gap-1">
          {actions}
          
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setLocation("/queue/notifications")}
            className="relative"
            data-testid="button-notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 flex h-2.5 w-2.5 rounded-full bg-destructive ring-2 ring-background" />
            )}
          </Button>

          <Button
            size="icon"
            variant="ghost"
            onClick={toggleTheme}
            data-testid="button-theme-toggle"
          >
            {theme === "light" ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}

