import type { Metadata } from "next"
import PrivateRoute from "@/components/PrivateRoute"

export const metadata: Metadata = {
  title: "Company Settings | Talent Platform",
  description: "Manage your company account settings",
}

export default function CompanySettingsPage() {
  return (
    <PrivateRoute requiredUserType="company">
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">Company Settings</h1>
        <p className="text-gray-500">Company settings page content will go here.</p>
      </div>
    </PrivateRoute>
  )
}
