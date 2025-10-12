import { MobileLayout } from "@/components/MobileLayout";
import { AppBar } from "@/components/AppBar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, FileText } from "lucide-react";

export default function TaskDetail() {
  return (
    <MobileLayout>
      <AppBar title="Task Details" showBack />
      
      <div className="p-4 space-y-4">
        <div className="bg-card border border-card-border rounded-xl p-4">
          <div className="flex items-start justify-between mb-3">
            <h2 className="text-lg font-semibold">Complete Literature Review</h2>
            <Badge className="bg-chart-3 text-white">Pending</Badge>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Due: December 20, 2024</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Assigned: December 1, 2024</span>
            </div>
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Assigned by: Dr. Khan</span>
            </div>
          </div>
        </div>

        <div className="bg-card border border-card-border rounded-xl p-4">
          <h3 className="font-semibold mb-2">Description</h3>
          <p className="text-sm text-muted-foreground">
            Complete a comprehensive literature review covering recent research in AI-based student management systems. Include at least 20 relevant papers from the last 5 years.
          </p>
        </div>

        <div className="bg-card border border-card-border rounded-xl p-4">
          <h3 className="font-semibold mb-3">Grading Rubric</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Quality of Research</span>
              <span className="font-medium">30%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Relevance</span>
              <span className="font-medium">30%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Documentation</span>
              <span className="font-medium">20%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Presentation</span>
              <span className="font-medium">20%</span>
            </div>
          </div>
        </div>

        <div className="bg-card border border-card-border rounded-xl p-4">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-primary mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Feedback</h3>
              <p className="text-sm text-muted-foreground">
                Good progress so far. Make sure to include more recent studies from 2024.
              </p>
              <p className="text-xs text-muted-foreground mt-2">- Dr. Khan, Dec 15</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" data-testid="button-mark-complete">
            Mark Complete
          </Button>
          <Button data-testid="button-upload-submission">
            Upload Submission
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
}
