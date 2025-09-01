"use client"

import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { routes } from "@/constants/routes"
import { useEffect, useState } from "react"

export default function DebugPage() {
  const { user, isAuthenticated, loading, logout } = useAuth()
  const router = useRouter()
  const [localStorageData, setLocalStorageData] = useState<Record<string, string>>({})

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Get all localStorage items
      const data: Record<string, string> = {}
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key) {
          const value = localStorage.getItem(key)
          data[key] = value ? (value.length > 100 ? value.substring(0, 100) + "..." : value) : ""
        }
      }
      setLocalStorageData(data)
    }
  }, [])

  const handleClearToken = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token")
      localStorage.removeItem("freelance")
      window.location.reload()
    }
  }

  const handleGoToDashboard = () => {
    if (user?.userType === "company") {
      router.push(routes.company.dashboard)
    } else {
      router.push(routes.talent.dashboard)
    }
  }

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Authentication Debug</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Authentication State:</h3>
              <pre className="mt-2 p-4 bg-gray-100 rounded overflow-auto">
                {JSON.stringify(
                  {
                    isAuthenticated,
                    loading,
                    userType: user?.userType,
                    firstName: user?.firstName,
                    lastName: user?.lastName,
                    email: user?.email,
                  },
                  null,
                  2,
                )}
              </pre>
            </div>

            <div>
              <h3 className="font-medium">Local Storage:</h3>
              <pre className="mt-2 p-4 bg-gray-100 rounded overflow-auto">
                {JSON.stringify(localStorageData, null, 2)}
              </pre>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button onClick={handleGoToDashboard}>Go to Dashboard</Button>
              <Button variant="outline" onClick={handleClearToken}>
                Clear Token
              </Button>
              <Button variant="destructive" onClick={handleLogout}>
                Logout
              </Button>
              <Button variant="secondary" onClick={() => router.push(routes.login)}>
                Go to Login
              </Button>
              <Button variant="secondary" onClick={() => router.push(routes.talent.dashboard)}>
                Talent Dashboard
              </Button>
              <Button variant="secondary" onClick={() => router.push(routes.company.dashboard)}>
                Company Dashboard
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Troubleshooting Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Click "Clear Token" to remove authentication data</li>
            <li>Try logging in again from the login page</li>
            <li>If you still see a blank screen, try directly accessing the debug page at /debug</li>
            <li>Check the browser console for any errors</li>
            <li>Try using an incognito/private window to rule out browser extension issues</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
