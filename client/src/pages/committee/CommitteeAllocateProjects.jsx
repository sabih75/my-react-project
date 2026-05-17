import { AppBar } from "@/components/AppBar";
import { Button } from "@/components/ui/button";
import {
  Bell,
  Filter,
  Users,
  FolderGit2,
  FileCheck,
  Search,
  Upload,
  Eye,
  ArrowLeft,
  GraduationCap,
} from "lucide-react";

import { useState } from "react";

const initialProjects = [
  { id: 1, title: "AI-Based Student Management System", category: "Healthcare", suggestedBy: "Sir Zahid" },
  { id: 2, title: "Smart Campus Navigation App", category: "IoT", suggestedBy: "Sir Umar" },
  { id: 3, title: "Online Skill Learning Platform", category: "Education", suggestedBy: "Dr.Ayesha" },
  { id: 4, title: "Blockchain-Based Voting System", category: "Security", suggestedBy: "Sir Azeem" },
];

const initialGroups = [
  {
    id: 1,
    name: "Group 1",
    members: [
      { name: "Asad", regNo: "22-Arid-3298", technology: "Flutter", cgpa: 3.6 },
      { name: "Ali Hassan", regNo: "22-Arid-3402", technology: "Flutter", cgpa: 3.7 },
    ],
    allocatedProject: { title: "AI-Based Student Management System" },
    note: "High CGPA group, needs challenging project.",
  },
  {
    id: 2,
    name: "Group 2",
    members: [
      { name: "Zain", regNo: "22-Arid-3351", technology: "React", cgpa: 3.4 },
      { name: "Sana", regNo: "22-Arid-3321", technology: "React", cgpa: 3.5 },
    ],
    allocatedProject: null,
    note: "",
  },
  {
    id: 3,
    name: "Group 3",
    members: [
      { name: "Bilal", regNo: "22-Arid-3291", technology: "MERN", cgpa: 3.8 },
      { name: "Hina", regNo: "22-Arid-3276", technology: "MERN", cgpa: 3.9 },
    ],
    allocatedProject: null,
    note: "",
  },
];

const categories = ["All", "Healthcare", "Education", "IoT", "Security"];

