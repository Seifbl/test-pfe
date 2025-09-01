"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Settings, Save } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
        <p className="text-muted-foreground">Configurez les paramètres de votre dashboard administrateur</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="mr-2 h-5 w-5" />
              Paramètres Généraux
            </CardTitle>
            <CardDescription>Configurez les paramètres généraux de l'application</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="app-name">Nom de l'application</Label>
                <Input id="app-name" defaultValue="Admin Dashboard" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-email">Email administrateur</Label>
                <Input id="admin-email" type="email" defaultValue="admin@example.com" />
              </div>
            </div>
            <Separator />
            <div className="flex justify-end">
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Sauvegarder
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sécurité</CardTitle>
            <CardDescription>Gérez les paramètres de sécurité de votre compte</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Mot de passe actuel</Label>
              <Input id="current-password" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">Nouveau mot de passe</Label>
              <Input id="new-password" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
              <Input id="confirm-password" type="password" />
            </div>
            <Separator />
            <div className="flex justify-end">
              <Button>Changer le mot de passe</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
