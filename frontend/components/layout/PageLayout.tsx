import { ReactNode } from "react";
import BottomTabs from "./BottomTabs";

export function PageLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex-1 container py-6">
      {children}
    </main>
  );
}
