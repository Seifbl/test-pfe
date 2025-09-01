"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { authService, companyService, freelanceService } from "@/services/api"
import { useRouter } from "next/navigation"
import { routes } from "@/constants/routes"

interface User {
  id?: string
  email: string
  firstName: string
  lastName: string
  userType: "freelancer" | "company"
  location?: string
  website?: string
  linkedin?: string
  github?: string
  role?: string
  yearsOfExperience?: number
  skills?: string[]
  topSkills?: string[]
  organizationSize?: string
  phoneNumber?: string
  workHistory?: Array<{
    title: string
    company: string
    startDate: { month: string; year: string }
    endDate: { month: string; year: string }
    description: string
    current: boolean
  }>
  completedSteps: {
    bio: boolean
    roles: boolean
    skills: boolean
    workHistory: boolean
  }
  bio?: string
  experience_level?: string
  title?: string
}

interface AuthContextType {
  isAuthenticated: boolean
  isEmailVerified: boolean
  user: User | null
  login: (email: string, password: string, userType?: "company" | "talent") => Promise<void>
  signup: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    userType: "freelancer" | "company",
    additionalData?: Record<string, any>,
  ) => Promise<void>
  logout: () => void
  verifyEmail: () => void
  updateUser: (updates: Partial<User>) => void
  markStepCompleted: (step: keyof User["completedSteps"]) => void
  isProfileComplete: () => boolean
  loading: boolean
  error: string | null
}

const AuthContext = createContext<AuthContextType | null>(null)

