import type { Metadata } from "next"
import CompanyDashboard from "@/components/company-dashboard"
import PrivateRoute from "@/components/PrivateRoute"

export const metadata: Metadata = {
  title: "Company Dashboard | Talent Platform",
  description: "Manage your company profile and job postings",
}

export default function CompanyDashboardPage() {
  return (
    <PrivateRoute requiredUserType="company">
      <CompanyDashboard />
    </PrivateRoute>
  )
}
