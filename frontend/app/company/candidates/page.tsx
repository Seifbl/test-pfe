import type { Metadata } from "next"
import PrivateRoute from "@/components/PrivateRoute"

export const metadata: Metadata = {
  title: "Candidates | Talent Platform",
  description: "Browse and manage candidates for your jobs",
}

export default function CandidatesPage() {
  return (
    <PrivateRoute requiredUserType="company">
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">Candidates</h1>
        <p className="text-gray-500">Candidates page content will go here.</p>
      </div>
    </PrivateRoute>
  )
}
