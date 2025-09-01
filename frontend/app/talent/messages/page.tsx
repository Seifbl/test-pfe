import type { Metadata } from "next"
import TalentMessagesList from "@/components/talent-messages-list"
import PrivateRoute from "@/components/PrivateRoute"

export const metadata: Metadata = {
  title: "Mes messages | Talent Platform",
  description: "Gérez vos conversations avec les entreprises",
}

export default function TalentMessagesPage() {
  return (
    <PrivateRoute>
      <TalentMessagesList />
    </PrivateRoute>
  )
}
