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
  const [genderFilter, setGenderFilter] = useState("ALL");
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
      const res = await axios.get(
        `${API}/students/eligible-groups/${studentId}`
      );

      const data = typeof res.data === "string"
        ? JSON.parse(res.data)
        : res.data;

      setGroups(data || []);
    } catch (err) {
      console.error("Error fetching groups:", err);
      if (err?.response?.data) {
        alert(err.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ SEARCH & GENDER FILTER
  const filteredGroups = groups.filter((g) => {
    // Search filter
    const matchesSearch = `group ${g.groupId}`.toLowerCase().includes(search.toLowerCase());

    // Gender classification: even if one female member exists, it's considered a Female group
    const hasFemale = g.members && g.members.some(m =>
      m.gender && (m.gender.toLowerCase() === "female" || m.gender.toLowerCase() === "f")
    );
    const groupGender = hasFemale ? "Female" : "Male";

    const matchesGender = genderFilter === "ALL" || groupGender === genderFilter;

    return matchesSearch && matchesGender;
  });

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
      <div className="w-full max-w-3xl bg-card border rounded-3xl shadow-xl p-6 space-y-6">

        {/* TITLE */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Join Existing Group</h1>
          <p className="text-sm text-muted-foreground">
            Only eligible groups are shown (FYP + Technology filtered)
          </p>
        </div>

        {/* FILTERS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="text-xs font-bold text-muted-foreground uppercase">Search</label>
            <Input
              placeholder="Search group..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-xl h-11 mt-1"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase">Gender Filter</label>
            <select
              className="w-full h-11 border rounded-xl px-3 bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm font-medium mt-1"
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
            >
              <option value="ALL">All Genders</option>
              <option value="Male">Male Groups</option>
              <option value="Female">Has Female</option>
            </select>
          </div>
        </div>

        {/* GROUP LIST */}
        <div className="space-y-4">

          {loading && (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}

          {!loading && filteredGroups.length === 0 && (
            <div className="text-center py-12 border rounded-2xl border-dashed bg-card">
              <p className="text-muted-foreground text-sm font-medium">
                No eligible groups match your criteria
              </p>
            </div>
          )}

          {!loading && filteredGroups.map((grp) => {
            const hasFemale = grp.members && grp.members.some(m =>
              m.gender && (m.gender.toLowerCase() === "female" || m.gender.toLowerCase() === "f")
            );

            return (
              <div
                key={grp.groupId}
                className="border rounded-2xl p-5 bg-card hover:bg-muted/10 transition shadow-sm hover:shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                  {/* LEFT */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <h2 className="font-bold text-lg text-foreground">
                        Group {grp.groupId}
                      </h2>
                      {hasFemale ? (
                        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-extrabold bg-pink-50 text-pink-600 border border-pink-100">
                          Female Group
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-extrabold bg-blue-50 text-blue-600 border border-blue-100">
                          Male Group
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground font-semibold uppercase">
                      {grp.memberCount} / 3 Members
                    </p>

                    {/* MEMBERS */}
                    <div className="text-sm space-y-1 bg-muted/30 p-3 rounded-xl border">
                      {grp.members && grp.members.length > 0 ? (
                        grp.members.map((m, i) => (
                          <div key={i} className="flex justify-between text-xs text-muted-foreground">
                            <span className="font-semibold text-foreground">{m.name}</span>
                            <span>{m.Technology}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground text-xs">
                          No members yet
                        </p>
                      )}
                    </div>
                  </div>

                  {/* RIGHT */}
                  <div className="flex items-center justify-end">
                    <button
                      onClick={() => handleJoinGroup(grp.groupId)}
                      className="bg-primary text-white font-bold text-sm px-6 py-2.5 rounded-xl hover:opacity-90 transition shadow-lg shadow-primary/10"
                    >
                      Join Group
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}