import React from "react";

import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div
      className={cn("container mx-auto px-4 py-8 lg:px-6 lg:py-12", className)}
    >
      {children}
    </div>
  );
}
