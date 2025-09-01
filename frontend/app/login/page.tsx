import Login from "@/components/login"
import type { Metadata } from "next"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Login | Talent Platform",
  description: "Log in to your Talent Platform account",
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // Check if the user has a token cookie
  const cookieStore = await cookies()
  const hasToken = cookieStore.has("token")

  // If they have a token and there's no redirect parameter, redirect to dashboard
  // We can't determine user type here, so we'll redirect to a neutral page
  // that will then redirect to the appropriate dashboard
  if (hasToken && !searchParams.redirect) {
    // Redirect to a neutral page that will handle the dashboard redirect
    redirect("/auth-redirect")
  }

  return <Login />
}
