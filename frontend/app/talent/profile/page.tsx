import type { Metadata } from "next"
import FreelanceProfilePage from "@/components/freelance-profile"
import PrivateRoute from "@/components/PrivateRoute"

export const metadata: Metadata = {
  title: "Talent Profile | Talent Platform",
  description: "Manage your talent profile",
}

export default function TalentProfilePage() {
  return (
    <PrivateRoute requiredUserType="freelancer">
      <FreelanceProfilePage />
    </PrivateRoute>
  )
}
