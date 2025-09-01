import type { Metadata } from "next"
import OnboardingFlow from "@/components/onboarding-flow"
import PrivateRoute from "@/components/PrivateRoute"

export const metadata: Metadata = {
  title: "Complete Your Profile | Talent Platform",
  description: "Set up your talent profile to start finding jobs",
}

export default function OnboardingPage() {
  return (
    <PrivateRoute requiredUserType="freelancer">
      <OnboardingFlow />
    </PrivateRoute>
  )
}
