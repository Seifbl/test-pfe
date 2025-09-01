import type { Metadata } from "next"
import ApplicationsList from "@/components/applications-list"
import PrivateRoute from "@/components/PrivateRoute"

export const metadata: Metadata = {
  title: "Candidatures | Talent Platform",
  description: "Voir les candidatures pour cette offre d'emploi",
}

export default function ApplicationsPage({ params }: { params: { jobId: string } }) {
  return (
    <PrivateRoute requiredUserType="company">
      <ApplicationsList jobId={params.jobId} />
    </PrivateRoute>
  )
}
