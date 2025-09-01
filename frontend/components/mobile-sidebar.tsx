"use client"

import { useAuth } from "@/context/AuthContext"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Briefcase,
  LayoutDashboard,
  LogOut,
  User,
  Building,
  PlusCircle,
  MessageSquare,
  Bell,
  Users,
  Settings,
} from "lucide-react"
import Link from "next/link"
import type { Dispatch, SetStateAction } from "react"
import { routes } from "@/constants/routes"

interface MobileSidebarProps {
  userType: string
  setOpen: Dispatch<SetStateAction<boolean>>
}

export default function MobileSidebar({ userType, setOpen }: MobileSidebarProps) {
  const { user, logout } = useAuth()
  const isTalent = userType === "freelancer"

  const talentNavItems = [
    {
      title: "Dashboard",
      href: routes.talent.dashboard,
      icon: LayoutDashboard,
    },
    {
      title: "Browse Jobs",
      href: routes.talent.jobs,
      icon: Briefcase,
    },
    {
      title: "Messages",
      href: routes.talent.messages,
      icon: MessageSquare,
    },
    {
      title: "Notifications",
      href: routes.talent.notifications,
      icon: Bell,
    },
    {
      title: "Profile",
      href: routes.talent.profile,
      icon: User,
    },
    {
      title: "Settings",
      href: routes.talent.settings,
      icon: Settings,
    },
  ]

  const companyNavItems = [
    {
      title: "Dashboard",
      href: routes.company.dashboard,
      icon: LayoutDashboard,
    },
    {
      title: "Post a Job",
      href: routes.company.createJob,
      icon: PlusCircle,
    },
    {
      title: "Manage Jobs",
      href: routes.company.jobs,
      icon: Briefcase,
    },
    {
      title: "Candidates",
      href: routes.company.candidates,
      icon: Users,
    },
    {
      title: "Messages",
      href: routes.company.messages,
      icon: MessageSquare,
    },
    {
      title: "Company Profile",
      href: routes.company.profile,
      icon: Building,
    },
    {
      title: "Settings",
      href: routes.company.settings,
      icon: Settings,
    },
  ]

  const navItems = isTalent ? talentNavItems : companyNavItems

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex items-center gap-2 border-b p-4">
        <Avatar className="h-10 w-10">
          <AvatarImage src={user?.avatar || ""} alt={user?.firstName || "User"} />
          <AvatarFallback>{user?.firstName?.charAt(0) || "U"}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-sm font-medium">{`${user?.firstName || ""} ${user?.lastName || ""}`}</span>
          <span className="text-xs text-muted-foreground">{user?.email || "user@example.com"}</span>
        </div>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <div className="px-4 py-2">
          <p className="text-xs font-medium text-gray-500 uppercase mb-2">
            {isTalent ? "Talent Portal" : "Company Portal"}
          </p>
        </div>
        <nav className="grid gap-1 px-2">
          {navItems.map((item, index) => (
            <Button key={index} variant="ghost" className="justify-start" asChild onClick={() => setOpen(false)}>
              <Link href={item.href}>
                <item.icon className="mr-2 h-4 w-4" />
                {item.title}
              </Link>
            </Button>
          ))}
        </nav>
      </div>
      <div className="border-t p-2">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-500 hover:bg-red-50 hover:text-red-600"
          onClick={() => {
            logout()
            setOpen(false)
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )
}
