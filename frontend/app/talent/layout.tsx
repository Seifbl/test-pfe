import TalentLayout from "@/components/layout/talent-layout"
import type { ReactNode } from "react"

export default function TalentRootLayout({ children }: { children: ReactNode }) {
  return <TalentLayout>{children}</TalentLayout>
}
