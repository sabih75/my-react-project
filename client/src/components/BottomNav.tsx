import { Home, Calendar, CheckSquare, ListOrdered, User } from "lucide-react";
import { useLocation } from "wouter";
import { useNavigation } from "@/lib/navigation";

export function BottomNav() {
  const [location, setLocation] = useLocation();
  const { userRole } = useNavigation();

  if (!userRole) return null;

  const getDashboardPath = () => {
    switch (userRole) {
      case "student": return "/student/dashboard";
      case "supervisor": return "/supervisor/dashboard";
      case "committee": return "/committee/dashboard";
      case "queue": return "/queue/dashboard";
      default: return "/";
    }
  };

  const navItems = [
    { icon: Home, label: "Dashboard", path: getDashboardPath(), testId: "nav-dashboard" },
    { icon: Calendar, label: "Meetings", path: `/${userRole}/meetings`, testId: "nav-meetings" },
    { icon: CheckSquare, label: "Tasks", path: `/${userRole}/tasks`, testId: "nav-tasks" },
    { icon: ListOrdered, label: "Queue", path: `/${userRole}/queue`, testId: "nav-queue" },
    { icon: User, label: "Profile", path: `/${userRole}/profile`, testId: "nav-profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-card-border z-40">
      <div className="max-w-mobile mx-auto h-16 px-2 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => setLocation(item.path)}
              className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover-elevate"
              }`}
              data-testid={item.testId}
            >
              <Icon className={`w-5 h-5 ${isActive ? "fill-current" : ""}`} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
