import { MobileLayout } from "@/components/MobileLayout";
import { AppBar } from "@/components/AppBar";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { UserCheck } from "lucide-react";

export default function QueueAssignment() {
  const [selectedItem, setSelectedItem] = useState("");
  const [assignee, setAssignee] = useState("");

  const queueItems = [
    "Task Assignment - Group Alpha",
    "Meeting Approval - Group Beta",
    "Grade Review - Group Gamma",
  ];

  const assignees = [
    "Dr. Khan",
    "Dr. Ahmed",
    "Dr. Sara",
    "Committee Member 1",
  ];

  return (
    <MobileLayout>
      <AppBar title="Assign Queue Item" showBack />
      
      <div className="p-4 space-y-6">
        <div className="bg-card border border-card-border rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <UserCheck className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Queue Assignment</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Assign pending queue items to supervisors or committee members
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="item">Select Queue Item</Label>
            <Select value={selectedItem} onValueChange={setSelectedItem}>
              <SelectTrigger id="item" data-testid="select-queue-item">
                <SelectValue placeholder="Choose an item" />
              </SelectTrigger>
              <SelectContent>
                {queueItems.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignee">Assign To</Label>
            <Select value={assignee} onValueChange={setAssignee}>
              <SelectTrigger id="assignee" data-testid="select-assignee">
                <SelectValue placeholder="Choose assignee" />
              </SelectTrigger>
              <SelectContent>
                {assignees.map((person) => (
                  <SelectItem key={person} value={person}>
                    {person}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {selectedItem && assignee && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <p className="text-sm font-medium mb-1">Assignment Preview</p>
            <p className="text-sm text-muted-foreground">
              "{selectedItem}" will be assigned to {assignee}
            </p>
          </div>
        )}

        <Button
          className="w-full"
          disabled={!selectedItem || !assignee}
          data-testid="button-confirm-assignment"
        >
          Confirm Assignment
        </Button>
      </div>
    </MobileLayout>
  );
}
