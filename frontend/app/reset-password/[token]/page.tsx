import type { Metadata } from "next"
import ResetPasswordForm from "@/components/reset-password-form"

export const metadata: Metadata = {
  title: "Reset Password | Talent Platform",
  description: "Create a new password for your account",
}

export default function ResetPasswordPage({ params }: { params: { token: string } }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Reset your password</h1>
          <p className="mt-2 text-gray-600">Please enter your new password below.</p>
        </div>
        <ResetPasswordForm token={params.token} />
      </div>
    </div>
  )
}
