"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { MobileLayout } from "@/components/MobileLayout";
import { AppBar } from "@/components/AppBar";
import { Bell, CheckCircle, AlertCircle, Info, Clock, Calendar, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const API_BASE = "http://localhost/ProgressMonitoringProject/api";

export default function NotificationsCenter() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get user from local storage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user?.id;

  useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [userId]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/notifications/get-all/${userId}`);
      setNotifications(res.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.post(`${API_BASE}/notifications/mark-read/${notificationId}/${userId}`);
      // Update local state
      setNotifications(prev =>
        prev.map(n => n.Id === notificationId ? { ...n, IsRead: 1 } : n)
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.IsRead);
    for (const n of unread) {
      await markAsRead(n.Id);
    }
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    return date.toLocaleDateString();
  };

  const getIcon = (type) => {
    switch (type) {
      case "Meeting Scheduled":
      case "New Committee Meeting Scheduled":
      case "Supervisor Meeting Scheduled":
        return Calendar;
      case "Evaluation Update": return CheckCircle;
      case "Queue Reordered": return AlertCircle;
      case "New Task Assigned": return Briefcase;
      default: return Info;
    }
  };

  return (
    <>
      <AppBar title="Notifications" />

      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Updates</h2>
          <Badge variant="secondary">
            {notifications.filter((n) => !n.IsRead).length} new
          </Badge>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <p>Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Bell size={48} className="mb-4 opacity-20" />
            <p>No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => {
              const Icon = getIcon(notification.Title);
              const isUnread = !notification.IsRead;

              return (
                <div
                  key={notification.Id}
                  onClick={() => isUnread && markAsRead(notification.Id)}
                  className={`p-4 rounded-xl border transition-all ${isUnread
                    ? "bg-primary/5 border-primary/20"
                    : "bg-card border-border opacity-75"
                    } hover:shadow-md cursor-pointer`}
                >
                  <div className="flex gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isUnread ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                      }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className={`font-semibold text-sm ${isUnread ? "text-foreground" : "text-muted-foreground"}`}>
                          {notification.Title}
                        </h3>
                        {isUnread && (
                          <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {notification.Message}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <Clock size={10} />
                        {getTimeAgo(notification.CreatedAt)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {notifications.some(n => !n.IsRead) && (
          <button
            onClick={markAllRead}
            className="w-full p-3 rounded-lg text-sm text-primary font-medium hover:bg-primary/5 transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>
    </>
  );
}
