"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Home,
  Calendar,
  Building2,
  CreditCard,
  Calculator,
  Wrench,
  TrendingUp,
  MapPin,
  Archive,
  BarChart3,
  FileText,
  Users,
  Settings,
  Menu,
} from "lucide-react"

const menuItems = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Calendário", href: "/calendario", icon: Calendar },
  { name: "Ativos", href: "/", icon: Building2 },
  { name: "Créditos Fiscais", href: "/creditos", icon: CreditCard },
  { name: "Depreciação", href: "/depreciacao", icon: Calculator },
  { name: "Manutenção", href: "/manutencao", icon: Wrench },
  { name: "Reavaliação", href: "/reavaliacao", icon: TrendingUp },
  { name: "Aluguéis", href: "/alugueis", icon: MapPin },
  { name: "Baixados", href: "/baixados", icon: Archive },
  { name: "Balanço", href: "/balanco", icon: BarChart3 },
  { name: "Relatórios", href: "/relatorios", icon: FileText },
  { name: "Pessoas", href: "/pessoa", icon: Users },
  { name: "Parâmetros", href: "/parametros", icon: Settings },
  { name: "Configurações", href: "/configuracoes", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Building2 className="h-6 w-6" />
          <span>Controle de Ativos</span>
        </Link>
      </div>
      <div className="flex-1">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-all hover:text-sidebar-primary",
                  isActive && "bg-sidebar-accent text-sidebar-primary",
                )}
                onClick={() => setOpen(false)}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden border-r bg-sidebar md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <SidebarContent />
        </div>
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden bg-transparent">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  )
}
