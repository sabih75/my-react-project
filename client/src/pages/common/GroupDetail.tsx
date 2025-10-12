import { MobileLayout } from "@/components/MobileLayout";
import { AppBar } from "@/components/AppBar";
import { Users, Mail, Phone, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function GroupDetail() {
  const members = [
    { name: "Ali Hassan", email: "ali@example.com", phone: "0300-1234567", role: "Team Lead" },
    { name: "Ahmed Khan", email: "ahmed@example.com", phone: "0301-1234567", role: "Developer" },
    { name: "Sara Ahmad", email: "sara@example.com", phone: "0302-1234567", role: "Designer" },
  ];

  return (
    <MobileLayout>
      <AppBar title="Group Details" showBack />
      
      <div className="p-4 space-y-4">
        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-4 text-primary-foreground">
          <h2 className="text-xl font-bold mb-1">Group Alpha</h2>
          <p className="text-sm opacity-90">AI-Based Student Management System</p>
        </div>

        <div className="bg-card border border-card-border rounded-xl p-4">
          <h3 className="font-semibold mb-3">Project Progress</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Overall Completion</span>
              <span className="text-sm font-semibold">68%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary transition-all" style={{ width: "68%" }} />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="text-center">
              <p className="text-lg font-bold">12</p>
              <p className="text-xs text-muted-foreground">Tasks Done</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold">5</p>
              <p className="text-xs text-muted-foreground">In Progress</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold">3</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-card-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Team Members</h3>
            <Badge variant="secondary">{members.length} members</Badge>
          </div>
          
          <div className="space-y-3">
            {members.map((member, index) => (
              <div key={index} className="flex items-start gap-3 pb-3 border-b border-border last:border-0">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium text-primary">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm">{member.name}</p>
                    <Badge variant="outline" className="text-xs">{member.role}</Badge>
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3 h-3 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3 h-3 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">{member.phone}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-card-border rounded-xl p-4">
          <h3 className="font-semibold mb-2">Supervisor</h3>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-chart-2/20 flex items-center justify-center text-sm font-medium text-chart-2">
              DK
            </div>
            <div>
              <p className="font-medium text-sm">Dr. Khan</p>
              <p className="text-xs text-muted-foreground">khan@biit.edu.pk</p>
            </div>
          </div>
        </div>

        <Button className="w-full" data-testid="button-view-tasks">
          View All Tasks
        </Button>
      </div>
    </MobileLayout>
  );
}
