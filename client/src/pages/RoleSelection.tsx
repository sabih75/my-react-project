import { useLocation } from "wouter";
import {
  GraduationCap,
  User,
  Users,
  ListOrdered,
  Database,
  LucideProps,
} from "lucide-react";
import { MobileLayout } from "@/components/MobileLayout";
import { useNavigation } from "@/lib/navigation";
import { ForwardRefExoticComponent, RefAttributes } from "react";

export default function RoleSelection() {
  const [, setLocation] = useLocation();
  const { setUserRole } = useNavigation();

  const roles = [
    {
      id: "student",
      title: "Student",
      icon: GraduationCap,
      description: "View tasks, meetings & progress",
      color: "bg-blue-500",
      path: "/student/tech-selection", // Student ALWAYS goes here
    },
    {
      id: "supervisor",
      title: "Supervisor",
      icon: User,
      description: "Manage groups & assign tasks",
      color: "bg-green-500",
      path: "/supervisor/dashboard",
    },
    {
      id: "committee",
      title: "Project Committee",
      icon: Users,
      description: "Allocate & monitor projects",
      color: "bg-purple-500",
      path: "/committee/dashboard",
    },
    {
      id: "queue",
      title: "Queue Handler",
      icon: ListOrdered,
      description: "Manage task queue & analytics",
      color: "bg-orange-500",
      path: "/queue/dashboard",
    },
    {
      id: "datacell",
      title: "Data Cell",
      icon: Database,
      description: "Upload & manage enrolled student lists",
      color: "bg-teal-500",
      path: "/datacell/dashboard",
    },

    // ⭐ NEW DIRECTOR ROLE
    {
      id: "director",
      title: "Director",
      icon: User, // Replace with another icon if you'd like
      description: "Oversee all project operations & analytics",
      color: "bg-red-500",
      path: "/director/dashboard",
    },
  ];

  const handleRoleSelect = (role: {
    id: any;
    title?: string;
    icon?: ForwardRefExoticComponent<
      Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
    >;
    description?: string;
    color?: string;
    path: any;
  }) => {
    setUserRole(role.id);

    // Student ALWAYS goes to Technology Selection
    if (role.id === "student") {
      setLocation("/student/tech-selection");
      return;
    }

    // All other roles
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
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 ${role.color} rounded-xl flex items-center justify-center`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold">{role.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {role.description}
                    </p>
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
