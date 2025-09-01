import type { Metadata } from "next"
import CompanyMessagesList from "@/components/company-messages-list"
import PrivateRoute from "@/components/PrivateRoute"

export const metadata: Metadata = {
  title: "Mes messages | Talent Platform",
  description: "Gérez vos conversations avec les freelances",
}

export default function CompanyMessagesPage() {
  return (
    <PrivateRoute>
      <CompanyMessagesList />
    </PrivateRoute>
  )
}
