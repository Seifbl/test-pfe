"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Briefcase, Users, Settings, LogOut, Menu, X, ChevronDown, ChevronRight } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/context/AuthContext"

export function CompanySidebar() {
  const pathname = usePathname()
  const { logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [jobsOpen, setJobsOpen] = useState(false)

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  const toggleJobs = () => {
    setJobsOpen(!jobsOpen)
  }

  const menuItems = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      href: "/company/dashboard",
    },
    {
      title: "Jobs",
      icon: <Briefcase className="h-5 w-5" />,
      href: "/company/jobs",
      submenu: [
        { title: "All Jobs", href: "/company/jobs" },
        { title: "Create Job", href: "/company/create-job" },
       
      ],
    },
   
    {
      title: "Settings",
      icon: <Settings className="h-5 w-5" />,
      href: "/company/profile",
    },
  ]

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
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <Link href="/company/dashboard" className="text-xl font-bold">
              TalentPlatform
            </Link>
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden">
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.title}>
                  {item.submenu ? (
                    <div className="space-y-2">
                      <Button
                        variant="ghost"
                        className={`w-full justify-start ${pathname.startsWith(item.href) ? "bg-gray-100" : ""}`}
                        onClick={toggleJobs}
                      >
                        {item.icon}
                        <span className="ml-3">{item.title}</span>
                        {jobsOpen ? (
                          <ChevronDown className="ml-auto h-4 w-4" />
                        ) : (
                          <ChevronRight className="ml-auto h-4 w-4" />
                        )}
                      </Button>
                      {jobsOpen && (
                        <ul className="pl-10 space-y-2">
                          {item.submenu.map((subitem) => (
                            <li key={subitem.title}>
                              <Link
                                href={subitem.href}
                                className={`block py-2 px-3 rounded-md text-sm ${
                                  pathname === subitem.href
                                    ? "bg-gray-100 font-medium"
                                    : "text-gray-600 hover:bg-gray-50"
                                }`}
                              >
                                {subitem.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : (
                    <Link href={item.href}>
                      <Button
                        variant="ghost"
                        className={`w-full justify-start ${pathname === item.href ? "bg-gray-100" : ""}`}
                      >
                        {item.icon}
                        <span className="ml-3">{item.title}</span>
                      </Button>
                    </Link>
                  )}
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
