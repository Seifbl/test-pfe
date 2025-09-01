import axios from "axios"

const API_URL = process.env.API_BASE_URL || "http://localhost:5000/api"

// ➔ Créer une instance axios
const api = axios.create({
  baseURL: API_URL,
})

// Ajouter un intercepteur pour inclure le token d'authentification
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

interface MessageData {
  sender_id: string
  receiver_id: string
  job_id: string
  content: string
}

class MessageService {
  async sendMessage(messageData: MessageData) {
    try {
      console.log("Envoi d'un message via service:", messageData)

      const endpoint = messageData.job_id === "general" ? "/messages/general" : "/messages"

      console.log("Utilisation de l'endpoint:", `${API_URL}${endpoint}`)
      const response = await api.post(endpoint, messageData)

      console.log("Réponse du serveur:", response.data)
      return response.data
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error)

      if (axios.isAxiosError(error)) {
        console.error("Détails de l'erreur Axios:", {
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers,
          config: error.config,
        })
      }

      throw error
    }
  }

  async getMessageHistory(jobId: string, user1Id: string, user2Id: string) {
    try {
      console.log(`Récupération des messages pour job=${jobId}, user1=${user1Id}, user2=${user2Id}`)

      // Validate parameters
      if (!jobId || !user1Id || !user2Id || user1Id === "undefined" || user2Id === "undefined") {
        console.error("Paramètres invalides pour getMessageHistory:", { jobId, user1Id, user2Id })
        return []
      }

      const endpoint =
        jobId === "general" ? `/messages/general/${user1Id}/${user2Id}` : `/messages/${jobId}/${user1Id}/${user2Id}`

      console.log("Utilisation de l'endpoint:", `${API_URL}${endpoint}`)

      try {
        const response = await api.get(endpoint)
        console.log("Réponse du serveur:", response.data)
        return response.data
      } catch (error) {
        console.error("Première tentative échouée, essai avec l'ordre inverse des IDs")

        const alternativeEndpoint =
          jobId === "general" ? `/messages/general/${user2Id}/${user1Id}` : `/messages/${jobId}/${user2Id}/${user1Id}`

        console.log("Utilisation de l'endpoint alternatif:", `${API_URL}${alternativeEndpoint}`)
        const alternativeResponse = await api.get(alternativeEndpoint)
        console.log("Réponse du serveur (ordre inverse):", alternativeResponse.data)
        return alternativeResponse.data
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de l'historique des messages:", error)

      if (axios.isAxiosError(error)) {
        console.error("Détails de l'erreur Axios:", {
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers,
          config: error.config,
        })
      }

      return [] // Return empty array instead of throwing
    }
  }

  async getUserConversations(userId: string) {
    try {
      console.log(`Récupération des conversations pour user=${userId}`)

      // Utiliser l'endpoint correct pour les conversations
      const endpoint = `/messages/conversations/${userId}`
      console.log("Utilisation de l'endpoint:", `${API_URL}${endpoint}`)

      const response = await api.get(endpoint)
      console.log("Réponse du serveur (brute):", response)
      console.log("Réponse du serveur (data):", response.data)
      console.log("Type de la réponse:", typeof response.data)

      // Vérifier si la réponse est un tableau
      if (Array.isArray(response.data)) {
        console.log("La réponse est un tableau de", response.data.length, "éléments")
        return response.data
      }
      // Si la réponse est un objet avec une propriété qui contient un tableau
      else if (response.data && typeof response.data === "object") {
        console.log("La réponse est un objet avec les clés:", Object.keys(response.data))

        // Chercher une propriété qui contient un tableau
        for (const key in response.data) {
          if (Array.isArray(response.data[key])) {
            console.log(
              `Utilisation de la propriété ${key} qui contient un tableau de ${response.data[key].length} éléments`,
            )
            return response.data[key]
          }
        }

        // Chercher une propriété "data" ou "conversations" qui pourrait contenir les données
        if (response.data.data) {
          console.log("Utilisation de la propriété 'data'")
          return Array.isArray(response.data.data) ? response.data.data : [response.data.data]
        }

        if (response.data.conversations) {
          console.log("Utilisation de la propriété 'conversations'")
          return Array.isArray(response.data.conversations)
            ? response.data.conversations
            : [response.data.conversations]
        }

        // Si aucun tableau n'est trouvé mais que c'est un objet, le retourner dans un tableau
        console.log("Aucun tableau trouvé dans la réponse, encapsulation de l'objet")
        return [response.data]
      }

      // Si la réponse n'est ni un tableau ni un objet avec un tableau, retourner un tableau vide
      console.warn("Format de réponse inattendu:", response.data)
      return []
    } catch (error) {
      console.error("Erreur lors de la récupération des conversations:", error)

      if (axios.isAxiosError(error)) {
        console.error("Détails de l'erreur Axios:", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          headers: error.response?.headers,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            baseURL: error.config?.baseURL,
            headers: error.config?.headers,
          },
        })

        // Si nous recevons du HTML au lieu de JSON, c'est probablement une erreur 404 ou 500
        if (typeof error.response?.data === "string" && error.response.data.includes("<!DOCTYPE")) {
          console.error("Le serveur a renvoyé du HTML au lieu de JSON. Vérifiez l'URL de l'API et les logs du serveur.")
        }

        // Si c'est une erreur 404, essayer un endpoint alternatif
        if (error.response?.status === 404) {
          try {
            console.log("Tentative avec un endpoint alternatif")
            const alternativeEndpoint = `/messages/user/${userId}/conversations`
            console.log("Utilisation de l'endpoint alternatif:", `${API_URL}${alternativeEndpoint}`)

            const alternativeResponse = await api.get(alternativeEndpoint)
            console.log("Réponse de l'endpoint alternatif:", alternativeResponse.data)

            if (Array.isArray(alternativeResponse.data)) {
              return alternativeResponse.data
            } else if (alternativeResponse.data && typeof alternativeResponse.data === "object") {
              return [alternativeResponse.data]
            }
          } catch (altError) {
            console.error("Échec de la tentative avec l'endpoint alternatif:", altError)
          }
        }
      }

      // Retourner un tableau vide en cas d'erreur plutôt que de propager l'erreur
      return []
    }
  }

  // Ajouter une méthode de secours pour récupérer directement les informations de l'entreprise
  async getCompanyInfoByJobId(jobId: string) {
    try {
      console.log(`Récupération des informations de l'entreprise pour le job ${jobId}`)
      const endpoint = `/jobs/${jobId}/company`
      console.log("Utilisation de l'endpoint:", `${API_URL}${endpoint}`)

      const response = await api.get(endpoint)
      console.log("Informations de l'entreprise récupérées:", response.data)
      return response.data
    } catch (error) {
      console.error("Erreur lors de la récupération des informations de l'entreprise:", error)

      // Essayer un endpoint alternatif
      try {
        const alternativeEndpoint = `/jobs/${jobId}`
        console.log("Tentative avec l'endpoint alternatif:", `${API_URL}${alternativeEndpoint}`)

        const jobResponse = await api.get(alternativeEndpoint)
        if (jobResponse.data && jobResponse.data.company_id) {
          return {
            id: jobResponse.data.company_id,
            name: jobResponse.data.company_name || "Entreprise",
          }
        }
      } catch (altError) {
        console.error("Échec de la tentative avec l'endpoint alternatif:", altError)
      }

      return null
    }
  }
}

export const messageService = new MessageService()
