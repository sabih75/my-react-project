import QueueDetail from "../../pages/queue/QueueDetail";
import { NavigationProvider } from "@/lib/navigation";

export default function QueueDetailExample() {
  return (
    <NavigationProvider>
      <QueueDetail />
    </NavigationProvider>
  );
}
