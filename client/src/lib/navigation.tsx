import { createContext, useContext, useState, ReactNode } from "react";

type UserRole = "student" | "supervisor" | "committee" | "queue";

type NavigationContextType = {
  userRole: UserRole | null;
  setUserRole: (role: UserRole | null) => void;
};

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  return (
    <NavigationContext.Provider value={{ userRole, setUserRole }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) throw new Error("useNavigation must be used within NavigationProvider");
  return context;
}
