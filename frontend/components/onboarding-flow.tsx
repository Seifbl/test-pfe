"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import BioForm from "@/components/onboarding/bio-form"
import RolesForm from "@/components/onboarding/roles-form"
import SkillsForm from "@/components/onboarding/skills-form"
import WorkHistoryForm from "@/components/onboarding/work-history-form"

export default function OnboardingFlowPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)

  const handleComplete = () => {
    router.push("/dashboard")
  }

  const nextStep = () => {
    setStep(step + 1)
  }

  const prevStep = () => {
    setStep(step - 1)
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-2xl px-4 py-12">
        {step === 1 && <BioForm onComplete={nextStep} />}
        {step === 2 && <RolesForm onComplete={nextStep} onBack={prevStep} />}
        {step === 3 && <SkillsForm onComplete={nextStep} onBack={prevStep} />}
        {step === 4 && <WorkHistoryForm onComplete={handleComplete} onBack={prevStep} />}
      </div>
    </div>
  )
}
