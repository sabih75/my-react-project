import { MobileLayout } from "@/components/MobileLayout";
import { AppBar } from "@/components/AppBar";
import { User, Users, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";

export default function AttendanceProgress() {
  const [, setLocation] = useLocation();

  // ---------- SAMPLE ATTENDANCE DATA ----------
  const groups = [
    {
      groupName: "Group 1",
      totalMeetings: 10,
      members: [
        { name: "Ali Hassan", attended: 9 },
        { name: "Ahmed Khan", attended: 8 },
        { name: "Sara Ahmad", attended: 10 },
      ],
    },
    {
      groupName: "Group 2",
      totalMeetings: 10,
      members: [
        { name: "Usman Ali", attended: 6 },
        { name: "Fatima Noor", attended: 7 },
      ],
    },
  ];

  const getPercentage = (attended, total) =>
    Math.round((attended / total) * 100);

  const getColor = (percentage) =>
    percentage >= 75
      ? "bg-green-500"
      : percentage >= 50
      ? "bg-yellow-500"
      : "bg-red-500";

  return (
    <MobileLayout>
      <AppBar title="Attendance Progress">
        <button
          onClick={() => setLocation("/supervisor")}
          className="px-3 py-1 text-sm bg-muted rounded-lg"
        >
          Back
        </button>
      </AppBar>

      <div className="p-4 space-y-6">
        {groups.map((group, idx) => {
          const groupAttendance =
            group.members.reduce((sum, m) => sum + m.attended, 0) /
            (group.members.length * group.totalMeetings);

          const groupPercentage = Math.round(groupAttendance * 100);

          return (
            <div
              key={idx}
              onClick={() =>
                setLocation(
                  `/supervisor/attendance/group-details?group=${encodeURIComponent(
                    group.groupName
                  )}`
                )
              }
              className="bg-card border rounded-xl p-4 space-y-4 shadow-sm cursor-pointer hover:bg-muted/40 transition"
            >
              {/* GROUP HEADER */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <h2 className="font-semibold text-lg">
                    {group.groupName}
                  </h2>
                </div>

                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </div>

              {/* GROUP PROGRESS */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Group Attendance</span>
                  <span>{groupPercentage}%</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full">
                  <div
                    className={`h-2 rounded-full ${getColor(
                      groupPercentage
                    )}`}
                    style={{ width: `${groupPercentage}%` }}
                  />
                </div>
              </div>

              {/* MEMBERS */}
              <div className="space-y-3">
                {group.members.map((m, i) => {
                  const percent = getPercentage(
                    m.attended,
                    group.totalMeetings
                  );

                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span>{m.name}</span>
                        </div>
                        <span>{percent}%</span>
                      </div>

                      <div className="w-full h-2 bg-muted rounded-full">
                        <div
                          className={`h-2 rounded-full ${getColor(
                            percent
                          )}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </MobileLayout>
  );
}