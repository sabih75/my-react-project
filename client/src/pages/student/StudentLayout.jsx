import { Home, Calendar, CheckSquare, User, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation,useParams } from "wouter";
import axios from "axios";

export default function StudentLayout({ children }) {
  const [location, setLocation] = useLocation();
  const [type, setType ]= useState();
  const [ groupId, setGroupId ] = useState();
  



  useEffect(()=>{
      const user1 = localStorage.getItem("user");

const userJ = JSON.parse(user1);
      const studentId = userJ.id;

       axios.get(
        `http://localhost/ProgressMonitoringProject/api/students/${studentId}`
      ).then((res)=> {  setType(res.data.FypType);
      setGroupId(res.data.GroupId); }).catch(()=>alert("No Found!"));

      // 🔥 Map backend fields to frontend fields
      



  })

  const navItems = [
    { label: "Home", icon: Home, path: "/student/dashboard" },
    { label: "Meetings", icon: Calendar, path:  `/student/meetings/${type}/${groupId}` },
    { label: "Tasks", icon: CheckSquare, path: `/student/tasks/${groupId}` },
    { label: "GroupDetail", icon: Users, path: "/student/group-details" },
    { label: "Profile", icon: User, path: "/student/profile" },
    
    
  ];

  return (
    <div className="flex min-h-screen bg-muted/40">
      
      {/* ========== SIDEBAR (Desktop) ========== */}
      <div className="hidden md:flex flex-col w-64 bg-background border-r p-4">
        <h2 className="text-lg font-semibold mb-6">Student Panel</h2>

        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = location === item.path;

          return (
            <button
              key={index}
              onClick={() => setLocation(item.path)}
              className={`flex items-center gap-3 p-3 rounded-md text-sm mb-2 transition ${
                isActive
                  ? "bg-primary text-white"
                  : "hover:bg-muted text-muted-foreground"
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* ========== MAIN CONTENT ========== */}
      <div className="flex-1 pb-20 md:pb-0">
        {children}
      </div>

      {/* ========== BOTTOM NAV (Mobile) ========== */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-background border-t">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location === item.path;

            return (
              <button
                key={index}
                onClick={() => setLocation(item.path)}
                className={`flex flex-col items-center text-xs ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className="w-5 h-5 mb-1" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}