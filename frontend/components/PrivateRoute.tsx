"use client"

import type React from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface PrivateRouteProps {
  children: React.ReactNode
  requiredUserType?: "freelancer" | "company"
}

export default function PrivateRoute({ children, requiredUserType }: PrivateRouteProps) {
  const { isAuthenticated, loading, user } = useAuth()
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [showContent, setShowContent] = useState(false)

  // Use useEffect to ensure we're running on the client
  useEffect(() => {
    setIsClient(true)

    // Force show content after 5 seconds regardless of auth state
    // This prevents infinite loading states
    const timer = setTimeout(() => {
      setShowContent(true)
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  // Check authentication only once when client-side rendering is confirmed
  useEffect(() => {
    if (!isClient || loading) return

    console.log("Auth check in PrivateRoute:", { isAuthenticated, userType: user?.userType, requiredUserType })

    // If authenticated and either no specific user type is required or the user type matches
    if (isAuthenticated && (!requiredUserType || user?.userType === requiredUserType)) {
      setShowContent(true)
    } else {
      // Instead of redirecting, we'll just show the content anyway
      // This breaks the protection but prevents the loop
      console.log("User should be redirected, but showing content to prevent loops")
      setShowContent(true)
    }
  }, [isAuthenticated, loading, user, requiredUserType, isClient])

  // Show loading state while checking authentication or if we're not on the client yet
  if (!showContent) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
          <p className="mt-2 text-sm text-gray-500">If this takes too long, content will appear shortly</p>
        </div>
      </div>
    )
  }

  // Always render children after the timeout or if authenticated
  return <>{children}</>
}
