import { MobileLayout } from "@/components/MobileLayout";
import { AppBar } from "@/components/AppBar";
import { Users, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

export default function Allocation() {
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedSupervisor, setSelectedSupervisor] = useState("");

  const groups = [
    "Group Alpha",
    "Group Beta", 
    "Group Gamma",
    "Group Delta",
  ];

  const supervisors = [
    "Dr. Khan",
    "Dr. Ahmed",
    "Dr. Sara",
    "Dr. Usman",
  ];

  return (
    <MobileLayout>
      <AppBar title="Allocate Supervisor" showBack />
      
      <div className="p-4 space-y-6">
        <div className="bg-card border border-card-border rounded-xl p-4">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Supervisor Allocation</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Assign supervisors to project groups for guidance and evaluation
          </p>
        </div>

        <div className="space-y-4">
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

          <div className="space-y-2">
            <Label htmlFor="supervisor">Select Supervisor</Label>
            <Select value={selectedSupervisor} onValueChange={setSelectedSupervisor}>
              <SelectTrigger id="supervisor" data-testid="select-supervisor">
                <SelectValue placeholder="Choose a supervisor" />
              </SelectTrigger>
              <SelectContent>
                {supervisors.map((supervisor) => (
                  <SelectItem key={supervisor} value={supervisor}>
                    {supervisor}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {selectedGroup && selectedSupervisor && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <UserCheck className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium">Allocation Summary</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedSupervisor} will be assigned to {selectedGroup}
                </p>
              </div>
            </div>
          </div>
        )}

        <Button
          className="w-full"
          disabled={!selectedGroup || !selectedSupervisor}
          data-testid="button-confirm-allocation"
        >
          Confirm Allocation
        </Button>

        <div className="bg-card border border-card-border rounded-xl p-4">
          <h3 className="font-semibold mb-3">Recent Allocations</h3>
          <div className="space-y-2">
            {[
              { group: "Group Omega", supervisor: "Dr. Khan" },
              { group: "Group Theta", supervisor: "Dr. Ahmed" },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="text-sm">{item.group}</span>
                <span className="text-sm text-muted-foreground">{item.supervisor}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
