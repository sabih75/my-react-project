"use client";

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  Bell,
  ClipboardList,
  CheckCircle,
  Users,
  ArrowRight,
  Eye,
  Award,
} from "lucide-react";
import axios from "axios";

import { AppBar } from "@/components/AppBar";
import CommitteeHeadLayout from "./ComitteeHeadLayoutScreen";

const API_BASE = "http://localhost/ProgressMonitoringProject/api";

export default function DirectorDashboard() {
  const [, setLocation] = useLocation();

  const [activeFYP, setActiveFYP] = useState("FYP-1");
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Load notifications ONLY from DB
  const loadNotifications = async () => {
      // const res = await axios.get(
      //   `${API_BASE}/notifications/committee-head`
      // );
      // setNotifications(res.data);
  };

  useEffect(() => {
    setLoading(true);
    loadNotifications().finally(() => setLoading(false));
    localStorage.setItem("type", JSON.stringify(activeFYP));
  }, [activeFYP]);

  // const unreadCount = notifications.filter((n) => n.unread).length;

  // const openNotification = async (notif) => {
  //   await axios.post(
  //     `${API_BASE}/notifications/mark-read/${notif.id}`
  //   );

  //   setNotifications((prev) =>
  //     prev.map((n) =>
  //       n.id === notif.id ? { ...n, unread: false } : n
  //     )
  //   );

  //   if (notif.redirectUrl) {
  //     setLocation(notif.redirectUrl);
  //   }
  // };

  if (loading) {
    return (
      <CommitteeHeadLayout>
        <p className="p-4 text-center text-muted-foreground">
          Loading dashboard...
        </p>
      </CommitteeHeadLayout>
    );
  }

  return (
    <CommitteeHeadLayout>

      {/* TOP BAR */}
      <AppBar title="Committee Head Dashboard" />

      {/* FYP TOGGLE */}
      <div className="flex justify-center gap-4 mt-2">
        {["FYP-1", "FYP-2"].map((fyp) => (
          <button
            key={fyp}
            onClick={() => setActiveFYP(fyp)}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeFYP === fyp
                ? "bg-primary text-white"
                : "bg-muted"
            }`}
          >
            {fyp}
          </button>
        ))}
      </div>

      {/* QUICK ACTIONS */}
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>

        <div className="grid grid-cols-2 gap-3">

          {/* COMMON FOR BOTH */}
          <ActionBtn
  icon={<ClipboardList />}
  label="Set Criteria"
  onClick={() =>
    setLocation(
      activeFYP === "FYP-2"
        ? "/director/assign-criteriafyp2"
        : "/director/assign-criteria"
    )
  }
/>

<ActionBtn
  icon={<Eye />}
  label="View Criteria"
  onClick={() =>
    setLocation(
      activeFYP === "FYP-2"
        ? "/director/view-criteriafyp2"
        : "/director/view-criteria"
    )
  }
/>
          <ActionBtn
            icon={<Eye />}
            label="Meeting Queue"
            onClick={() => setLocation("/committee-head/meeting-queue")}
          />
          <ActionBtn
            icon={<Award />}
            label="Grading Analysis"
            onClick={() => setLocation("/director/grading-analysis")}
          />

          {/* ONLY FYP-2 */}
          {activeFYP === "FYP-2" && (
            <>
              <ActionBtn
                icon={<CheckCircle />}
                label="Final Task"
                onClick={() => setLocation("/committee-head/final-task")}
              />

              <ActionBtn
                icon={<Users />}
                label="Mid Task Allocation"
                onClick={() => setLocation("/supervisor/mid-task")}
              />
            </>
          )}
        </div>
      </div>

      NOTIFICATIONS
      {/* {showNotifications && (
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t p-4 rounded-t-xl shadow-xl max-h-[45vh] overflow-y-auto">
          <h3 className="font-semibold mb-3">Notifications</h3>

          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => openNotification(n)}
              className={`p-3 rounded-lg text-sm flex justify-between items-center cursor-pointer ${
                n.unread ? "bg-primary/10" : "bg-muted"
              }`}
            >
              {n.message}
              <ArrowRight className="w-4 h-4" />
            </div>
          ))}
        </div>
      )} */}
    </CommitteeHeadLayout>
  );
}

/* 🔹 Reusable Button */
const ActionBtn = ({ icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="p-4 rounded-lg bg-card border hover-elevate text-left"
  >
    <span className="w-5 h-5 text-primary mb-2 inline-block">
      {icon}
    </span>
    <p className="text-sm font-medium">{label}</p>
  </button>
);