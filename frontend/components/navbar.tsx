"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"
import { routes } from "@/constants/routes"
import { useState } from "react"
import { Menu, X, Users, Briefcase, Info, User, LogOut, LayoutDashboard, Zap } from "lucide-react"

export default function Navbar() {
  const pathname = usePathname()
  const { isAuthenticated, user, logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200/20 dark:border-gray-700/20 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold group">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
                TrailBlazer
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="ml-10 hidden lg:flex items-center space-x-8">
              <Link
                href={routes.talent.jobs}
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                  pathname === routes.talent.jobs
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                }`}
              >
                <Briefcase className="h-4 w-4" />
                Trouver des missions
              </Link>
              <Link
                href="/talents"
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                  pathname === "/talents"
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                }`}
              >
                <Users className="h-4 w-4" />
                Trouver des talents
              </Link>
              <Link
                href={routes.about}
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                  pathname === routes.about
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                }`}
              >
                <Info className="h-4 w-4" />À propos
              </Link>
            </nav>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                  <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <User className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {user?.name || user?.email?.split("@")[0]}
                  </span>
                </div>
                <Link href={user?.userType === "company" ? routes.company.dashboard : routes.talent.dashboard}>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={logout} className="gap-2 bg-transparent">
                  <LogOut className="h-4 w-4" />
                  Déconnexion
                </Button>
              </>
            ) : (
              <>
                <Link href={routes.login}>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <User className="h-4 w-4" />
                    Connexion
                  </Button>
                </Link>
                <Link href={routes.signup}>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 gap-2"
                  >
                    <Zap className="h-4 w-4" />
                    S'inscrire
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={toggleMobileMenu} className="p-2">
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md">
            <div className="px-4 py-6 space-y-4">
              {/* Mobile Navigation Links */}
              <div className="space-y-3">
                <Link
                  href={routes.talent.jobs}
                  onClick={closeMobileMenu}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === routes.talent.jobs
                      ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                      : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                  }`}
                >
                  <Briefcase className="h-4 w-4" />
                  Trouver des missions
                </Link>
                <Link
                  href="/talents"
                  onClick={closeMobileMenu}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === "/talents"
                      ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                      : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                  }`}
                >
                  <Users className="h-4 w-4" />
                  Trouver des talents
                </Link>
                <Link
                  href={routes.about}
                  onClick={closeMobileMenu}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === routes.about
                      ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                      : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                  }`}
                >
                  <Info className="h-4 w-4" />À propos
                </Link>
              </div>

              {/* Mobile Actions */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {user?.name || "Utilisateur"}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {user?.userType === "company" ? "Entreprise" : "Freelance"}
                        </div>
                      </div>
                    </div>
                    <Link
                      href={user?.userType === "company" ? routes.company.dashboard : routes.talent.dashboard}
                      onClick={closeMobileMenu}
                    >
                      <Button variant="ghost" className="w-full justify-start gap-3">
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      onClick={() => {
                        logout()
                        closeMobileMenu()
                      }}
                      className="w-full justify-start gap-3"
                    >
                      <LogOut className="h-4 w-4" />
                      Déconnexion
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href={routes.login} onClick={closeMobileMenu}>
                      <Button variant="ghost" className="w-full justify-start gap-3">
                        <User className="h-4 w-4" />
                        Connexion
                      </Button>
                    </Link>
                    <Link href={routes.signup} onClick={closeMobileMenu}>
                      <Button className="w-full justify-start bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 gap-3">
                        <Zap className="h-4 w-4" />
                        S'inscrire
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
