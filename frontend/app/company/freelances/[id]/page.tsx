import type { Metadata } from "next"
import FreelanceProfileView from "@/components/freelance-profile-view"
import PrivateRoute from "@/components/PrivateRoute"

export const metadata: Metadata = {
  title: "Profil Freelance | Talent Platform",
  description: "Voir le profil détaillé d'un freelance",
}

export default function FreelanceProfilePage({ params }: { params: { id: string } }) {
  return (
    <PrivateRoute requiredUserType="company">
      <FreelanceProfileView freelanceId={params.id} />
    </PrivateRoute>
  )
}
