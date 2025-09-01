import type { Metadata } from "next"
import { FreelanceInvitations } from "@/components/freelance-invitations"
import PrivateRoute from "@/components/PrivateRoute"

export const metadata: Metadata = {
  title: "Invitations | Talent Platform",
  description: "Gérez vos invitations à postuler à des offres",
}

export default function InvitationsPage() {
  return (
    <PrivateRoute requiredUserType="freelancer">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Invitations</h1>
          <p className="text-muted-foreground">Gérez vos invitations à postuler à des offres</p>
        </div>

        <FreelanceInvitations />
      </div>
    </PrivateRoute>
  )
}
