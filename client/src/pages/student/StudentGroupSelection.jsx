import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Bell, PlusCircle, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MobileLayout } from "@/components/MobileLayout";
import { Card } from "@/components/ui/card";

export default function StudentGroupSelection1() {
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState(null);
  const [groupDescription, setGroupDescription] = useState("");
  const [nextGroupNumber, setNextGroupNumber] = useState(1);
  const [availableGroups, setAvailableGroups] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [studentList, setStudentList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const studentId = "2018-ARID-0996";

  const [members, setMembers] = useState([
    { name: "", regNo: "", section: "", technology: "", cgpa: "" },
  ]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  useEffect(() => {
    // Load or initialize groups
    let savedGroups = JSON.parse(localStorage.getItem("groups") || "[]");
    if (savedGroups.length === 0) {
      savedGroups = [
        {
          id: "grp1",
          name: "Group 1",
          description: "AI-based Attendance System",
          maxMembers: 5,
          members: [
            {
              name: "Ali Hassan",
              regNo: "21-ARID-3185",
              section: "BSCS-8A",
              technology: "React JS",
              cgpa: "3.65",
            },
            {
              name: "Irum Zahra",
              regNo: "22-ARID-3050",
              section: "BSCS-8A",
              technology: "Python (AI)",
              cgpa: "3.75",
            },
          ],
        },
      ];
      localStorage.setItem("groups", JSON.stringify(savedGroups));
    }
    setAvailableGroups(savedGroups);
    setNextGroupNumber(savedGroups.length + 1);

    // Load notifications
    const savedNotifs = JSON.parse(localStorage.getItem("notifications") || "[]");
    setNotifications(savedNotifs.filter((n) => n.to === studentId));

    // Load or create students
    const savedStudents = JSON.parse(localStorage.getItem("students") || "[]");
    if (savedStudents.length === 0) {
      const dummyStudents = [
        { name: "Asad", regNo: "22-ARID-3298", technology: "Flutter", cgpa: "3.50" },
        { name: "Ali Hassan", regNo: "21-ARID-3185", technology: "React JS", cgpa: "3.65" },
        { name: "Irum Zahra", regNo: "22-ARID-3050", technology: "AI / ML", cgpa: "3.75" },
        { name: "Ershian Anwar", regNo: "21-ARID-3302", technology: "Node.js", cgpa: "3.55" },
        { name: "Sabih Ul Hassan", regNo: "20-ARID-2999", technology: "Full Stack", cgpa: "3.88" },
      ];
      localStorage.setItem("students", JSON.stringify(dummyStudents));
      setStudentList(dummyStudents);
    } else {
      setStudentList(savedStudents);
    }
  }, []);

  const handleAddMember = () => {
    if (members.length >= 5) return alert("Max 5 members allowed!");
    setMembers([...members, { name: "", regNo: "", section: "", technology: "", cgpa: "" }]);
  };

  const handleRemoveMember = (index) => {
    if (index === 0) return alert("You cannot remove the creator!");
    setMembers(members.filter((_, i) => i !== index));
  };

  const handleMemberChange = (index, field, value) => {
    const updated = [...members];
    updated[index][field] = value;
    setMembers(updated);
  };

  const handleCreateGroup = () => {
    if (!groupDescription.trim()) return alert("Please enter a group description.");
    if (members.some((m) => !m.name || !m.regNo || !m.section || !m.technology || !m.cgpa))
      return alert("Please fill in all member details.");

    const savedGroups = JSON.parse(localStorage.getItem("groups") || "[]");
    const groupName = `Group ${nextGroupNumber}`;
    const newGroup = {
      id: `grp${nextGroupNumber}`,
      name: groupName,
      description: groupDescription,
      maxMembers: 5,
      members,
    };

    const updatedGroups = [...savedGroups, newGroup];
    localStorage.setItem("groups", JSON.stringify(updatedGroups));
    localStorage.setItem(`group-${studentId}`, newGroup.id);

    alert("Group created successfully!");
    setAvailableGroups(updatedGroups);
    setMode("invite");
  };

  const handleSendRequest = (student) => {
    const newNotif = {
      id: `notif-${Date.now()}`,
      to: student.regNo,
      type: "group_request",
      message: `${members[0].name || "You"} invited ${student.name} to join your group.`,
      createdAt: new Date().toISOString(),
    };
    const savedNotifs = JSON.parse(localStorage.getItem("notifications") || "[]");
    localStorage.setItem("notifications", JSON.stringify([...savedNotifs, newNotif]));
    alert(`Request sent to ${student.name}!`);
  };

  const groupMemberTechs = members.map((m) => m.technology.toLowerCase());
  const allGroupMembersRegNos = availableGroups.flatMap((g) => g.members.map((m) => m.regNo));
  const filteredStudents = studentList.filter(
    (s) =>
      !allGroupMembersRegNos.includes(s.regNo) &&
      !groupMemberTechs.includes(s.technology.toLowerCase()) &&
      (s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.regNo.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredGroups = availableGroups.filter(
    (g) =>
      g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.members.some((m) =>
        m.technology.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const handleJoinRequest = () => {
    if (!selectedGroupId) return alert("Please select a group first!");
    const group = availableGroups.find((g) => g.id === selectedGroupId);
    if (!group) return alert("Invalid group selected.");

    const newNotif = {
      id: `notif-${Date.now()}`,
      to: group.members[0]?.regNo || "unknown",
      type: "join_request",
      message: `${studentId} requested to join ${group.name}.`,
      createdAt: new Date().toISOString(),
    };
    const savedNotifs = JSON.parse(localStorage.getItem("notifications") || "[]");
    localStorage.setItem("notifications", JSON.stringify([...savedNotifs, newNotif]));

    alert(`Join request sent to ${group.name}`);
  };

  return (
    <MobileLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold"></h1>
          <button onClick={() => setShowNotifications(!showNotifications)} className="relative">
            <Bell className="w-6 h-6 text-gray-700" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 rounded-full">
                {notifications.length}
              </span>
            )}
          </button>
        </div>

        {/* --- JOIN EXISTING GROUP --- */}
        {mode === "join" && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-center">Join Existing Group</h1>

            {/* Search Bar */}
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-500" />
              <Input
                placeholder="Search groups by name, description, or technology..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Group List */}
            {filteredGroups.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center">
                No matching groups found.
              </p>
            ) : (
              filteredGroups.map((group) => (
                <Card
                  key={group.id}
                  onClick={() => setSelectedGroupId(group.id)}
                  className={`p-4 border shadow-sm bg-card cursor-pointer transition-all ${
                    selectedGroupId === group.id ? "border-blue-500 bg-blue-50" : ""
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-lg">{group.name}</h2>
                    <input
                      type="radio"
                      name="groupSelect"
                      checked={selectedGroupId === group.id}
                      onChange={() => setSelectedGroupId(group.id)}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {group.description}
                  </p>
                  <p className="text-sm mb-1">
                    Members: {group.members.length} / {group.maxMembers}
                  </p>
                  <ul className="ml-4 text-sm text-muted-foreground">
                    {group.members.map((m, i) => (
                      <li key={i} className="mb-1">
                        • <b>{m.name}</b> ({m.regNo}) — {m.section} — {m.technology} — CGPA: {m.cgpa}
                      </li>
                    ))}
                  </ul>
                </Card>
              ))
            )}

            {/* Join Button */}
            <Button
              disabled={!selectedGroupId}
              className="w-full"
              onClick={handleJoinRequest}
            >
              Send Join Request
            </Button>

            <Button variant="outline" className="w-full" onClick={() => setMode(null)}>
              Back
            </Button>
          </div>
        )}

        {/* --- DEFAULT OPTIONS --- */}
        {!mode && (
          <div className="space-y-4 mt-6">
            <Button className="w-full" onClick={() => setMode("create")}>
              Create New Group
            </Button>
            <Button variant="outline" className="w-full" onClick={() => setMode("join")}>
              Join Existing Group
            </Button>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
