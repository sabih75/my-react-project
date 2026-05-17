import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import axios from "axios";

const API = "http://localhost/ProgressMonitoringProject/api";

export default function JoinGroup() {
  const [, setLocation] = useLocation();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const studentId = user?.id;

  const [search, setSearch] = useState("");
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch eligible groups
  useEffect(() => {
    if (!studentId) return;
    fetchGroups();
  }, [studentId]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
alert(studentId);
      const res = await axios.get(
        `${API}/students/eligible-groups/${studentId}`
      );
alert(studentId);

     const data = typeof res.data === "string"
  ? JSON.parse(res.data)
  : res.data;

setGroups(data);


    } catch (err) {
      console.error("Error fetching groups:", err);

      if (err?.response?.data) {
        alert(err.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ SEARCH FILTER
  const filteredGroups = groups.filter((g) =>
    `group ${g.groupId}`.toLowerCase().includes(search.toLowerCase())
  );

  // ✅ JOIN GROUP
  const handleJoinGroup = async (groupId) => {
    try {
      await axios.post(`${API}/committee-meetings/AddStudentToGroup?groupId=${groupId}&regNum=${studentId}`, {
        studentId,
        groupId,
      });

      alert("Joined successfully ✅");
      setLocation("/student/dashboard");

    } catch (err) {
      alert(err?.response?.data || "Join failed ❌");
    }
  };

  return (
    <div className="min-h-screen bg-muted/40 px-4 py-10 flex justify-center">
      <div className="w-full max-w-3xl bg-card border rounded-xl shadow p-6 space-y-6">

        {/* TITLE */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold">Join Existing Group</h1>
          <p className="text-sm text-muted-foreground">
            Only eligible groups are shown (FYP + Technology filtered)
          </p>
        </div>

        {/* SEARCH */}
        <Input
          placeholder="Search group..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* GROUP LIST */}
        <div className="space-y-3">

          {loading && <p>Loading groups...</p>}

          {!loading && filteredGroups.length === 0 && (
            <p className="text-center text-muted-foreground">
              No eligible groups found
            </p>
          )}

          {!loading && filteredGroups.map((grp) => (
            <div
              key={grp.groupId}
             
              className="border rounded-xl p-5 bg-card hover:bg-accent transition"
            > 
              <div className="flex items-center justify-between">

                {/* LEFT */}
                <div>
                  <h2 className="font-semibold text-lg">
                    Group {grp.groupId}
                  </h2>

                  <p className="text-sm text-muted-foreground">
                    {grp.memberCount} Members
                  </p>

                  {/* MEMBERS */}
                  <div className="text-xs mt-2 space-y-1">
                    {grp.members && grp.members.length > 0 ? (
                      grp.members.map((m, i) => (
                        <p key={i}>
                          {m.name} ({m.Technology})
                        </p>
                      ))
                    ) : (
                      <p className="text-muted-foreground">
                        No members yet
                      </p>
                    )}
                  </div>
                </div>

                {/* RIGHT */}
                <button
                  onClick={() => handleJoinGroup(grp.groupId)}
                  className="bg-primary text-white px-4 py-2 rounded-md hover:opacity-90"
                >
                  Join
                </button>

              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}