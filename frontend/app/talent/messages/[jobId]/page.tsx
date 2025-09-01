import type { Metadata } from "next"
import TalentMessageRoom from "@/components/talent-message-room"
import PrivateRoute from "@/components/PrivateRoute"

export const metadata: Metadata = {
  title: "Conversation | Talent Platform",
  description: "Conversation avec une entreprise",
}

export default async function TalentMessagePage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params
  
  return (
    <PrivateRoute>
      <TalentMessageRoom jobId={jobId} />
    </PrivateRoute>
  )
}
