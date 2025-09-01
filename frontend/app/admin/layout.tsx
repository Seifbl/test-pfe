"use client"

import { AdminLayout } from "@/components/layout/admin-layout"
import type React from "react"



export default function AdminLayoutPage({
  children,
}: {
  children: React.ReactNode
}) {
  return <AdminLayout>{children}</AdminLayout>
}
