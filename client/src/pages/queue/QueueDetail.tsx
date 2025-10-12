import { MobileLayout } from "@/components/MobileLayout";
import { AppBar } from "@/components/AppBar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Users, Calendar, User } from "lucide-react";

export default function QueueDetail() {
  return (
    <MobileLayout>
      <AppBar title="Queue Item Details" showBack />
      
      <div className="p-4 space-y-4">
        <div className="bg-card border border-card-border rounded-xl p-4">
          <div className="flex items-start justify-between mb-3">
            <h2 className="text-lg font-semibold">Task Assignment Request</h2>
            <Badge className="bg-destructive text-destructive-foreground">High Priority</Badge>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Group: Group Alpha</span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Created: Dec 12, 2024</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Waiting time: 2 hours</span>
            </div>
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Requested by: Dr. Khan</span>
            </div>
          </div>
        </div>

        <div className="bg-card border border-card-border rounded-xl p-4">
          <h3 className="font-semibold mb-2">Request Details</h3>
          <p className="text-sm text-muted-foreground">
            Requesting task assignment for literature review completion. Group needs guidance on proper citation format and research methodology.
          </p>
        </div>

        <div className="bg-card border border-card-border rounded-xl p-4">
          <h3 className="font-semibold mb-3">Status Timeline</h3>
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">Request Submitted</p>
                <p className="text-xs text-muted-foreground">Dec 12, 10:30 AM</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-2 h-2 rounded-full bg-chart-3 mt-1.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">In Queue</p>
                <p className="text-xs text-muted-foreground">Dec 12, 10:35 AM</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" data-testid="button-reject">
            Reject
          </Button>
          <Button data-testid="button-process">
            Process Request
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
}
