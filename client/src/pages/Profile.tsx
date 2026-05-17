import { useEffect, useState } from "react";
import { MobileLayout } from "@/components/MobileLayout";
import { AppBar } from "@/components/AppBar";
import {
  User,
  Mail,
  Phone,
  Building,
  LogOut,
  Edit,
  KeyRound,
  Laptop,
  Calendar,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import StudentLayout from "./student/StudentLayout";
import axios from "axios";

/* ----------------------------- Main Component ----------------------------- */
export default function Profile() {
  const [, setLocation] = useLocation();
  const [isEditing, setIsEditing] = useState<boolean>(false);

  interface UserData {
  name: string;
  regNo: string;
  gender: string;
  cgpa: number;
  phone: string;
  department: string;
  technology: string;
  session: string;
  fypType: string;
  group: string;
  project: string;
  supervisor: string;
  password: string;
}

const [userData, setUserData] = useState<UserData>({
  name: "",
  regNo: "",
  gender: "",
  cgpa: 0.0,

  phone: "",
  department: "",
  technology: "",
  session: "",
  fypType: "",
  group: "",
  project: "",
  supervisor: "",
  password: "",
});



  const handleLogout = () => {
    console.log("Logging out...");
    setLocation("/");
  };

  const handleEditToggle = () => setIsEditing((prev) => !prev);

 const handleChange = (field: keyof UserData, value: string) => {
  setUserData((prev) => ({
    ...prev,
    [field]: field === "cgpa" ? parseFloat(value) || 0 : value,
  }));
};
useEffect(() => {
  const fetchProfile = async () => {
    try {
      const user1 = localStorage.getItem("user");
      if (!user1) return;

      const userJ = JSON.parse(user1);
      const studentId = userJ.id;

      const res = await axios.get(
        `http://localhost/ProgressMonitoringProject/api/students/${studentId}`
      );

      // 🔥 Map backend fields to frontend fields
      const data = res.data;

      setUserData({
        name: data.name || "",
        regNo: data.regNum|| data.registrationNo || "",
        gender: data.gender || "",
        cgpa: data.currentCGPA || 0.0,
        phone: data.phoneNo || "",
        department: data.studentDepartment || "",
        technology: data.selectedTech || "",
        session: data.admissionSession || "",
        fypType: data.FypType || "",
        group: data.GroupId || "",
        project: data.Project || "No Project Allocated",
        supervisor: data.Supervisor || "",
        password: "*******", // never return password from backend
      });
    } catch (err) {
      console.error("Failed to fetch profile data:", err);
    }
  };

  fetchProfile();
}, []);  

const handleSave = async () => {
  try {
    const user1 = localStorage.getItem("user");
    if (!user1) return;

    const userJ = JSON.parse(user1);
    const studentId = userJ.id;

    
    alert("hehehe");

    await axios.post(
      `http://localhost/ProgressMonitoringProject/api/students/updatePassword?id=${studentId}&password=${userData.password}`
    );

    alert("Profile updated successfully ✅");
    setIsEditing(false);
  } catch (err) {
    console.error("Failed to update profile:", err);
    alert("Update failed ❌");
  }
};

  return (
    <StudentLayout>
      <AppBar title="Profile" />

      <div className="p-4 space-y-6">
        {/* Avatar + Basic Info */}
        <div className="flex flex-col items-center py-6">
          <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center text-3xl font-bold text-primary mb-3">
          {userData.name
  ? userData.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  : "?"}
          </div>
          <h2 className="text-xl font-bold">{userData.name}</h2>
          <p className="text-sm text-muted-foreground">Student</p>
          <Button
            size="sm"
            variant="secondary"
            className="mt-3"
            onClick={handleEditToggle}
          >
            <Edit className="w-4 h-4 mr-2" />
            {isEditing ? "Cancel Edit" : "Edit Profile"}
          </Button>
        </div>

        {/* Personal Info Section */}
        <div className="bg-card border border-card-border rounded-xl p-4 space-y-4">
          <ProfileField icon={User} label="Registration No" value={userData.regNo} />
          <ProfileField
            icon={Mail}
            label="CGPA"
            value={userData.cgpa.toString()}
            
            onChange={(val) => handleChange("cgpa", val)}
          />
          
          <ProfileField
            icon={User}
            label="Gender"
            value={userData.gender}
            onChange={(val) => handleChange("gender", val)}
          />
          <ProfileField icon={Building} label="Department" value={userData.department} />
          <ProfileField
            icon={Laptop}
            label="Technology"
            value={userData.technology}
            onChange={(val) => handleChange("technology", val)}
          />
          <ProfileField icon={Calendar} label="Session" value={userData.session} />
          <ProfileField
            icon={FileText}
            label="FYP Type"
            value={userData.fypType}
            onChange={(val) => handleChange("fypType", val)}
          />
          <ProfileField
            icon={KeyRound}
            label="Password"
            type="password"
            value={userData.password}
            editable={isEditing}
            onChange={(val) => handleChange("password", val)}
          />
        </div>

        {/* Project Details Section */}
        <div className="bg-card border border-card-border rounded-xl p-4">
          <h3 className="font-semibold mb-3">Project Details</h3>
          <div className="space-y-2">
            <ProfileText label="Group" value={userData.group} />
            <ProfileText label="Project" value={userData.project} />
            <ProfileText label="Supervisor" value={userData.supervisor} />
          </div>
        </div>

        {/* Action Buttons */}
        {isEditing ? (
          <Button
            className="w-full"
            variant="default"
            onClick={handleSave}
            data-testid="button-save"
          >
            Save Changes
          </Button>
        ) : (
          <Button
            variant="outline"
            className="w-full text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
            onClick={handleLogout}
            data-testid="button-logout"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        )}
      </div>
    </StudentLayout>
  );
}

/* ----------------------------- Sub Components ----------------------------- */

// ✅ Typed props for ProfileField
interface ProfileFieldProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  editable?: boolean;
  onChange?: (val: string) => void;
  type?: string;
}

function ProfileField({
  icon: Icon,
  label,
  value,
  editable = false,
  onChange,
  type = "text",
}: ProfileFieldProps) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="w-5 h-5 text-muted-foreground" />
      <div className="flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        {editable && onChange ? (
          <Input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="mt-1 text-sm"
          />
        ) : (
          <p className="text-sm font-medium">{value}</p>
        )}
      </div>
    </div>
  );
}

// ✅ Typed props for ProfileText
interface ProfileTextProps {
  label: string;
  value: string;
}

function ProfileText({ label, value }: ProfileTextProps) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}
