import LandingPage from "@/components/landing-page"
import { cookies } from "next/headers"

export default function Home() {
  // Check if the user has a token cookie
  const cookieStore = cookies()
  const hasToken = cookieStore.has("token")

  // If they do, we'll still render the landing page
  // The client-side auth check will handle redirects if needed
  return <LandingPage />
}
