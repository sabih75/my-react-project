import QueueAnalytics from "../../pages/queue/QueueAnalytics";
import { NavigationProvider } from "@/lib/navigation";

export default function QueueAnalyticsExample() {
  return (
    <NavigationProvider>
      <QueueAnalytics />
    </NavigationProvider>
  );
}
