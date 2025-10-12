import { MobileLayout } from "@/components/MobileLayout";
import { AppBar } from "@/components/AppBar";
import { Bell, CheckCircle, AlertCircle, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function NotificationsCenter() {
  const notifications = [
    {
      id: 1,
      type: "success",
      icon: CheckCircle,
      title: "Task Assigned Successfully",
      message: "Group Alpha has been assigned a new task",
      time: "5 min ago",
      unread: true,
    },
    {
      id: 2,
      type: "warning",
      icon: AlertCircle,
      title: "Queue Item Pending",
      message: "Meeting approval for Group Beta waiting for 3 hours",
      time: "1 hour ago",
      unread: true,
    },
    {
      id: 3,
      type: "info",
      icon: Info,
      title: "New Queue Item",
      message: "Grade review request added to queue",
      time: "2 hours ago",
      unread: false,
    },
    {
      id: 4,
      type: "success",
      icon: CheckCircle,
      title: "Queue Processed",
      message: "Task assignment completed for Group Gamma",
      time: "3 hours ago",
      unread: false,
    },
  ];

  const iconColors = {
    success: "text-chart-2",
    warning: "text-chart-3",
    info: "text-primary",
  };

  const bgColors = {
    success: "bg-chart-2/10",
    warning: "bg-chart-3/10",
    info: "bg-primary/10",
  };

  return (
    <MobileLayout>
      <AppBar title="Notifications" />
      
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Updates</h2>
          <Badge variant="secondary">
            {notifications.filter((n) => n.unread).length} new
          </Badge>
        </div>

        <div className="space-y-2">
          {notifications.map((notification) => {
            const Icon = notification.icon;
            return (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border ${
                  notification.unread
                    ? "bg-primary/5 border-primary/20"
                    : "bg-card border-card-border"
                } hover-elevate active-elevate-2 cursor-pointer`}
                data-testid={`notification-${notification.id}`}
              >
                <div className="flex gap-3">
                  <div
                    className={`w-10 h-10 rounded-full ${bgColors[notification.type as keyof typeof bgColors]} flex items-center justify-center flex-shrink-0`}
                  >
                    <Icon className={`w-5 h-5 ${iconColors[notification.type as keyof typeof iconColors]}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-sm">{notification.title}</h3>
                      {notification.unread && (
                        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground">{notification.time}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          className="w-full p-3 rounded-lg text-sm text-primary font-medium hover-elevate active-elevate-2"
          data-testid="button-mark-all-read"
        >
          Mark all as read
        </button>
      </div>
    </MobileLayout>
  );
}
