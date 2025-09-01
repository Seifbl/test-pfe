import axios from "axios"

const API_URL = process.env.API_BASE_URL || "http://localhost:5000/api"

class MessageService {
  async getUserConversations(userId: string): Promise<any[]> {
    try {
      const response = await axios.get(`${API_URL}/messages/conversations/${userId}`)
      return response.data
    } catch (error) {
      console.error("Error fetching user conversations:", error)
      return []
    }
  }

  async getMessageHistory(jobId: string, user1Id: string, user2Id: string): Promise<any[]> {
    try {
      // Validate parameters
      if (!jobId || !user1Id || !user2Id || user1Id === "undefined" || user2Id === "undefined") {
        console.error("Paramètres invalides pour getMessageHistory:", { jobId, user1Id, user2Id })
        return []
      }

      const endpoint = `/messages/${jobId}/${user1Id}/${user2Id}`
      const response = await axios.get(`${API_URL}${endpoint}`)
      return response.data
    } catch (error) {
      console.error("Error fetching message history:", error)
      return []
    }
  }

  async sendMessage(messageData: any): Promise<any> {
    try {
      const response = await axios.post(`${API_URL}/messages`, messageData)
      return response.data
    } catch (error) {
      console.error("Error sending message:", error)
      throw error
    }
  }
}

export const messageService = new MessageService()
