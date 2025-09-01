import type { Metadata } from "next"
import InvitationsList from "@/components/invitations-list"
import PrivateRoute from "@/components/PrivateRoute"

export const metadata: Metadata = {
  title: "Invitations | Talent Platform",
  description: "Gérer les invitations pour cette offre d'emploi",
}

export default function InvitationsPage({ params }: { params: { jobId: string } }) {
  return (
    <PrivateRoute requiredUserType="company">
      <InvitationsList jobId={params.jobId} />
    </PrivateRoute>
  )
}
