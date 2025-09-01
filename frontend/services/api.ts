import axios from "axios"

const API_URL = process.env.API_BASE_URL || "http://localhost:5000/api"
const normalizeDate = (dateStr?: string): string | null => {
  return dateStr ? `${dateStr}-01` : null
}
// Création d'une instance axios avec la configuration de base
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // Ajouter un timeout pour éviter les requêtes qui restent en attente trop longtemps
  timeout: 10000,
})

// Intercepteur pour ajouter le token d'authentification à chaque requête
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error("Erreur dans la configuration de la requête:", error)
    return Promise.reject(error)
  },
)

// Ajoutez un intercepteur de réponse pour gérer les erreurs globalement
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Log détaillé de l'erreur
    if (error.response) {
      console.error("Erreur API:", {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
        url: error.config?.url,
        method: error.config?.method,
      })

      // Si le token est expiré ou invalide (401), déconnectez l'utilisateur
      if (error.response.status === 401) {
        localStorage.removeItem("token")
        // Vous pouvez ajouter une redirection vers la page de connexion si nécessaire
        // window.location.href = "/login"
      }
    } else if (error.request) {
      console.error("Pas de réponse du serveur:", error.request)
      // Vous pouvez ajouter un message d'erreur personnalisé pour les problèmes de connexion
      error.message = "Impossible de se connecter au serveur. Veuillez vérifier votre connexion internet."
    } else {
      console.error("Erreur de configuration de la requête:", error.message)
    }

    return Promise.reject(error)
  },
)

// Modifier les services d'authentification pour utiliser les bons endpoints
export const authService = {
  // Inscription entreprise
  registerCompany: async (companyData: {
    first_name: string
    surname: string
    organization_size: string
    phone_number: string
    email: string
    password: string
    accept_terms: boolean
    accept_marketing: boolean
  }) => {
    try {
      return await api.post("/auth/signup/company", companyData)
    } catch (error) {
      console.error("Erreur lors de l'inscription de l'entreprise:", error)
      throw error
    }
  },

  // Connexion (entreprise ou talent)
  login: async (credentials: { email: string; password: string }, userType?: "company" | "talent") => {
    try {
      console.log("Tentative de connexion avec:", credentials, "Type:", userType)

      // Utiliser l'endpoint approprié selon le type d'utilisateur
      const endpoint = userType === "company" ? "/auth/login" : "/freelances/login"
      console.log("Utilisation de l'endpoint:", endpoint)

      const response = await api.post(endpoint, credentials)
      console.log("Réponse du serveur:", response.data)
      return response
    } catch (error) {
      console.error("Erreur lors de la connexion:", error)
      throw error
    }
  },

  // Déconnexion (côté client)
  logout: () => {
    localStorage.removeItem("token")
  },

  // Inscription freelancer
  registerFreelancer: async (freelancerData: {
    first_name: string
    last_name: string
    email: string
    password: string
    title?: string
    experience_level?: string
    skills?: string[]
    bio?: string
    accept_terms?: boolean
    accept_marketing?: boolean
  }) => {
    try {
      // Utiliser le bon endpoint pour l'inscription des freelances
      console.log("Tentative d'inscription avec l'endpoint /freelances/register")
      return await api.post("/freelances/register", freelancerData)
    } catch (error) {
      console.error("Erreur lors de l'inscription du freelancer:", error)
      throw error
    }
  },
}

// Services entreprise
export const companyService = {
  // Récupérer les informations de l'entreprise connectée
  getCompanyProfile: async () => {
    try {
      return await api.get("/entreprise/me")
    } catch (error) {
      console.error("Erreur lors de la récupération du profil de l'entreprise:", error)
      throw error
    }
  },

  // Récupérer les données du dashboard entreprise
  getCompanyDashboard: async () => {
    try {
      return await api.get("/entreprise/dashboard")
    } catch (error) {
      console.error("Erreur lors de la récupération du dashboard de l'entreprise:", error)
      throw error
    }
  },

  // Mettre à jour le profil de l'entreprise
  updateCompanyProfile: async (profileData: {
    first_name: string
    surname: string
    organization_size: string
    phone_number: string
    industry: string
    website: string
    country: string
    city: string
    zip_code: string
  }) => {
    try {
      return await api.put("/entreprise/me", profileData)
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil de l'entreprise:", error)
      throw error
    }
  },
}

