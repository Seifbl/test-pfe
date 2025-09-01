import type { Metadata } from "next"
import CompanyProfilePage from "@/components/company-profile"
import PrivateRoute from "@/components/PrivateRoute"

export const metadata: Metadata = {
  title: "Company Profile | Talent Platform",
  description: "Manage your company profile",
}

export default function CompanyProfile() {
  return (
    <PrivateRoute requiredUserType="company">
      <CompanyProfilePage />
    </PrivateRoute>
  )
}
