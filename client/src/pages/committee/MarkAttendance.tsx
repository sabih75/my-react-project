import { MobileLayout } from "@/components/MobileLayout";
import { AppBar } from "@/components/AppBar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";

export default function MarkAttendance() {
  const [selectedGroup, setSelectedGroup] = useState("");
  const [attendance, setAttendance] = useState<Record<string, string>>({});

  const groups = ["Group Alpha", "Group Beta", "Group Gamma"];
  
  const students = [
    { id: "1", name: "Ali Hassan", regno: "2018-ARID-0996" },
    { id: "2", name: "Ahmed Khan", regno: "2018-ARID-1102" },
    { id: "3", name: "Sara Ahmad", regno: "2018-ARID-1053" },
  ];

  const markAttendance = (studentId: string, status: string) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  return (
    <MobileLayout>
      <AppBar title="Mark Attendance" showBack />
      
      <div className="p-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="group">Select Group</Label>
          <Select value={selectedGroup} onValueChange={setSelectedGroup}>
            <SelectTrigger id="group" data-testid="select-group">
              <SelectValue placeholder="Choose a group" />
            </SelectTrigger>
            <SelectContent>
              {groups.map((group) => (
                <SelectItem key={group} value={group}>
                  {group}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedGroup && (
          <>
            <div className="bg-card border border-card-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Students</h3>
                <span className="text-sm text-muted-foreground">
                  {Object.keys(attendance).length}/{students.length} marked
                </span>
              </div>

              <div className="space-y-3">
                {students.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div>
                      <p className="font-medium text-sm">{student.name}</p>
                      <p className="text-xs text-muted-foreground">{student.regno}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => markAttendance(student.id, "present")}
                        className={`p-2 rounded-lg ${
                          attendance[student.id] === "present"
                            ? "bg-chart-2 text-white"
                            : "bg-card border border-card-border hover-elevate"
                        }`}
                        data-testid={`button-present-${student.id}`}
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => markAttendance(student.id, "absent")}
                        className={`p-2 rounded-lg ${
                          attendance[student.id] === "absent"
                            ? "bg-destructive text-destructive-foreground"
                            : "bg-card border border-card-border hover-elevate"
                        }`}
                        data-testid={`button-absent-${student.id}`}
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button
              className="w-full"
              disabled={Object.keys(attendance).length !== students.length}
              data-testid="button-save-attendance"
            >
              Save Attendance
            </Button>
          </>
        )}
      </div>
    </MobileLayout>
  );
}
