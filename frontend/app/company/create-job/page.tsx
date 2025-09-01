import type { Metadata } from "next"
import CreateJobPage from "@/components/create-job"
import PrivateRoute from "@/components/PrivateRoute"

export const metadata: Metadata = {
  title: "Create Job | Talent Platform",
  description: "Create a new job posting",
}

export default function CreateJob() {
  return (
    <PrivateRoute>
      <CreateJobPage />
    </PrivateRoute>
  )
}
