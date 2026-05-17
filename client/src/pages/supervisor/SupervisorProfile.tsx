import { useEffect, useState } from "react";
import axios from "axios";
import CommitteeLayout from "../committee/CommitteeLayout";
import { AppBar } from "@/components/AppBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import SupervisorLayout from "./SupervisorLayout";

const API_BASE = "http://localhost/ProgressMonitoringProject/api";

export default function SupervisorProfile() {
  const [profile, setProfile] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
 const user1 = localStorage.getItem("user");
    if (!user1) return;

    const userJ = JSON.parse(user1);
    const comitteeId = userJ.id;

    

      const res = await axios.get(
        `${API_BASE}/committee-meetings/Profile?id=${comitteeId}`
      );
      setProfile(res.data);
    } catch (err) {
      console.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: any) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await axios.put(
        `${API_BASE}/committee-meetings/Profile`,
        profile
      );
      setEditMode(false);
      alert("Profile updated successfully");
    } catch {
      alert("Failed to update profile");
    }
  };

  const handleLogout = () => {
    // Clear user session (example: localStorage)
    localStorage.clear();
    // Redirect to login or home page
    setLocation("/"); // change "/login" to your login route
  };

  if (loading) {
    return (
      <SupervisorLayout>
        <AppBar title="My Profile" showBack />
        <div className="p-6">Loading profile...</div>
      </SupervisorLayout>
    );
  }

  const initials =
    profile?.name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase() || "";

  return (
    <SupervisorLayout>
      <AppBar title="My Profile" showBack />

      <div className="p-6 space-y-6">

        {/* 🔵 Header Section */}
        <div className="flex flex-col items-center text-center space-y-3">

          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center text-primary text-3xl font-bold">
            {initials}
          </div>

          {/* Name */}
          {editMode ? (
            <Input
              name="name"
              value={profile?.name || ""}
              onChange={handleChange}
              className="text-center max-w-xs"
            />
          ) : (
            <h2 className="text-xl font-semibold">
              {profile?.name}
            </h2>
          )}

          <p className="text-muted-foreground text-sm">
            Committee Member
          </p>

          {!editMode && (
            <Button
              variant="outline"
              onClick={() => setEditMode(true)}
            >
              Edit Profile
            </Button>
          )}
        </div>

        {/* 🧾 Details Card */}
        <div className="bg-card border border-card-border rounded-xl p-6 space-y-6">

          {/* ID */}
          <div>
            <p className="text-sm text-muted-foreground">Committee ID</p>
            <p className="font-medium">{profile?.id}</p>
          </div>

          {/* Email */}
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            {editMode ? (
              <Input
                name="email"
                value={profile?.email || ""}
                onChange={handleChange}
              />
            ) : (
              <p className="font-medium">{profile?.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <p className="text-sm text-muted-foreground">Password</p>
            {editMode ? (
              <Input
                name="password"
                type="password"
                value={profile?.password || ""}
                onChange={handleChange}
              />
            ) : (
              <p className="font-medium">••••••••</p>
            )}
          </div>

          {/* Save Buttons */}
          {editMode && (
            <div className="flex gap-3 pt-4">
              <Button onClick={handleSave}>
                Save Changes
              </Button>
              <Button
                variant="outline"
                onClick={() => setEditMode(false)}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <div className="pt-6 border-t border-card-border">
          <Button
            variant="ghost"
            className="w-full text-red-600 hover:bg-red-50"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>

      </div>
    </SupervisorLayout>
  );
}