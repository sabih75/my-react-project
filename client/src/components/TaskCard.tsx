import { Clock, ChevronRight } from "lucide-react";
import { Badge } from "./ui/badge";

interface TaskCardProps {
  title: string;
  dueDate: string;
  status: "pending" | "completed" | "overdue";
  priority?: "high" | "medium" | "low";
  onClick?: () => void;
}

export function TaskCard({ title, dueDate, status, priority = "medium", onClick }: TaskCardProps) {
  const statusColors = {
    pending: "bg-chart-3 text-white",
    completed: "bg-chart-2 text-white",
    overdue: "bg-destructive text-destructive-foreground",
  };

  const priorityColors = {
    high: "border-l-destructive",
    medium: "border-l-chart-3",
    low: "border-l-chart-2",
  };

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-lg bg-card border border-card-border border-l-4 ${priorityColors[priority]} hover-elevate active-elevate-2 cursor-pointer`}
      data-testid={`card-task-${title.replace(/\s+/g, '-').toLowerCase()}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm line-clamp-2">{title}</h3>
          <div className="flex items-center gap-2 mt-2">
            <Clock className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{dueDate}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`text-xs ${statusColors[status]}`}>
            {status}
          </Badge>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}
