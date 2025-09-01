"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { MenuIcon } from "lucide-react"
import Sidebar from "@/components/sidebar"
import Header from "@/components/header"
import MobileSidebar from "@/components/mobile-sidebar"
import { useRouter } from "next/navigation"
import { routes } from "@/constants/routes"

interface TalentLayoutProps {
  children: React.ReactNode
}

export default function TalentLayout({ children }: TalentLayoutProps) {
  const { user, loading, isAuthenticated } = useAuth()
  const [open, setOpen] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [showContent, setShowContent] = useState(false)
  const router = useRouter()

  // Use useEffect to ensure we're running on the client
  useEffect(() => {
    setIsClient(true)

    // Force show content after 3 seconds regardless of loading state
    const timer = setTimeout(() => {
      setShowContent(true)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  // Check if user is authenticated and is a talent
  useEffect(() => {
    if (isClient && !loading && isAuthenticated) {
      if (user?.userType !== "freelancer") {
        // Redirect to company dashboard if user is a company
        router.push(routes.company.dashboard)
      }
      setShowContent(true)
    }
  }, [isClient, loading, isAuthenticated, user, router])

  // If we're still on the server, return minimal layout
  if (!isClient) {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="h-16 border-b"></div>
        <div className="flex flex-1">
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    )
  }

  // If we're still loading and haven't reached the timeout, show loading state
  if (!showContent) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          <p className="mt-4">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // Render the layout even if user is null - the header and sidebar will handle this case
  return (
    <div className="flex min-h-screen flex-col">
      <Header user={user} />
      <div className="flex flex-1">
        <aside className="hidden w-64 border-r md:block">
          <Sidebar />
        </aside>
        <div className="block md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="ml-2 mt-2">
                <MenuIcon className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
              <MobileSidebar userType="freelancer" setOpen={setOpen} />
            </SheetContent>
          </Sheet>
        </div>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
