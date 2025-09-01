import type { Metadata } from "next"
import CompanySignUpPage from "@/components/company-signup"

export const metadata: Metadata = {
  title: "Company Signup | Talent Platform",
  description: "Create a company account",
}

export default function CompanySignUp() {
  return <CompanySignUpPage />
}