// Services de gestion des jobs
export const jobService = {
  // Créer un nouveau job
  createJob: async (jobData: {
    title: string
    description: string
    duration: string
    experience_level: string
    skills: string[]
    salary: string
    questions: string[]
    is_draft: boolean
  }) => {
    try {
      return await api.post("/jobs", jobData)
    } catch (error) {
      console.error("Erreur lors de la création du job:", error)
      throw error
    }
  },

  // Récupérer tous les jobs de l'entreprise
  getAllJobs: async () => {
    try {
      return await api.get("/jobs")
    } catch (error) {
      console.error("Erreur lors de la récupération des jobs:", error)
      throw error
    }
  },

  // Récupérer les jobs publics (pour la page Jobs)
  getPublicJobs: async () => {
    try {
      console.log("Récupération des jobs publics")
      return await api.get("/jobs/public")
    } catch (error) {
      console.error("Erreur lors de la récupération des jobs publics:", error)
      throw error
    }
  },

  // Récupérer un job public spécifique (pour la page JobDetail)
  getPublicJobById: async (id: string) => {
    try {
      console.log(`Récupération du job public avec l'ID ${id}`)
      return await api.get(`/jobs/public/${id}`)
    } catch (error) {
      console.error(`Erreur lors de la récupération du job public ${id}:`, error)
      throw error
    }
  },

  // Récupérer les jobs publiés
  getPublishedJobs: async () => {
    try {
      return await api.get("/jobs/published")
    } catch (error) {
      console.error("Erreur lors de la récupération des jobs publiés:", error)
      throw error
    }
  },

  // Récupérer les jobs en brouillon
  getDraftJobs: async () => {
    try {
      return await api.get("/jobs/drafts")
    } catch (error) {
      console.error("Erreur lors de la récupération des jobs en brouillon:", error)
      throw error
    }
  },

  // Récupérer un job spécifique
  getJobById: async (id: string) => {
    try {
      return await api.get(`/jobs/${id}`)
    } catch (error) {
      console.error(`Erreur lors de la récupération du job ${id}:`, error)
      throw error
    }
  },

  // Mettre à jour un job
  updateJob: async (
    id: string,
    jobData: Partial<{
      title: string
      description: string
      duration: string
      experience_level: string
      skills: string[]
      salary: string
      questions: string[]
      is_draft: boolean
    }>,
  ) => {
    try {
      // Assurez-vous que les données sont correctement formatées
      if (jobData.is_draft !== undefined) {
        jobData.is_draft = Boolean(jobData.is_draft)
      }

      console.log("Données envoyées à l'API:", jobData)
      return await api.put(`/jobs/${id}`, jobData)
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du job ${id}:`, error)
      throw error
    }
  },
  // Récupérer les freelances recommandés pour un job spécifique
  getRecommendedFreelancers: async (jobId: string) => {
    try {
      console.log(`🔍 Récupération des freelances recommandés pour le job ${jobId}`)
      const response = await api.get(`/jobs/${jobId}/recommend-freelances`)
      // On trie directement côté client si nécessaire
      return response.data.matchedFreelances.sort((a: any, b: any) => b.score - a.score)
    } catch (error) {
      console.error(`❌ Erreur lors de la récupération des freelances recommandés pour le job ${jobId}:`, error)
      throw error
    }
  },

  // Supprimer un job
  deleteJob: async (id: string) => {
    try {
      return await api.delete(`/jobs/${id}`)
    } catch (error) {
      console.error(`Erreur lors de la suppression du job ${id}:`, error)
      throw error
    }
  },

  // Postuler à un job
  applyToJob: async (
    jobId: string,
    applicationData: {
      cover_letter?: string
      answers?: Record<string, string>
    },
  ) => {
    try {
      console.log(`Candidature au job ${jobId} avec les données:`, applicationData)
      return await api.post(`/jobs/${jobId}/apply`, applicationData)
    } catch (error) {
      console.error(`Erreur lors de la candidature au job ${jobId}:`, error)
      throw error
    }
  },

  // Marquer un job comme terminé
  completeJob: async (id: string) => {
    try {
      console.log(`Marquage du job ${id} comme terminé`)
      return await api.put(`/jobs/${id}/complete`)
    } catch (error) {
      console.error(`Erreur lors du marquage du job ${id} comme terminé:`, error)
      throw error
    }
  },

  // Affecter un freelance à un job
  assignFreelance: async (jobId: string, freelanceId: string | number) => {
    try {
      console.log(`Affectation du freelance ${freelanceId} au job ${jobId}`)
      return await api.put(`/jobs/${jobId}/assign`, { freelance_id: freelanceId })
    } catch (error) {
      console.error(`Erreur lors de l'affectation du freelance au job ${jobId}:`, error)
      throw error
    }
  },

  // Récupérer le freelance assigné à un job
  getAssignedFreelance: async (jobId: string) => {
    try {
      console.log(`Récupération du freelance assigné au job ${jobId}`)
      return await api.get(`/jobs/${jobId}/assigned-freelance`)
    } catch (error) {
      console.error(`Erreur lors de la récupération du freelance assigné au job ${jobId}:`, error)
      throw error
    }
  },

  // Récupérer les jobs complétés
  getCompletedJobs: async () => {
    try {
      console.log("Récupération des jobs complétés")
      return await api.get("/jobs/completed")
    } catch (error) {
      console.error("Erreur lors de la récupération des jobs complétés:", error)
      throw error
    }
  },
}

