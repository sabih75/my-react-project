import { ReactNode, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { LayoutDashboard, Users, Calendar, User } from "lucide-react";

interface Props {
  children: ReactNode;
}

export default function CommitteeLayout({ children }: Props) {
  const [location, setLocation] = useLocation();
    const[activeFyp,setActiveFype]=useState("FYP-1");
  
useEffect(()=>{
var Fyptype=localStorage.getItem("type");
if(Fyptype)
setActiveFype(JSON.parse(Fyptype));

})
  const navItems = [
    {
      label: "Dashboard",
      path: "/committee/dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      label: "Groups",
      path: `/committee/groups/${activeFyp}`,
      icon: <Users className="w-5 h-5" />,
    },
    {
      label: "Meetings Queue",
      path: "/committee/meeting-queue",
      icon: <Calendar className="w-5 h-5" />,
    },
    {
      label: "General Task Eval",
      path: "/committee/general-task-evaluation",
      icon: <Users className="w-5 h-5" />,
    },
    {
      label: "Supervisor Alloc",
      path: "/committee/supervisor-allocation",
      icon: <Users className="w-5 h-5" />,
    },
    {
      label: "Profile",
      path: "/committee/profile",
      icon: <User className="w-5 h-5" />,
    },
  ];

  const visibleNavItems = navItems.filter((item) => {
    // Show General Task Eval only for FYP-2
    if (item.label === "General Task Eval" && activeFyp !== "FYP-2") {
      return false;
    }
    // Show Supervisor Alloc only for FYP-1
    if (item.label === "Supervisor Alloc" && activeFyp !== "FYP-1") {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen flex bg-background">

      {/* ========== Desktop Sidebar ========== */}
      <aside className="hidden md:flex w-64 bg-card border-r border-card-border p-5 flex-col">

        <h2 className="text-xl font-bold mb-8">
          Committee Panel
        </h2>

        <nav className="space-y-2">
          {visibleNavItems.map((item) => {
            const active = location === item.path;

            return (
              <button
                key={item.path}
                onClick={() => setLocation(item.path)}
                className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg transition
                  ${
                    active
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

        {visibleNavItems.map((item) => {
          const active = location === item.path;

          return (
            <button
              key={item.path}
              onClick={() => setLocation(item.path)}
              className={`flex flex-col items-center text-xs transition
                ${
                  active
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