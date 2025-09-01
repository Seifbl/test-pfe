"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Briefcase,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  MessageSquare,
  Bell,
  Building,
  Users,
  PlusCircle,
} from "lucide-react"
import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { routes } from "@/constants/routes"

export default function Sidebar() {
  const pathname = usePathname()
  const { logout, user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // Use useEffect to ensure we're running on the client
  useEffect(() => {
    setIsClient(true)
  }, [])

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  // If we're still on the server, return null to avoid hydration errors
  if (!isClient) {
    return null
  }

  // Determine user type with fallback
  const isTalent = user?.userType !== "company"

  // Define menu items based on user type
  const talentMenuItems = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      href: routes.talent.dashboard,
    },
    {
      title: "Browse Jobs",
      icon: <Briefcase className="h-5 w-5" />,
      href: routes.talent.jobs,
    },
    {
      title: "Messages",
      icon: <MessageSquare className="h-5 w-5" />,
      href: routes.talent.messages,
    },
    {
      title: "Notifications",
      icon: <Bell className="h-5 w-5" />,
      href: routes.talent.notifications,
    },
    {
      title: "Profile",
      icon: <User className="h-5 w-5" />,
      href: routes.talent.profile,
    },
    {
      title: "Settings",
      icon: <Settings className="h-5 w-5" />,
      href: routes.talent.settings,
    },
  ]

  const companyMenuItems = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      href: routes.company.dashboard,
    },
    {
      title: "Post a Job",
      icon: <PlusCircle className="h-5 w-5" />,
      href: routes.company.createJob,
    },
    {
      title: "Manage Jobs",
      icon: <Briefcase className="h-5 w-5" />,
      href: routes.company.jobs,
    },
    {
      title: "Candidates",
      icon: <Users className="h-5 w-5" />,
      href: routes.company.candidates,
    },
    {
      title: "Messages",
      icon: <MessageSquare className="h-5 w-5" />,
      href: routes.company.messages,
    },
    {
      title: "Company Profile",
      icon: <Building className="h-5 w-5" />,
      href: routes.company.profile,
    },
    {
      title: "Settings",
      icon: <Settings className="h-5 w-5" />,
      href: routes.company.settings,
    },
  ]

  const menuItems = isTalent ? talentMenuItems : companyMenuItems

  return (
    <>
      {/* Mobile menu button */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <Button variant="outline" size="icon" onClick={toggleSidebar}>
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsOpen(false)} aria-hidden="true" />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-gray-900 border-r transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <Link href={isTalent ? routes.talent.dashboard : routes.company.dashboard} className="text-xl font-bold">
              TalentPlatform
            </Link>
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden">
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-500 uppercase mb-2">
                {isTalent ? "Talent Portal" : "Company Portal"}
              </p>
            </div>
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.title}>
                  <Link href={item.href}>
                    <Button
                      variant="ghost"
                      className={`w-full justify-start ${pathname === item.href ? "bg-gray-100 dark:bg-gray-800" : ""}`}
                    >
                      {item.icon}
                      <span className="ml-3">{item.title}</span>
                    </Button>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t">
            <Button variant="ghost" className="w-full justify-start text-red-500" onClick={logout}>
              <LogOut className="h-5 w-5" />
              <span className="ml-3">Logout</span>
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}
