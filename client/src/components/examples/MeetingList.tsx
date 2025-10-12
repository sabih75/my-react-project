import MeetingList from "../../pages/common/MeetingList";
import { NavigationProvider } from "@/lib/navigation";

export default function MeetingListExample() {
  return (
    <NavigationProvider>
      <MeetingList />
    </NavigationProvider>
  );
}