// Services de gestion des invitations
export const invitationService = {
  // Récupérer toutes les invitations pour un job spécifique
  getInvitationsByJobId: async (jobId: string) => {
    try {
      return await api.get(`/invitations/${jobId}`)
    } catch (error) {
      console.error(`Erreur lors de la récupération des invitations pour le job ${jobId}:`, error)
      throw error
    }
  },

  // Récupérer les invitations pour le freelance connecté
  getMyInvitations: async () => {
    try {
      console.log("Récupération des invitations du freelance connecté")
      // Utilisation du bon endpoint vérifié avec Postman
      const response = await api.get("/invitations/freelance/me")
      console.log("Réponse des invitations:", response.data)
      return { data: response.data, isDemo: false }
    } catch (error) {
      console.error("Erreur lors de la récupération des invitations:", error)

      // En cas d'erreur, retourner des données de démonstration
      console.log("Utilisation des données de démonstration pour les invitations")

      // Créer des données de démonstration
      const currentDate = new Date()
      const yesterday = new Date(currentDate)
      yesterday.setDate(yesterday.getDate() - 1)

      const lastWeek = new Date(currentDate)
      lastWeek.setDate(lastWeek.getDate() - 7)

      const demoData = [
        {
          invitation_id: "demo1",
          id: "demo1",
          job_id: "1",
          job_title: "Développeur Frontend React",
          status: "pending",
          sent_at: currentDate.toISOString(),
          job: {
            id: "1",
            title: "Développeur Frontend React",
            description: "Nous recherchons un développeur React expérimenté pour travailler sur notre application web.",
            company: {
              id: "1",
              name: "Entreprise Demo",
            },
          },
        },
        {
          invitation_id: "demo2",
          id: "demo2",
          job_id: "2",
          job_title: "Développeur Backend Node.js",
          status: "accepted",
          sent_at: yesterday.toISOString(),
          job: {
            id: "2",
            title: "Développeur Backend Node.js",
            description: "Rejoignez notre équipe pour développer des API performantes avec Node.js et Express.",
            company: {
              id: "2",
              name: "Société Test",
            },
          },
        },
        {
          invitation_id: "demo3",
          id: "demo3",
          job_id: "3",
          job_title: "Designer UX/UI",
          status: "rejected",
          sent_at: lastWeek.toISOString(),
          job: {
            id: "3",
            title: "Designer UX/UI",
            description:
              "Nous cherchons un designer UX/UI talentueux pour concevoir des interfaces utilisateur intuitives.",
            company: {
              id: "3",
              name: "Agence Créative",
            },
          },
        },
      ]

      return { data: demoData, isDemo: true }
    }
  },

  // Créer une nouvelle invitation
  createInvitation: async (invitationData: {
    freelance_id: number | string
    job_id: string
    status?: string
  }) => {
    try {
      return await api.post("/invitations", invitationData)
    } catch (error) {
      console.error("Erreur lors de la création de l'invitation:", error)
      throw error
    }
  },

  // Mettre à jour le statut d'une invitation
  updateInvitationStatus: async (id: number | string, status: string) => {
    try {
      console.log(`Mise à jour du statut de l'invitation ${id} vers ${status}`)

      // Utiliser les endpoints spécifiques pour accepter ou refuser une invitation
      if (status === "accepted") {
        return await api.put(`/invitations/freelance/${id}/accept`)
      } else if (status === "rejected" || status === "declined" || status === "refused") {
        return await api.put(`/invitations/freelance/${id}/refuse`)
      } else {
        // Fallback pour d'autres statuts (si nécessaire dans le futur)
        console.warn(`Statut non reconnu: ${status}, utilisation de la méthode générique`)
        return await api.patch(`/invitations/${id}`, { status })
      }
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du statut de l'invitation ${id}:`, error)
      throw error
    }
  },

  // Supprimer une invitation
  deleteInvitation: async (id: number) => {
    try {
      return await api.delete(`/invitations/${id}`)
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'invitation ${id}:`, error)
      throw error
    }
  },
}

