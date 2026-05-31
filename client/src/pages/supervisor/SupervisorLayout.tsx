import { ReactNode } from "react";
import { useLocation } from "wouter";
import { LayoutDashboard, Users, Calendar, User, Lightbulb } from "lucide-react";

interface Props {
  children: ReactNode;
}

export default function SupervisorLayout({ children }: Props) {
  const [location, setLocation] = useLocation();

  const navItems = [
    {
      label: "Dashboard",
      path: "/supervisor/dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      label: "Assign Task",
      path: "/supervisor/assign-task",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      label: "View Tasks",
      path: "/supervisor/tasks",
      icon: <Users className="w-5 h-5" />,
    },
    {
      label: "Suggest Project",
      path: "/supervisor/suggest-project",
      icon: <Lightbulb className="w-5 h-5 text-amber-500" />,
    },
    {
      label: "Schedule Meeting",
      path: "/supervisor/schedule-meetings",
      icon: <Calendar className="w-5 h-5" />,
    },
    {
      label: "All Meeting",
      path: "/supervisor/meetings1",
      icon: <Calendar className="w-5 h-5" />,
    },
    {
      label: "Groups Attendance",
      path: "/supervisor/group-attendance",
      icon: <Users className="w-5 h-5" />,
    },

    {
      label: "General Task Eval",
      path: "/supervisor/general-task-evaluation",
      icon: <Users className="w-5 h-5" />,
    },
    {
      label: "Profile",
      path: "/supervisor/profile",
      icon: <User className="w-5 h-5" />,
    },
  ];

  return (
    <div className="min-h-screen flex bg-background">

      {/* ========== Desktop Sidebar ========== */}
      <aside className="hidden md:flex w-64 bg-card border-r border-card-border p-5 flex-col">

        <h2 className="text-xl font-bold mb-8">
          Supervisor Panel
        </h2>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const active = location === item.path;

            return (
              <button
                key={item.path}
                onClick={() => setLocation(item.path)}
                className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg transition
                  ${active
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent"
                  }`}
              >
                {item.icon}
                <span className="text-sm font-medium">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* ========== Main Content ========== */}
      <main className="flex-1 pb-16 md:pb-0">
        {children}
      </main>

      {/* ========== Mobile Bottom Navigation ========== */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-card border-t border-card-border flex justify-around py-2">

        {navItems.map((item) => {
          const active = location === item.path;

          return (
            <button
              key={item.path}
              onClick={() => setLocation(item.path)}
              className={`flex flex-col items-center text-xs transition
                ${active
                  ? "text-primary"
                  : "text-muted-foreground"
                }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}

      </div>
    </div>
  );
}