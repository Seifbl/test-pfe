"use client"

import { useRouter, usePathname } from "next/navigation"
import { routes } from "@/constants/routes"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { LayoutDashboard, Users, Briefcase, Settings, BarChart3, Shield, MessageSquare, FileText } from "lucide-react"

const menuItems = [
  {
    title: "Dashboard",
    url: routes.admin.dashboard,
    icon: LayoutDashboard,
  },
  {
    title: "Utilisateurs",
    url: routes.admin.users,
    icon: Users,
  },
  {
    title: "Jobs",
    url: routes.admin.jobs,
    icon: Briefcase,
  },
  {
    title: "Statistiques",
    url: "/admin/analytics",
    icon: BarChart3,
  },
  {
    title: "Messages",
    url: "/admin/messages",
    icon: MessageSquare,
  },
  {
    title: "Rapports",
    url: "/admin/reports",
    icon: FileText,
  },
]

const settingsItems = [
  {
    title: "Paramètres",
    url: routes.admin.settings,
    icon: Settings,
  },
  {
    title: "Sécurité",
    url: "/admin/security",
    icon: Shield,
  },
]

export function AdminSidebar() {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-6 py-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Shield className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Admin Panel</h2>
            <p className="text-xs text-muted-foreground">Gestion de la plateforme</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <button onClick={() => router.push(item.url)} className="w-full">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Configuration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <button onClick={() => router.push(item.url)} className="w-full">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="text-xs text-muted-foreground text-center">Admin Panel v1.0</div>
      </SidebarFooter>
    </Sidebar>
  )
}
