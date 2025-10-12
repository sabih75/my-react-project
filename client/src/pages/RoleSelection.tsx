import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { GraduationCap, User, Users, ListOrdered } from "lucide-react";
import { MobileLayout } from "@/components/MobileLayout";
import { useNavigation } from "@/lib/navigation";

export default function RoleSelection() {
  const [, setLocation] = useLocation();
  const { setUserRole } = useNavigation();

  const roles = [
    {
      id: "student" as const,
      title: "Student",
      icon: GraduationCap,
      description: "View tasks, meetings & progress",
      color: "bg-blue-500",
      path: "/student/dashboard",
    },
    {
      id: "supervisor" as const,
      title: "Supervisor",
      icon: User,
      description: "Manage groups & assign tasks",
      color: "bg-green-500",
      path: "/supervisor/dashboard",
    },
    {
      id: "committee" as const,
      title: "Project Committee",
      icon: Users,
      description: "Allocate & monitor projects",
      color: "bg-purple-500",
      path: "/committee/dashboard",
    },
    {
      id: "queue" as const,
      title: "Queue Handler",
      icon: ListOrdered,
      description: "Manage task queue & analytics",
      color: "bg-orange-500",
      path: "/queue/dashboard",
    },
  ];

  const handleRoleSelect = (role: typeof roles[0]) => {
    setUserRole(role.id);
    setLocation(role.path);
  };

  return (
    <MobileLayout showBottomNav={false}>
      <div className="min-h-screen flex flex-col p-6">
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold font-heading">Select Your Role</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Choose how you want to access the system
          </p>
        </div>

        <div className="flex-1 space-y-3">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <button
                key={role.id}
                onClick={() => handleRoleSelect(role)}
                className="w-full p-4 rounded-xl border border-card-border bg-card hover-elevate active-elevate-2 transition-all"
                data-testid={`button-role-${role.id}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 ${role.color} rounded-xl flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold">{role.title}</h3>
                    <p className="text-sm text-muted-foreground">{role.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </MobileLayout>
  );
}
