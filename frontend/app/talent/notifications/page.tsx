import type { Metadata } from "next"
import PrivateRoute from "@/components/PrivateRoute"

export const metadata: Metadata = {
  title: "Notifications | Talent Platform",
  description: "View your notifications",
}

export default function NotificationsPage() {
  return (
    <PrivateRoute requiredUserType="freelancer">
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">Notifications</h1>
        <p className="text-gray-500">Notifications page content will go here.</p>
      </div>
    </PrivateRoute>
  )
}
