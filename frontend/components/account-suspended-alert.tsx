"use client"

import { AlertTriangle, Mail } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AccountSuspendedAlert() {
  return (
    <Alert className="bg-red-50 border-red-200 text-red-800 mb-6">
      <AlertTriangle className="h-5 w-5" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex-1">
          <strong>🚫 Votre compte est actuellement suspendu.</strong>
          <p className="mt-1 text-sm">
            Vous ne pouvez pas effectuer d'actions pour le moment. Contactez l'administrateur pour plus d'informations.
          </p>
        </div>
        <Button variant="outline" size="sm" asChild className="ml-4">
          <Link href="/contact-support">
            <Mail className="h-4 w-4 mr-2" />
            Contacter le support
          </Link>
        </Button>
      </AlertDescription>
    </Alert>
  )
}