// Service pour les freelances
export const freelanceService = {
  // Récupérer le profil du freelance connecté
  getFreelanceProfile: async () => {
    try {
      return await api.get("/freelances/me")
    } catch (error) {
      console.error("Erreur lors de la récupération du profil freelance:", error)
      throw error
    }
  },

  // Récupérer les compétences du freelance
  getSkills: async () => {
    try {
      return await api.get("/freelances/skills")
    } catch (error) {
      console.error("Erreur lors de la récupération des compétences:", error)
      throw error
    }
  },

  // Mettre à jour le profil du freelance (informations générales)
  updateFreelanceProfile: async (data: {
    location?: string
    bio?: string
    website?: string
    linkedin?: string
    github?: string
  }) => {
    try {
      console.log("Updating profile with data:", data)
      return await api.put("/freelances/me", data)
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil freelance:", error)
      throw error
    }
  },

  // Lister tous les freelances
  getAllFreelances: async (params?: {
    page?: number
    limit?: number
    skills?: string[]
    experience_level?: string
    search?: string
  }) => {
    try {
      console.log("Récupération des freelances avec les paramètres:", params)
      return await api.get("/freelances", { params })
    } catch (error) {
      console.error("Erreur lors de la récupération de la liste des freelances:", error)
      throw error
    }
  },

  // Voir le profil d'un freelance spécifique
  getFreelanceById: async (id: number | string) => {
    try {
      console.log(`Récupération du profil freelance avec l'ID ${id}`)
      return await api.get(`/freelances/${id}`)
    } catch (error) {
      console.error(`Erreur lors de la récupération du freelance avec l'ID ${id}:`, error)
      throw error
    }
  },

  // Télécharger un avatar pour le freelance
  uploadAvatar: async (file: File) => {
    try {
      const formData = new FormData()
      formData.append("avatar", file)

      return await api.post("/freelances/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
    } catch (error) {
      console.error("Erreur lors du téléchargement de l'avatar:", error)
      throw error
    }
  },

  // Télécharger le CV du freelance
  uploadCV: async (file: File) => {
    try {
      const formData = new FormData()
      formData.append("cv", file)

      return await api.post("/freelances/upload-cv", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
    } catch (error) {
      console.error("Erreur lors du téléchargement du CV:", error)
      throw error
    }
  },

  // Ajouter une expérience professionnelle
  addWorkExperience: async (data: {
    title: string
    company: string
    start_date: string // ex: "2025-05"
    end_date?: string // ex: "2025-07"
    is_current?: boolean
    description?: string
  }) => {
    try {
      const payload = {
        title: data.title,
        company: data.company,
        start_date: data.start_date + "-01", // ✅ format ISO
        end_date: data.is_current ? null : data.end_date ? data.end_date + "-01" : null,
        currently_working: data.is_current || false, // ✅ clé correcte
        description: data.description || "",
      }

      console.log("📦 Payload final:", payload)

      return await api.post("/freelances/experiences", payload)
    } catch (error) {
      console.error("❌ Erreur lors de l'ajout d'une expérience professionnelle:", error)
      throw error
    }
  },
  // Supprimer une expérience professionnelle
  deleteWorkExperience: async (id: number) => {
    try {
      return await api.delete(`/freelances/experiences/${id}`)
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'expérience avec l'ID ${id}:`, error)
      throw error
    }
  },

  // Mettre à jour les rôles professionnels
  updateRoles: async (data: {
    roles: Array<{
      role: string
      years_of_experience: number
      is_primary: boolean
    }>
  }) => {
    try {
      // Log the exact data being sent
      console.log("API sending roles data:", JSON.stringify(data, null, 2))

      // Try different formats to see which one works
      try {
        // First try with the original format
        return await api.post("/freelances/roles", data)
      } catch (firstError) {
        console.log("First attempt failed, trying alternative format")

        // Try with the array directly
        const roles = data.roles.map((role) => ({
          ...role,
          // Convert years_of_experience to a number to ensure it's not a string
          years_of_experience: Number(role.years_of_experience),
        }))

        console.log("Trying with roles array directly:", JSON.stringify(roles, null, 2))
        return await api.post("/freelances/roles", roles)
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour des rôles:", error)
      throw error
    }
  },

  // Mettre à jour les compétences
  updateSkills: async (data: {
    skills: Array<{
      skill: string
      is_top_skill: boolean
    }>
  }) => {
    try {
      console.log("API sending skills data:", JSON.stringify(data, null, 2))

      // Try different formats to see which one works
      try {
        // First try with the original format
        return await api.post("/freelances/skills", data)
      } catch (firstError) {
        console.log("First attempt failed, trying alternative format")

        // Try with the array directly
        const skills = data.skills
        console.log("Trying with skills array directly:", JSON.stringify(skills, null, 2))
        return await api.post("/freelances/skills", skills)
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour des compétences:", error)
      throw error
    }
  },

  // Mettre à jour les expériences professionnelles
  updateExperiences: async (data: {
    experiences: Array<{
      title: string
      company: string
      start_date: string
      end_date?: string
      currently_working: boolean
      description: string
    }>
  }) => {
    try {
      const experience = data.experiences[0]

      // Créer l'objet à envoyer directement
      const payload = {
        title: experience.title,
        company: experience.company,
        start_date: normalizeDate(experience.start_date),
        end_date: experience.currently_working ? null : normalizeDate(experience.end_date),

        currently_working: experience.currently_working,
        description: experience.description || "",
      }

      console.log("📦 Payload envoyé :", JSON.stringify(payload, null, 2))

      // Envoyer directement le payload sans clé "experience"
      return await api.post("/freelances/experiences", payload)
    } catch (error) {
      console.error("❌ Erreur lors de la mise à jour des expériences :", error)
      throw error
    }
  },

  // Supprimer un rôle spécifique
  deleteRole: async (roleId: number) => {
    try {
      console.log(`🔍 Tentative de suppression du rôle ${roleId}...`)

      // Récupérer le token d'authentification
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Token d'authentification non trouvé")
      }

      // URL complète pour le débogage
      const url = `http://localhost:5000/api/freelances/roles/${roleId}`
      console.log(`📡 URL de suppression: ${url}`)

      // En-têtes avec token d'authentification
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }
      console.log(`🔑 En-têtes utilisés:`, headers)

      // Utiliser fetch natif pour plus de contrôle et de débogage
      const response = await fetch(url, {
        method: "DELETE",
        headers: headers,
      })

      // Vérifier si la réponse est OK
      if (!response.ok) {
        const errorText = await response.text()
        console.error(`❌ Erreur HTTP ${response.status}: ${errorText}`)
        throw new Error(`Erreur HTTP ${response.status}: ${errorText}`)
      }

      // Tenter de parser la réponse comme JSON
      let data
      try {
        data = await response.json()
        console.log(`✅ Réponse du serveur:`, data)
      } catch (e) {
        // Si la réponse n'est pas du JSON, utiliser le texte brut
        const text = await response.text()
        console.log(`✅ Réponse du serveur (texte):`, text)
        data = { message: text }
      }

      return { data, status: response.status }
    } catch (error) {
      console.error(`❌ Erreur lors de la suppression du rôle ${roleId}:`, error)
      throw error
    }
  },

  // Supprimer une compétence spécifique
  deleteSkill: async (skillId: number) => {
    try {
      console.log(`🔍 Tentative de suppression de la compétence ${skillId}...`)

      // Récupérer le token d'authentification
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Token d'authentification non trouvé")
      }

      // URL complète pour le débogage
      const url = `http://localhost:5000/api/freelances/skills/${skillId}`
      console.log(`📡 URL de suppression: ${url}`)

      // En-têtes avec token d'authentification
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }
      console.log(`🔑 En-têtes utilisés:`, headers)

      // Utiliser fetch natif pour plus de contrôle et de débogage
      const response = await fetch(url, {
        method: "DELETE",
        headers: headers,
      })

      // Vérifier si la réponse est OK
      if (!response.ok) {
        const errorText = await response.text()
        console.error(`❌ Erreur HTTP ${response.status}: ${errorText}`)
        throw new Error(`Erreur HTTP ${response.status}: ${errorText}`)
      }

      // Tenter de parser la réponse comme JSON
      let data
      try {
        data = await response.json()
        console.log(`✅ Réponse du serveur:`, data)
      } catch (e) {
        // Si la réponse n'est pas du JSON, utiliser le texte brut
        const text = await response.text()
        console.log(`✅ Réponse du serveur (texte):`, text)
        data = { message: text }
      }

      return { data, status: response.status }
    } catch (error) {
      console.error(`❌ Erreur lors de la suppression de la compétence ${skillId}:`, error)
      throw error
    }
  },
}

