import QueueDashboard from "../../pages/queue/QueueDashboard";
import { NavigationProvider } from "@/lib/navigation";

export default function QueueDashboardExample() {
  return (
    <NavigationProvider>
      <QueueDashboard />
    </NavigationProvider>
  );
}
