import type { Metadata } from "next"
import CreateJob from "@/components/create-job"
import PrivateRoute from "@/components/PrivateRoute"

export const metadata: Metadata = {
  title: "Post a Job | Talent Platform",
  description: "Create a new job posting to find talent",
}

export default function CreateJobPage() {
  return (
    <PrivateRoute requiredUserType="company">
      <CreateJob />
    </PrivateRoute>
  )
}