// Service pour les applications (candidatures)
export const applicationService = {
  // Postuler à un job
  applyToJob: async (jobId: string, freelanceId: string) => {
    try {
      console.log(`Candidature au job ${jobId} par le freelance ${freelanceId}`)

      // Vérifier que les IDs sont valides
      if (!jobId || !freelanceId) {
        throw new Error("ID du job ou du freelance manquant")
      }

      // Utiliser la route correcte avec le bon format de données
      return await api.post("/job-applications/apply", {
        job_id: jobId,
        freelance_id: freelanceId,
      })
    } catch (error) {
      console.error(`Erreur lors de la candidature au job ${jobId}:`, error)

      // Afficher plus de détails sur l'erreur pour le débogage
      if (error.response) {
        console.error("Réponse d'erreur:", {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers,
        })
      } else if (error.request) {
        console.error("Requête sans réponse:", error.request)
      } else {
        console.error("Message d'erreur:", error.message)
      }

      throw error
    }
  },

  // Vérifier si un freelance a déjà postulé à un job
  checkApplication: async (jobId: string, freelanceId: string) => {
    try {
      console.log(`Vérification de candidature pour le job ${jobId} et le freelance ${freelanceId}`)

      // Utiliser l'endpoint correct ou vérifier si l'utilisateur a postulé d'une autre manière
      // Par exemple, on peut essayer de récupérer toutes les candidatures de l'utilisateur
      // et vérifier si le job est dans la liste

      // Essayons d'abord avec l'endpoint qui pourrait exister
      try {
        return await api.get(`/job-applications/check/${jobId}/${freelanceId}`)
      } catch (checkError) {
        console.log("Endpoint de vérification spécifique non disponible, utilisation de la méthode alternative")

        // Méthode alternative: récupérer toutes les candidatures de l'utilisateur
        // et vérifier manuellement
        const response = await api.get(`/job-applications/freelance/${freelanceId}`)

        // Si l'endpoint alternatif n'existe pas non plus, on suppose que l'utilisateur n'a pas postulé
        if (!response || !response.data) {
          return { data: { hasApplied: false } }
        }

        // Vérifier si le jobId est dans la liste des candidatures
        const hasApplied = response.data.some(
          (application: any) => application.job_id === jobId || application.job_id === Number.parseInt(jobId),
        )

        return { data: { hasApplied } }
      }
    } catch (error) {
      // Si toutes les tentatives échouent, on suppose que l'utilisateur n'a pas postulé
      console.log("Erreur lors de la vérification de candidature, on suppose que l'utilisateur n'a pas postulé:", error)
      return { data: { hasApplied: false } }
    }
  },

  // Récupérer les candidatures pour un job spécifique (pour les entreprises)
  getApplicationsByJobId: async (jobId: string) => {
    try {
      console.log(`Récupération des candidatures pour le job ${jobId}`)
      return await api.get(`/job-applications/job/${jobId}`)
    } catch (error) {
      console.error(`Erreur lors de la récupération des candidatures pour le job ${jobId}:`, error)
      throw error
    }
  },
}

