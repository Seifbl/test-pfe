"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import {
  Building2,
  Zap,
  User,
  Mail,
  Lock,
  Phone,
  Users,
  ArrowRight,
  Eye,
  EyeOff,
  Shield,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"

export default function CompanySignUpPage() {
  const router = useRouter()
  const { signup, isAuthenticated, loading, error: authError } = useAuth()
  const { toast } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    organizationSize: "",
    phoneNumber: "",
    email: "",
    password: "",
    terms: false,
    marketing: false,
  })

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/company/dashboard")
    }
  }, [isAuthenticated, router])

  if (isAuthenticated) {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.terms) {
      setError("Vous devez accepter les conditions d'utilisation pour continuer.")
      return
    }

    if (formData.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères")
      return
    }

    try {
      await signup(formData.email, formData.password, formData.firstName, formData.lastName, "company", {
        organizationSize: formData.organizationSize,
        phoneNumber: formData.phoneNumber,
        terms: formData.terms,
        marketing: formData.marketing,
      })

      toast({
        title: "Compte créé avec succès !",
        description: "Votre compte entreprise a été créé. Vérifiez votre email pour l'activer.",
      })

      router.push("/login")
    } catch (err: any) {
      setError(err.response?.data?.message || "Une erreur est survenue lors de l'inscription")
    }
  }

  const organizationSizes = [
    "1-10 employés",
    "11-50 employés",
    "51-200 employés",
    "201-500 employés",
    "501-1000 employés",
    "1000+ employés",
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
            TrailBlazer
          </span>
        </div>

        <Card className="border-0 shadow-xl bg-white">
          <CardHeader className="space-y-1 text-center pb-6">
            {/* Company Icon */}
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Building2 className="h-8 w-8 text-white" />
              </div>
            </div>

            <CardTitle className="text-3xl font-bold text-gray-900">Créer mon compte entreprise</CardTitle>
            <CardDescription className="text-gray-600">
              Trouvez les meilleurs talents pour développer vos projets
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Error Message */}
            {(error || authError) && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-600">{error || authError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                    Prénom
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="firstName"
                      placeholder="Jean"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="pl-10 h-12 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                    Nom
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="lastName"
                      placeholder="Dupont"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="pl-10 h-12 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Organization Size */}
              <div className="space-y-2">
                <Label htmlFor="organizationSize" className="text-sm font-medium text-gray-700">
                  Taille de l'organisation
                </Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                  <Select onValueChange={(value) => setFormData({ ...formData, organizationSize: value })} required>
                    <SelectTrigger className="pl-10 h-12 border-gray-200 focus:border-purple-500 focus:ring-purple-500">
                      <SelectValue placeholder="Sélectionnez la taille de votre entreprise" />
                    </SelectTrigger>
                    <SelectContent>
                      {organizationSizes.map((size) => (
                        <SelectItem key={size} value={size}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">
                  Numéro de téléphone
                </Label>
                <div className="flex gap-2">
                  <div className="relative w-20">
                    <Input className="h-12 text-center border-gray-200 bg-gray-50" value="+33" disabled />
                  </div>
                  <div className="relative flex-1">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="phoneNumber"
                      type="tel"
                      placeholder="6 12 34 56 78"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      className="pl-10 h-12 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email professionnel
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="contact@entreprise.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10 h-12 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Mot de passe
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10 pr-10 h-12 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500">Minimum 8 caractères</p>
              </div>

              {/* Checkboxes */}
              <div className="space-y-4 pt-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="terms"
                    checked={formData.terms}
                    onCheckedChange={(checked) => setFormData({ ...formData, terms: checked as boolean })}
                    className="mt-1"
                    required
                  />
                  <Label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed">
                    J'accepte les{" "}
                    <Link href="/terms" className="text-purple-600 hover:text-purple-500 underline underline-offset-2">
                      conditions d'utilisation
                    </Link>{" "}
                    et la{" "}
                    <Link
                      href="/privacy"
                      className="text-purple-600 hover:text-purple-500 underline underline-offset-2"
                    >
                      politique de confidentialité
                    </Link>
                  </Label>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="marketing"
                    checked={formData.marketing}
                    onCheckedChange={(checked) => setFormData({ ...formData, marketing: checked as boolean })}
                    className="mt-1"
                  />
                  <Label htmlFor="marketing" className="text-sm text-gray-600 leading-relaxed">
                    Je souhaite recevoir des emails sur les nouveaux talents et conseils de recrutement
                  </Label>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Création en cours...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Créer mon compte entreprise
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </Button>
            </form>

            {/* Security Info */}
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center gap-3 text-sm text-purple-700">
                <Shield className="h-4 w-4 text-purple-500" />
                <span>Vos données sont sécurisées et chiffrées</span>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-6">
            <div className="text-center text-sm text-gray-600">
              Vous avez déjà un compte ?{" "}
              <Link
                href="/login"
                className="font-medium text-purple-600 hover:text-purple-500 underline underline-offset-2"
              >
                Se connecter
              </Link>
            </div>
          </CardFooter>
        </Card>

        {/* Trust Indicators */}
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span>Essai gratuit 14 jours</span>
            </div>
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3 text-purple-500" />
              <span>Données sécurisées</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3 text-pink-500" />
              <span>50K+ talents</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
