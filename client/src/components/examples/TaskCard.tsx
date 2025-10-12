import { TaskCard } from "../TaskCard";

export default function TaskCardExample() {
  return (
    <div className="p-4 space-y-3">
      <TaskCard
        title="Complete Literature Review"
        dueDate="Due: Dec 20, 2024"
        status="pending"
        priority="high"
      />
      <TaskCard
        title="Implement Database Schema"
        dueDate="Due: Dec 15, 2024"
        status="completed"
        priority="medium"
      />
    </div>
  );
}
