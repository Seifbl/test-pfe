import type { Metadata } from "next"
import PrivateRoute from "@/components/PrivateRoute"

export const metadata: Metadata = {
  title: "Settings | Talent Platform",
  description: "Manage your account settings",
}

export default function SettingsPage() {
  return (
    <PrivateRoute requiredUserType="freelancer">
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">Account Settings</h1>
        <p className="text-gray-500">Settings page content will go here.</p>
      </div>
    </PrivateRoute>
  )
}
