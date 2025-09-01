"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Building2, Zap, ArrowRight, CheckCircle, Star, TrendingUp } from "lucide-react"

export default function SignUpOptions() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
            TrailBlazer
          </span>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-4">Rejoignez TrailBlazer</h1>
          <p className="text-xl text-gray-600">Choisissez votre profil pour commencer votre aventure professionnelle</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Freelancer Card */}
          <Card className="group relative overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition-all duration-300 hover:shadow-xl cursor-pointer">
            <Link href="/signup/talent" className="block h-full">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>

              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-gray-900 group-hover:text-blue-600 transition-colors">
                  Je suis Freelance
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Développez votre activité et trouvez des missions passionnantes
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span>Accès à des milliers de missions</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Star className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                    <span>Construisez votre réputation</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <TrendingUp className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    <span>Développez votre réseau professionnel</span>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 mt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">0€</div>
                    <div className="text-sm text-blue-600">Inscription gratuite</div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-6">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 group-hover:scale-105 transition-transform">
                  Créer mon profil freelance
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Link>
          </Card>

          {/* Company Card */}
          <Card className="group relative overflow-hidden border-2 border-gray-200 hover:border-purple-500 transition-all duration-300 hover:shadow-xl cursor-pointer">
            <Link href="/signup/company" className="block h-full">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>

              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Building2 className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-gray-900 group-hover:text-purple-600 transition-colors">
                  Je suis une Entreprise
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Trouvez les meilleurs talents pour vos projets
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span>50,000+ freelances vérifiés</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Star className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                    <span>Matching IA personnalisé</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <TrendingUp className="h-4 w-4 text-purple-500 flex-shrink-0" />
                    <span>Gestion de projets intégrée</span>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4 mt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">Essai gratuit</div>
                    <div className="text-sm text-purple-600">14 jours sans engagement</div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-6">
                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 group-hover:scale-105 transition-transform">
                  Créer mon compte entreprise
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Link>
          </Card>
        </div>

        {/* Trust Indicators */}
        <div className="text-center mb-8">
          <p className="text-sm text-gray-500 mb-4">Rejoignez plus de 50,000 professionnels</p>
          <div className="flex items-center justify-center gap-8 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Inscription sécurisée</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Support 24/7</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Données protégées</span>
            </div>
          </div>
        </div>

        {/* Login Link */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Vous avez déjà un compte ?{" "}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500 underline underline-offset-2">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
