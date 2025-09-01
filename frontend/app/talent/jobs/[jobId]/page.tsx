import type { Metadata } from "next"
import JobDetail from "@/components/job-detail"
import PrivateRoute from "@/components/PrivateRoute"

export const metadata: Metadata = {
  title: "Job Details | Talent Platform",
  description: "View job details and apply",
}

export default function JobDetailPage({ params }: { params: { jobId: string } }) {
  return (
    <PrivateRoute requiredUserType="freelancer">
      <JobDetail jobId={params.jobId} />
    </PrivateRoute>
  )
}
