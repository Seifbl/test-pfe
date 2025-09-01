"use client"
import type React from "react"
import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Eye, EyeOff, Mail, Lock, User, Users, Building2, Zap, ArrowRight, Shield, CheckCircle } from "lucide-react"

export default function AccountCreation() {
  const { signup, loading, error } = useAuth()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [terms, setTerms] = useState(false)
  const [marketing, setMarketing] = useState(false)
  const [validationError, setValidationError] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const userType = searchParams.get("type") || "freelancer"
  const { toast } = useToast()

  const isFreelancer = userType === "freelancer"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError("")

    if (password !== confirmPassword) {
      setValidationError("Les mots de passe ne correspondent pas")
      return
    }

    if (password.length < 8) {
      setValidationError("Le mot de passe doit contenir au moins 8 caractères")
      return
    }

    if (!terms) {
      setValidationError("Vous devez accepter les conditions d'utilisation")
      return
    }

    try {
      await signup(email, password, firstName, lastName, userType as "freelancer" | "company", {
        terms,
        marketing,
      })

      if (userType === "freelancer") {
        router.push("/signup/interests")
      } else {
        toast({
          title: "Compte créé avec succès",
          description: "Votre compte entreprise a été créé. Vérifiez votre email pour activer votre compte.",
        })
        router.push("/login")
      }
    } catch (err: any) {
      toast({
        title: "Inscription échouée",
        description: err.message || "Une erreur s'est produite lors de l'inscription",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
            TrailBlazer
          </span>
        </div>

        <Card className="border-0 shadow-xl bg-white">
          <CardHeader className="space-y-1 text-center pb-6">
            {/* User Type Indicator */}
            <div className="flex items-center justify-center mb-4">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  isFreelancer
                    ? "bg-gradient-to-r from-blue-500 to-purple-500"
                    : "bg-gradient-to-r from-purple-500 to-pink-500"
                }`}
              >
                {isFreelancer ? <Users className="h-8 w-8 text-white" /> : <Building2 className="h-8 w-8 text-white" />}
              </div>
            </div>

            <CardTitle className="text-3xl font-bold text-gray-900">
              {isFreelancer ? "Créer mon profil freelance" : "Créer mon compte entreprise"}
            </CardTitle>
            <CardDescription className="text-gray-600">
              {isFreelancer
                ? "Rejoignez notre communauté de freelances et trouvez des missions passionnantes"
                : "Trouvez les meilleurs talents pour développer vos projets"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
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
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
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
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  {isFreelancer ? "Adresse email" : "Email professionnel"}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={isFreelancer ? "jean.dupont@email.com" : "contact@entreprise.com"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Mot de passe
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="••••••••"
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

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  Confirmer le mot de passe
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Checkboxes */}
              <div className="space-y-4 pt-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="terms"
                    checked={terms}
                    onCheckedChange={(checked) => setTerms(checked as boolean)}
                    className="mt-1"
                  />
                  <Label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed">
                    J'accepte les{" "}
                    <Link href="/terms" className="text-blue-600 hover:text-blue-500 underline underline-offset-2">
                      conditions d'utilisation
                    </Link>{" "}
                    et la{" "}
                    <Link href="/privacy" className="text-blue-600 hover:text-blue-500 underline underline-offset-2">
                      politique de confidentialité
                    </Link>
                  </Label>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="marketing"
                    checked={marketing}
                    onCheckedChange={(checked) => setMarketing(checked as boolean)}
                    className="mt-1"
                  />
                  <Label htmlFor="marketing" className="text-sm text-gray-600 leading-relaxed">
                    Je souhaite recevoir des emails sur les nouvelles opportunités et conseils
                  </Label>
                </div>
              </div>

              {/* Error Message */}
              {(validationError || error) && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600">{validationError || error}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className={`w-full h-12 text-white font-medium ${
                  isFreelancer
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                }`}
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Création en cours...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Créer mon compte
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </Button>
            </form>

            {/* Security Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Shield className="h-4 w-4 text-green-500" />
                <span>Vos données sont sécurisées et chiffrées</span>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-6">
            <div className="text-center text-sm text-gray-600">
              Vous avez déjà un compte ?{" "}
              <Link
                href="/login"
                className="font-medium text-blue-600 hover:text-blue-500 underline underline-offset-2"
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
              <span>Inscription gratuite</span>
            </div>
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3 text-blue-500" />
              <span>Données sécurisées</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3 text-purple-500" />
              <span>50K+ membres</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
