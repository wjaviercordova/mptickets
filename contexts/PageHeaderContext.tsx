"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface PageHeaderInfo {
  icon: LucideIcon;
  title: string;
  subtitle: string;
}

interface PageHeaderContextType {
  headerInfo: PageHeaderInfo | null;
  setHeaderInfo: (info: PageHeaderInfo | null) => void;
}

const PageHeaderContext = createContext<PageHeaderContextType | undefined>(undefined);

export function PageHeaderProvider({ children }: { children: ReactNode }) {
  const [headerInfo, setHeaderInfo] = useState<PageHeaderInfo | null>(null);

  return (
    <PageHeaderContext.Provider value={{ headerInfo, setHeaderInfo }}>
      {children}
    </PageHeaderContext.Provider>
  );
}

export function usePageHeader() {
  const context = useContext(PageHeaderContext);
  if (context === undefined) {
    throw new Error("usePageHeader must be used within a PageHeaderProvider");
  }
  return context;
}
