import type { Metadata } from "next"
import MessageRoom from "@/components/message-room"
import PrivateRoute from "@/components/PrivateRoute"

export const metadata: Metadata = {
  title: "Messages | Talent Platform",
  description: "Communiquez avec les talents ou les entreprises",
}

export default async function MessagePage({ params }: { params: Promise<{ jobId: string; userId: string }> }) {
  const { jobId, userId } = await params
  
  return (
    <PrivateRoute>
      <MessageRoom jobId={jobId} otherUserId={userId} />
    </PrivateRoute>
  )
}