// Service pour les notations
export const ratingService = {
  // Noter un freelance
  rateFreelance: async (ratingData: {
    freelance_id: number
    job_id: number
    rating: number
    review?: string
  }) => {
    try {
      console.log("Envoi de la notation:", ratingData)
      return await api.post("/ratings", ratingData)
    } catch (error) {
      console.error("Erreur lors de l'envoi de la notation:", error)
      throw error
    }
  },

  // Récupérer les notations d'un freelance
  getFreelanceRatings: async (freelanceId: number | string) => {
    try {
      console.log(`Récupération des notations du freelance ${freelanceId}`)
      return await api.get(`/ratings/freelances/${freelanceId}`)
    } catch (error) {
      console.error(`Erreur lors de la récupération des notations du freelance ${freelanceId}:`, error)
      throw error
    }
  },

  // Récupérer les notations du freelance connecté
  getMyRatings: async () => {
    try {
      console.log("Récupération des notations du freelance connecté")
      return await api.get("/ratings/freelances/me")
    } catch (error) {
      console.error("Erreur lors de la récupération des notations:", error)
      throw error
    }
  },
}

// Service pour le chatbot
export const chatbotService = {
  sendMessage: async (question: string) => {
    try {
      console.log("Envoi de la question au chatbot:", question)
      const response = await api.post("/chatbot", { question })

      console.log("Réponse du chatbot:", response.data)
      return response.data.response // ✅ retourne directement la réponse utile
    } catch (error) {
      console.error("Erreur lors de l'envoi du message au chatbot:", error)
      throw error
    }
  },
}

// Service pour l'admin
export const adminService = {
  // Connexion admin
  login: async (credentials: { email: string; password: string }) => {
    try {
      console.log("Tentative de connexion admin avec:", credentials)
      return await api.post("/admin/auth/login", credentials)
    } catch (error) {
      console.error("Erreur lors de la connexion admin:", error)
      throw error
    }
  },

  // Récupérer le dashboard admin
  getDashboard: async () => {
    try {
      console.log("Récupération du dashboard admin")
      return await api.get("/admin/dashboard")
    } catch (error) {
      console.error("Erreur lors de la récupération du dashboard admin:", error)
      throw error
    }
  },

  // Récupérer tous les utilisateurs (admin)
  getUsers: async () => {
    try {
      console.log("Récupération de tous les utilisateurs")
      return await api.get("/admin/users")
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs:", error)
      throw error
    }
  },

  // Récupérer tous les jobs (admin)
  getJobs: async () => {
    try {
      console.log("Récupération de tous les jobs")
      return await api.get("/admin/jobs")
    } catch (error) {
      console.error("Erreur lors de la récupération des jobs:", error)
      throw error
    }
  },
}

export default api
