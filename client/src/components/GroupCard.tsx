import { Users, ChevronRight } from "lucide-react";
import { Badge } from "./ui/badge";

interface GroupCardProps {
  groupName: string;
  projectTitle: string;
  members: string[];
  supervisor?: string;
  progress?: number;
  onClick?: () => void;
}

export function GroupCard({ groupName, projectTitle, members, supervisor, progress, onClick }: GroupCardProps) {
  return (
    <div
      onClick={onClick}
      className="p-4 rounded-lg bg-card border border-card-border hover-elevate active-elevate-2 cursor-pointer"
      data-testid={`card-group-${groupName.replace(/\s+/g, '-').toLowerCase()}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-sm">{groupName}</h3>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{projectTitle}</p>
          
          <div className="flex items-center gap-2 mb-2">
            <div className="flex -space-x-2">
              {members.slice(0, 3).map((member, index) => (
                <div
                  key={index}
                  className="w-6 h-6 rounded-full bg-primary/20 border-2 border-card flex items-center justify-center text-xs font-medium text-primary"
                >
                  {member.charAt(0)}
                </div>
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              {members.length} members
            </span>
          </div>

          {supervisor && (
            <p className="text-xs text-muted-foreground">
              Supervisor: {supervisor}
            </p>
          )}

          {progress !== undefined && (
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">Progress</span>
                <span className="text-xs font-medium">{progress}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground mt-1" />
      </div>
    </div>
  );
}
