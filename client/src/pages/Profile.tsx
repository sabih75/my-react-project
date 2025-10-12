import { MobileLayout } from "@/components/MobileLayout";
import { AppBar } from "@/components/AppBar";
import { User, Mail, Phone, Building, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function Profile() {
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    console.log("Logging out...");
    setLocation("/");
  };

  return (
    <MobileLayout>
      <AppBar title="Profile" />
      
      <div className="p-4 space-y-6">
        <div className="flex flex-col items-center py-6">
          <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center text-3xl font-bold text-primary mb-3">
            AH
          </div>
          <h2 className="text-xl font-bold">Ali Hassan</h2>
          <p className="text-sm text-muted-foreground">Student</p>
        </div>

        <div className="bg-card border border-card-border rounded-xl p-4 space-y-4">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Registration No</p>
              <p className="text-sm font-medium">2018-ARID-0996</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm font-medium">ali.hassan@biit.edu.pk</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Phone</p>
              <p className="text-sm font-medium">+92 300 1234567</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Building className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Department</p>
              <p className="text-sm font-medium">Computer Science</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-card-border rounded-xl p-4">
          <h3 className="font-semibold mb-3">Project Details</h3>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-muted-foreground">Group</p>
              <p className="text-sm font-medium">Group Alpha</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Project</p>
              <p className="text-sm font-medium">AI-Based Student Management System</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Supervisor</p>
              <p className="text-sm font-medium">Dr. Khan</p>
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
          onClick={handleLogout}
          data-testid="button-logout"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </MobileLayout>
  );
}