const defaultCompletedSteps = {
  bio: false,
  roles: false,
  skills: false,
  workHistory: false,
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isEmailVerified, setIsEmailVerified] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true) // Start with loading true
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Check if a token exists on load
  useEffect(() => {
    const initAuth = async () => {
      if (typeof window === "undefined") {
        setLoading(false)
        return
      }

      console.log("🔍 Vérification de l'authentification...")
      const token = localStorage.getItem("token")
      
      if (!token) {
        console.log("⚠️ Aucun token trouvé")
        setIsAuthenticated(false)
        setUser(null)
        setLoading(false)
        return
      }

      console.log("🔑 Token trouvé:", token.substring(0, 20) + "...")

      try {
        // Essayer d'abord de récupérer le profil freelance
        console.log("💼 Tentative de récupération du profil freelance...")
        const freelanceResponse = await freelanceService.getFreelanceProfile()
        const freelanceData = freelanceResponse.data
        
        console.log("✅ Profil freelance récupéré:", freelanceData)
        
        const userData = {
          id: freelanceData.id?.toString() || freelanceData.user_id?.toString(),
          email: freelanceData.email,
          firstName: freelanceData.first_name || freelanceData.firstName || "",
          lastName: freelanceData.last_name || freelanceData.lastName || "",
          userType: "freelancer" as const,
          skills: freelanceData.skills || [],
          bio: freelanceData.bio || "",
          experience_level: freelanceData.experience_level || "",
          title: freelanceData.title || "",
          completedSteps: { ...defaultCompletedSteps },
        }
        
        setUser(userData)
        setIsAuthenticated(true)
        setIsEmailVerified(true)
        
        // Stocker les données pour accès rapide
        localStorage.setItem("freelance", JSON.stringify(freelanceData))
        localStorage.setItem("userId", userData.id || "")
        
        console.log("✅ Utilisateur freelance authentifié avec succès:", userData)
        
      } catch (freelanceError) {
        console.log("⚠️ Échec profil freelance, tentative profil entreprise...", freelanceError)
        
        try {
          // Si échec freelance, essayer le profil entreprise
          const companyResponse = await companyService.getCompanyProfile()
          const companyData = companyResponse.data
          
          console.log("✅ Profil entreprise récupéré:", companyData)
          
          const userData = {
            id: companyData.id?.toString(),
            email: companyData.email,
            firstName: companyData.first_name || "",
            lastName: companyData.surname || companyData.last_name || "",
            userType: "company" as const,
            organizationSize: companyData.organization_size,
            phoneNumber: companyData.phone_number,
            completedSteps: { ...defaultCompletedSteps },
          }
          
          setUser(userData)
          setIsAuthenticated(true)
          setIsEmailVerified(true)
          
          localStorage.setItem("userId", userData.id || "")
          
          console.log("✅ Utilisateur entreprise authentifié avec succès:", userData)
          
        } catch (companyError) {
          console.error("❌ Échec de récupération des deux profils:", { freelanceError, companyError })
          // Si les deux échouent, supprimer le token
          localStorage.removeItem("token")
          localStorage.removeItem("freelance")
          localStorage.removeItem("userId")
          setIsAuthenticated(false)
          setUser(null)
        }
      }
      
      setLoading(false)
    }

    initAuth()
  }, [])

  // Modify the login function to redirect to the correct dashboard based on user type
  const login = async (email: string, password: string, userType?: "company" | "talent") => {
    setLoading(true)
    setError(null)
    try {
      console.log("Login attempt with:", { email, password, userType })

      const response = await authService.login({ email, password }, userType)
      console.log("Server response:", response.data)

      // Extract data correctly according to the API response structure
      const { token } = response.data

      // Store token in localStorage
      localStorage.setItem("token", token)

      if (userType === "company" || response.data.entreprise) {
        const entreprise = response.data.entreprise
        // Update user state for a company
        setUser({
          id: entreprise.id.toString(),
          email: entreprise.email,
          firstName: entreprise.first_name || entreprise.firstName,
          lastName: entreprise.surname || entreprise.lastName,
          userType: "company",
          organizationSize: entreprise.organization_size,
          phoneNumber: entreprise.phone_number,
          completedSteps: { ...defaultCompletedSteps },
        })
      } else {
        // For freelancers, use the appropriate response structure
        const freelance = response.data.freelance || response.data
        // Update user state for a talent
        setUser({
          id: freelance.id.toString(),
          email: freelance.email,
          firstName: freelance.first_name || freelance.firstName,
          lastName: freelance.lastName,
          userType: "freelancer",
          skills: freelance.skills || [],
          bio: freelance.bio || "",
          experience_level: freelance.experience_level || "",
          title: freelance.title || "",
          completedSteps: { ...defaultCompletedSteps },
        })

        // Store freelance information in localStorage for easy access
        localStorage.setItem("freelance", JSON.stringify(freelance))
      }

      setIsAuthenticated(true)
      console.log("User authenticated:", {
        userType: userType || (response.data.entreprise ? "company" : "freelancer"),
      })
      setIsEmailVerified(true) // Assume email is verified if login is successful
    } catch (err: any) {
      console.error("Login error:", err.response?.data || err.message)
      setError(err.response?.data?.message || err.message || "An error occurred during login")
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Ajoutons une fonction pour vérifier que l'ID utilisateur est correctement récupéré
  // Cherchez la fonction qui définit l'utilisateur après la connexion et assurez-vous que l'ID est correctement extrait

  // Par exemple, si vous avez une fonction comme celle-ci:
  /*const login = async (credentials, userType) => {
    try {
      const response = await authService.login(credentials, userType)
      const userData = response.data
      
      // Assurez-vous que l'ID est correctement extrait et stocké
      console.log("Données utilisateur reçues:", userData)
      
      // Vérifiez que l'ID est présent et au bon format
      if (!userData.id && userData.user_id) {
        userData.id = userData.user_id // Correction si l'API renvoie user_id au lieu de id
      }
      
      setUser({
        ...userData,
        userType: userType || (userData.role === "company" ? "company" : "freelancer")
      })
      
      // Stockez l'ID dans le localStorage pour le débogage
      localStorage.setItem("userId", userData.id || userData.user_id || "")
      
      setIsAuthenticated(true)
      return response
    } catch (error) {
      console.error("Erreur de connexion:", error)
      throw error
    }
  }*/

  // Modify the signup function to use the correct endpoint for freelancers
  const signup = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    userType: "freelancer" | "company",
    additionalData?: Record<string, any>,
  ) => {
    setLoading(true)
    setError(null)
    try {
      if (userType === "company") {
        await authService.registerCompany({
          first_name: firstName,
          surname: lastName,
          organization_size: additionalData?.organizationSize || "",
          phone_number: additionalData?.phoneNumber || "",
          email,
          password,
          accept_terms: additionalData?.terms || false,
          accept_marketing: additionalData?.marketing || false,
        })

        // Redirect to login page after company signup
        router.push(routes.login)
      } else {
        // Implementation for talent registration with the correct data format
        await authService.registerFreelancer({
          first_name: firstName,
          last_name: lastName,
          email,
          password,
          title: additionalData?.title || "",
          experience_level: additionalData?.experience_level || "",
          skills: additionalData?.skills || [],
          bio: additionalData?.bio || "",
          accept_terms: additionalData?.terms || false,
          accept_marketing: additionalData?.marketing || false,
        })

        // Automatically log in the user after registration
        await login(email, password, "talent")

        // Redirect to onboarding
        router.push(routes.talent.onboarding)
      }

      // Don't automatically log in after company registration
      // The user will need to log in manually
      if (userType === "company") {
        setUser(null)
        setIsAuthenticated(false)
        setIsEmailVerified(false)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred during registration")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    // Remove token from localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem("token")
      localStorage.removeItem("freelance")
    }
    // Reset authentication state
    setIsAuthenticated(false)
    setUser(null)
    setIsEmailVerified(false)

    // Redirect to home page
    router.push(routes.home)
  }

  const verifyEmail = () => {
    setIsEmailVerified(true)
  }

  const updateUser = (updates: Partial<User>) => {
    setUser((prevUser) => {
      if (!prevUser) return null
      return { ...prevUser, ...updates }
    })
  }

  const markStepCompleted = (step: keyof User["completedSteps"]) => {
    setUser((prev) => {
      if (!prev) return null
      return {
        ...prev,
        completedSteps: {
          ...prev.completedSteps,
          [step]: true,
        },
      }
    })
  }

  const isProfileComplete = () => {
    if (!user?.completedSteps) return false
    return Object.values(user.completedSteps).every((step) => step === true)
  }

  console.log("Auth state:", { isAuthenticated, user, loading })

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isEmailVerified,
        user,
        login,
        signup,
        logout,
        verifyEmail,
        updateUser,
        markStepCompleted,
        isProfileComplete,
        loading,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