// --- Group Assignment Component ---
function GroupAssignmentView({ group, projects, categories, onSave, onBack }) {
  const [selectedProjectTitle, setSelectedProjectTitle] = useState(group.allocatedProject?.title || "");
  const [remarks, setRemarks] = useState(group.note || "");
  const [projectSearchTerm, setProjectSearchTerm] = useState("");
  const [activeProjectCategory, setActiveProjectCategory] = useState("All");

  const availableProjects = projects.filter(p => p.title !== group.allocatedProject?.title);
  const filteredProjects = availableProjects
    .filter(p => activeProjectCategory === "All" || p.category === activeProjectCategory)
    .filter(p => p.title.toLowerCase().includes(projectSearchTerm.toLowerCase()));

  const handleSaveAssignment = () => {
    if (!selectedProjectTitle) return alert("⚠️ Please select a project before saving.");
    const project = projects.find(p => p.title === selectedProjectTitle);
    onSave(group.id, project, remarks);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">{group.name} Details</h1>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Left Column: Group Info */}
        <div className="col-span-1 space-y-4 bg-white p-4 rounded-lg shadow">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <Users className="w-6 h-6 text-gray-700" /> Team Members
          </h2>
          <ul className="space-y-2 text-sm text-gray-600 ml-2">
            {group.members.map((m, i) => (
              <li key={i}>
                <strong>{m.name}</strong> ({m.regNo}) | Tech: {m.technology} | CGPA: {m.cgpa}
              </li>
            ))}
          </ul>

          <div className="border-t pt-2">
            <p className="font-medium">Current Project:</p>
            <p className={group.allocatedProject ? "text-green-600 font-semibold" : "text-red-500"}>
              {group.allocatedProject ? group.allocatedProject.title : "No project allocated yet"}
            </p>
          </div>

          {group.note && (
            <div className="bg-green-50 p-2 rounded border-l-4 border-green-400 text-sm mt-2">
              <strong>Previous Note:</strong> {group.note}
            </div>
          )}
        </div>

        {/* Right Column: Assign Project */}
        <div className="col-span-2 space-y-6">

          {/* Project Selection */}
          <div className="bg-white p-4 rounded-lg shadow space-y-4">
            <h2 className="font-bold text-lg">Assign New Project</h2>

            <div>
              <label className="block text-sm font-medium mb-1">Select Project:</label>
              <select
                value={selectedProjectTitle}
                onChange={(e) => setSelectedProjectTitle(e.target.value)}
                className="w-full border rounded-lg p-2 text-sm"
              >
                <option value="">-- Choose a project --</option>
                {projects.map((proj) => (
                  <option key={proj.id} value={proj.title}>{proj.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Committee Remarks:</label>
              <textarea
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full border rounded-lg p-2 text-sm"
                placeholder="Write committee remarks..."
              />
            </div>

            <Button className="w-full flex items-center justify-center gap-2" onClick={handleSaveAssignment}>
              <FileCheck className="w-4 h-4" /> Save Assignment
            </Button>
          </div>

          {/* Project Discovery */}
          <div className="bg-white p-4 rounded-lg shadow space-y-4">
            <h2 className="font-bold text-lg">Project Discovery</h2>

            {/* Search & Filter */}
            <div className="flex flex-col md:flex-row gap-2">
              <div className="flex flex-1 items-center border rounded-lg p-2 gap-2">
                <Search className="w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={projectSearchTerm}
                  onChange={(e) => setProjectSearchTerm(e.target.value)}
                  placeholder="Search project title..."
                  className="flex-1 outline-none text-sm"
                />
              </div>

              <select
                value={activeProjectCategory}
                onChange={(e) => setActiveProjectCategory(e.target.value)}
                className="border rounded-lg p-2 text-sm"
              >
                {categories.map((cat) => (
                  <option key={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Filtered Projects */}
            <div className="max-h-80 overflow-y-auto space-y-2">
              {filteredProjects.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedProjectTitle(p.title)}
                  className={`p-3 rounded border text-sm cursor-pointer ${selectedProjectTitle === p.title ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                >
                  <p className="font-semibold">{p.title}</p>
                  <p className="text-xs text-gray-500">
                    Category: {p.category} | Suggested by: {p.suggestedBy}
                  </p>
                </div>
              ))}
              {filteredProjects.length === 0 && <p className="text-sm text-gray-500 text-center">No projects match criteria</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Main Component (Web Dashboard Version) ---
export default function CommitteeAllocateProjects() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [showProjectsModal, setShowProjectsModal] = useState(false);
  const [projects, setProjects] = useState(initialProjects);
  const [groups, setGroups] = useState(initialGroups);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveAssignment = (groupId, project, remarks) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? { ...g, allocatedProject: { title: project.title }, note: remarks || "" }
          : g
      )
    );
    setSelectedGroup(null);
    alert(`✅ ${project.title} allocated to ${groups.find((g) => g.id === groupId).name}`);
  };

  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (file) alert(`✅ Successfully uploaded: ${file.name}`);
  };

  if (selectedGroup) {
    const groupData = groups.find(g => g.id === selectedGroup);
    return (
      <GroupAssignmentView 
        group={groupData}
        projects={projects}
        categories={categories}
        onSave={handleSaveAssignment}
        onBack={() => setSelectedGroup(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <AppBar
        title="Project Allocation"
        actions={
          <button className="p-2 rounded-full hover:bg-gray-200">
            <Bell className="w-5 h-5 text-gray-600" />
          </button>
        }
      />

      <div className="p-6 max-w-6xl mx-auto space-y-6">

        {/* Project Management */}
        <div className="bg-white p-4 rounded-lg shadow flex flex-col md:flex-row gap-4 items-center justify-between">
          <label className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded cursor-pointer hover:bg-blue-700">
            <Upload className="w-4 h-4" /> Upload Projects
            <input type="file" accept=".xlsx,.xls" onChange={handleExcelUpload} className="hidden" />
          </label>

          <button
            onClick={() => setShowProjectsModal(true)}
            className="flex items-center gap-2 bg-gray-200 text-gray-800 px-3 py-2 rounded hover:bg-gray-300"
          >
            <Eye className="w-4 h-4" /> View All Projects ({projects.length})
          </button>
        </div>

        {/* Group Search */}
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex flex-1 items-center border rounded-lg p-2 gap-2">
            <Search className="w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search group name..."
              className="flex-1 outline-none text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value)}
              className="border rounded-lg p-2 text-sm"
            >
              {categories.map((cat) => <option key={cat}>Filter By Tech: {cat}</option>)}
            </select>
          </div>
        </div>

        {/* Groups List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredGroups.length === 0 && (
            <p className="text-center text-gray-500 col-span-full">
              No groups found matching "{searchTerm}"
            </p>
          )}

          {filteredGroups.map((group) => (
            <div
              key={group.id}
              onClick={() => setSelectedGroup(group.id)}
              className="bg-white p-4 rounded-lg shadow hover:shadow-md cursor-pointer space-y-2"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="flex items-center gap-2 font-bold text-gray-800">
                    <Users className="w-5 h-5 text-blue-600" /> {group.name}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Members: {group.members.length} | Avg. CGPA: {(group.members.reduce((sum, m) => sum + m.cgpa, 0) / group.members.length).toFixed(2)}
                  </p>
                </div>
                <FolderGit2 className="w-6 h-6 text-gray-400" />
              </div>

              {group.allocatedProject ? (
                <div className="text-sm text-green-600 border-t border-gray-200 pt-2 flex justify-between">
                  <span>✅ Allocated: {group.allocatedProject.title}</span>
                  <span className="text-xs text-blue-600">View/Change →</span>
                </div>
              ) : (
                <div className="text-sm text-red-500 border-t border-gray-200 pt-2 flex justify-between">
                  <span>❌ No project allocated</span>
                  <span className="text-xs text-blue-600">Assign Project →</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Projects Modal */}
      {showProjectsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl p-5 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Available Projects</h2>
              <button
                onClick={() => setShowProjectsModal(false)}
                className="text-2xl text-gray-500 hover:text-gray-800"
              >
                &times;
              </button>
            </div>

            {categories.filter(c => c !== "All").map((cat) => (
              <div key={cat} className="mb-4">
                <h3 className="font-bold text-base mb-2">{cat} ({projects.filter(p => p.category === cat).length})</h3>
                {projects.filter(p => p.category === cat).map((p) => (
                  <div key={p.id} className="border border-gray-300 rounded-lg p-3 mb-2 text-sm">
                    <p className="font-semibold">{p.title}</p>
                    <p className="text-gray-500 text-xs">Suggested by: {p.suggestedBy}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
