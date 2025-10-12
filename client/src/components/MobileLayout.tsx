import { ReactNode } from "react";
import { BottomNav } from "./BottomNav";

interface MobileLayoutProps {
  children: ReactNode;
  showBottomNav?: boolean;
}

export function MobileLayout({ children, showBottomNav = true }: MobileLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-mobile relative flex flex-col min-h-screen">
        <main className={`flex-1 ${showBottomNav ? 'pb-16' : ''}`}>
          {children}
        </main>
        {showBottomNav && <BottomNav />}
      </div>
    </div>
  );
}

export default MobileLayout;
