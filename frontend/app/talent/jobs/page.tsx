import type { Metadata } from "next"
import JobsPage from "@/components/jobs-page"
import PrivateRoute from "@/components/PrivateRoute"

export const metadata: Metadata = {
  title: "Browse Jobs | Talent Platform",
  description: "Find and apply for jobs that match your skills",
}

export default function TalentJobsPage() {
  return (
    <PrivateRoute requiredUserType="freelancer">
      <JobsPage />
    </PrivateRoute>
  )
}
