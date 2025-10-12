import TaskDetail from "../../pages/common/TaskDetail";
import { NavigationProvider } from "@/lib/navigation";

export default function TaskDetailExample() {
  return (
    <NavigationProvider>
      <TaskDetail />
    </NavigationProvider>
  );
}
