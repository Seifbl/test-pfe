import type { Metadata } from "next"
import Dashboard from "@/components/dashboard"
import PrivateRoute from "@/components/PrivateRoute"

export const metadata: Metadata = {
  title: "Talent Dashboard | Talent Platform",
  description: "View your dashboard and manage your profile",
}

export default function TalentDashboardPage() {
  return (
    <PrivateRoute requiredUserType="freelancer">
      <Dashboard />
    </PrivateRoute>
  )
}
