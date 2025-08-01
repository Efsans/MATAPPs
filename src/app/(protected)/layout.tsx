import type { Metadata } from "next";

import { cn } from "@/lib/utils";

import { Sidebar } from "./_components/sidebar";

export const metadata: Metadata = {
  title: "Dashboard | Minha Aplicação",
  description: "Área administrativa da minha aplicação.",
};

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar - Componente que conterá a navegação */}
      <Sidebar />

      {/* Área de Conteúdo Principal */}
      <main className="bg-background flex-1 overflow-auto p-6 lg:p-12">
        {children}
      </main>
    </div>
  );
}
