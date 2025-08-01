"use client";

import {
  Album, // Ícone para 'Projetos'
  List, // Ícone para 'Listas de Materiais' (BOMs)
  Package, // Ícone para 'Materiais' ou 'Peças'
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface SidebarLink {
  href: string;
  label: string;
  icon?: React.ReactNode;
}

const sidebarLinks: SidebarLink[] = [
  {
    href: "/projects",
    label: "Bibliotecas",
    icon: <Album className="mr-2 h-4 w-4" />,
  },
  {
    href: "/parts",
    label: "Banco de dados",
    icon: <Package className="mr-2 h-4 w-4" />,
  },
  {
    href: "/boms",
    label: "Listas de Materiais",
    icon: <List className="mr-2 h-4 w-4" />,
  },
  // Adicione mais links conforme necessário, como 'Fornecedores' ou 'Relatórios'
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="bg-card hidden h-screen w-64 flex-shrink-0 flex-col border-r p-4 lg:flex">
      <div className="flex h-16 items-center px-4">
        <h1 className="text-xl font-bold">Gerenciador de Materiais</h1>
      </div>
      <Separator className="my-4" />
      <nav className="flex-1">
        <ul className="space-y-2">
          {sidebarLinks.map((link) => (
            <li key={link.href}>
              <Button
                variant={pathname.startsWith(link.href) ? "secondary" : "ghost"}
                className={cn("w-full justify-start text-sm", {
                  "bg-muted font-semibold": pathname.startsWith(link.href),
                })}
                asChild
              >
                <Link href={link.href}>
                  {link.icon}
                  {link.label}
                </Link>
              </Button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
