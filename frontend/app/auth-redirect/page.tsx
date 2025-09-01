"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { routes } from "@/constants/routes"

export default function AuthRedirectPage() {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Only redirect if authentication state is determined
    if (!loading) {
      if (isAuthenticated && user) {
        console.log("AuthRedirect: User is authenticated, redirecting to dashboard")
        // Redirect to the appropriate dashboard based on user type
        const dashboardRoute = user.userType === "company" ? routes.company.dashboard : routes.talent.dashboard
        router.push(dashboardRoute)
      } else {
        console.log("AuthRedirect: User is not authenticated, redirecting to login")
        // If not authenticated, redirect to login
        router.push(routes.login)
      }
    }
  }, [isAuthenticated, user, loading, router])

  // Show loading state while determining where to redirect
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting to your dashboard...</p>
      </div>
    </div>
  )
}
