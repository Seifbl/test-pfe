// Changer l'URL de base pour utiliser le proxy Next.js
const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:5000/api"

// Types
export interface LoginResponse {
  token: string
  user?: any
  message?: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface Freelancer {
  id: number
  first_name: string
  last_name: string
  email: string
  password: string
  role: string
  title: string
  experience_level: string
  skills: string | null
  bio: string
  created_at: string
  location: string
  linkedin: string
  github: string
  website: string
  is_active: boolean
}

export interface FreelancersResponse {
  freelances: Freelancer[]
}

export interface Company {
  id: number
  first_name: string
  surname: string
  organization_size: string
  phone_number: string
  email: string
  password: string
  accept_terms: boolean
  accept_marketing: boolean
  created_at: string
  updated_at: string
  industry: string | null
  website: string | null
  country: string | null
  city: string | null
  zip_code: string | null
  is_active: boolean
}

export interface CompaniesResponse {
  entreprises: Company[]
}

export interface StatsResponse {
  total_freelances: number
  total_entreprises: number
  total_jobs: number
  total_invitations: number
  total_candidatures: number
}

// Utilitaire pour gérer les erreurs
class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

// Utilitaire pour faire des requêtes
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`

  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  }

  try {
    console.log(`🚀 API Request: ${config.method || "GET"} ${url}`)

    const response = await fetch(url, config)

    console.log(`📡 Response Status: ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ API Error: ${response.status} - ${errorText}`)
      throw new ApiError(response.status, errorText || `HTTP ${response.status}`)
    }

    const data = await response.json()
    console.log(`✅ API Success:`, data)

    return data
  } catch (error) {
    console.error(`💥 API Request Failed:`, error)

    if (error instanceof ApiError) {
      throw error
    }

    // Erreur réseau ou autre
    throw new ApiError(0, `Erreur de connexion: ${error.message}`)
  }
}

// Utilitaire pour obtenir le token
function getAuthToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("admin_token")
}

// Utilitaire pour les requêtes authentifiées
async function authenticatedRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken()

  if (!token) {
    throw new ApiError(401, "Token d'authentification manquant")
  }

  return apiRequest<T>(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  })
}

// === API FUNCTIONS ===

// Authentification
export const authApi = {
  async login(email: string, password: string): Promise<LoginResponse> {
    return apiRequest<LoginResponse>("/admin/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  },

  logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("admin_token")
    }
  },

  isAuthenticated(): boolean {
    return !!getAuthToken()
  },
}

// Freelancers
export const freelancersApi = {
  async getAll(): Promise<FreelancersResponse> {
    return authenticatedRequest<FreelancersResponse>("/admin/freelances")
  },

  async getById(id: string): Promise<Freelancer> {
    return authenticatedRequest<Freelancer>(`/admin/freelances/${id}`)
  },

  async create(freelancer: Partial<Freelancer>): Promise<Freelancer> {
    return authenticatedRequest<Freelancer>("/admin/freelances", {
      method: "POST",
      body: JSON.stringify(freelancer),
    })
  },

  async update(id: string, freelancer: Partial<Freelancer>): Promise<Freelancer> {
    return authenticatedRequest<Freelancer>(`/admin/freelances/${id}`, {
      method: "PUT",
      body: JSON.stringify(freelancer),
    })
  },

  async delete(id: string): Promise<void> {
    return authenticatedRequest<void>(`/admin/freelances/${id}`, {
      method: "DELETE",
    })
  },

  async ban(id: string): Promise<Freelancer> {
    return authenticatedRequest<Freelancer>(`/admin/freelances/${id}/ban`, {
      method: "PATCH",
    })
  },

  async unban(id: string): Promise<Freelancer> {
    return authenticatedRequest<Freelancer>(`/admin/freelances/${id}/unban`, {
      method: "PATCH",
    })
  },

  // Fonction pour activer/désactiver (si l'endpoint existe)
  async toggleActive(id: string): Promise<Freelancer> {
    return authenticatedRequest<Freelancer>(`/admin/freelances/${id}/toggle-active`, {
      method: "PATCH",
    })
  },
}

// Entreprises
export const companiesApi = {
  async getAll(): Promise<CompaniesResponse> {
    return authenticatedRequest<CompaniesResponse>("/admin/entreprises")
  },

  async getById(id: string): Promise<Company> {
    return authenticatedRequest<Company>(`/admin/entreprises/${id}`)
  },

  async create(company: Partial<Company>): Promise<Company> {
    return authenticatedRequest<Company>("/admin/entreprises", {
      method: "POST",
      body: JSON.stringify(company),
    })
  },

  async update(id: string, company: Partial<Company>): Promise<Company> {
    return authenticatedRequest<Company>(`/admin/entreprises/${id}`, {
      method: "PUT",
      body: JSON.stringify(company),
    })
  },

  async delete(id: string): Promise<void> {
    return authenticatedRequest<void>(`/admin/entreprises/${id}`, {
      method: "DELETE",
    })
  },

  async ban(id: string): Promise<Company> {
    return authenticatedRequest<Company>(`/admin/entreprises/${id}/ban`, {
      method: "PATCH",
    })
  },

  async unban(id: string): Promise<Company> {
    return authenticatedRequest<Company>(`/admin/entreprises/${id}/unban`, {
      method: "PATCH",
    })
  },

  async toggleStatus(id: string): Promise<Company> {
    return authenticatedRequest<Company>(`/admin/entreprises/${id}/toggle-status`, {
      method: "PATCH",
    })
  },
}

// Statistiques
export const statsApi = {
  async getAll(): Promise<StatsResponse> {
    return authenticatedRequest<StatsResponse>("/admin/stats")
  },

  async getDashboard(): Promise<any> {
    return authenticatedRequest<any>("/admin/stats/dashboard")
  },

  async getFreelancersStats(): Promise<any> {
    return authenticatedRequest<any>("/admin/stats/freelancers")
  },

  async getCompaniesStats(): Promise<any> {
    return authenticatedRequest<any>("/admin/stats/companies")
  },
}

// Export par défaut
export default {
  auth: authApi,
  freelancers: freelancersApi,
  companies: companiesApi,
  stats: statsApi,
}
