import Login from "../../pages/Login";
import { NavigationProvider } from "@/lib/navigation";

export default function LoginExample() {
  return (
    <NavigationProvider>
      <Login />
    </NavigationProvider>
  );
}
