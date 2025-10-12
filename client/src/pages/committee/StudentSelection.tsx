import { MobileLayout } from "@/components/MobileLayout";
import { AppBar } from "@/components/AppBar";
import { Search, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function StudentSelection() {
  const [searchQuery, setSearchQuery] = useState("");

  const students = [
    { id: 1, name: "Ali Hassan", regno: "2018-ARID-0996", group: "Group Alpha" },
    { id: 2, name: "Ahmed Khan", regno: "2018-ARID-1102", group: "Group Alpha" },
    { id: 3, name: "Sara Ahmad", regno: "2018-ARID-1053", group: "Group Beta" },
    { id: 4, name: "Usman Ali", regno: "2018-ARID-1073", group: "Unassigned" },
    { id: 5, name: "Fatima Noor", regno: "2018-ARID-1030", group: "Unassigned" },
  ];

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.regno.includes(searchQuery)
  );

  return (
    <MobileLayout>
      <AppBar title="Student Selection" showBack />
      
      <div className="p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or reg no..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-student"
          />
        </div>

        <div className="flex items-center justify-between">
          <h2 className="font-semibold">All Students</h2>
          <span className="text-sm text-muted-foreground">{filteredStudents.length} students</span>
        </div>

        <div className="space-y-2">
          {filteredStudents.map((student) => (
            <div
              key={student.id}
              className="p-4 rounded-lg bg-card border border-card-border hover-elevate active-elevate-2"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium text-primary">
                      {student.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{student.name}</h3>
                      <p className="text-xs text-muted-foreground">{student.regno}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Group: <span className={student.group === "Unassigned" ? "text-chart-3" : "text-chart-2"}>{student.group}</span>
                  </p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  data-testid={`button-select-${student.id}`}
                >
                  <UserPlus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MobileLayout>
  );
}
