import type { Metadata } from "next"
import OnboardingFlowPage from "@/components/onboarding-flow"
import PrivateRoute from "@/components/PrivateRoute"

export const metadata: Metadata = {
  title: "Onboarding | Talent Platform",
  description: "Complete your profile to get started",
}

export default function OnboardingFlow() {
  return (
    <PrivateRoute>
      <OnboardingFlowPage />
    </PrivateRoute>
  )
}
