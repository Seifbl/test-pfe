import type { Metadata } from "next"
import CompanyJobs from "@/components/company-jobs"
import PrivateRoute from "@/components/PrivateRoute"

export const metadata: Metadata = {
  title: "Manage Jobs | Talent Platform",
  description: "Manage your company's job postings",
}

export default function CompanyJobsPage() {
  return (
    <PrivateRoute requiredUserType="company">
      <CompanyJobs />
    </PrivateRoute>
  )
}
