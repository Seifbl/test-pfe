import CompanyLayout from "@/components/layout/company-layout"
import type { ReactNode } from "react"

export default function CompanyRootLayout({ children }: { children: ReactNode }) {
  return <CompanyLayout>{children}</CompanyLayout>
}
