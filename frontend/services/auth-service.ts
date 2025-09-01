import axios from "axios"

const API_URL = process.env.API_BASE_URL || "http://localhost:5000/api"

export const authService = {
  // Request password reset
  forgotPassword: async (email: string, role: string) => {
    try {
      return await axios.post(`${API_URL}/auth/forgot-password`, { email, role })
    } catch (error) {
      console.error("Error requesting password reset:", error)
      throw error
    }
  },

  // Reset password with token
  resetPassword: async (token: string, password: string) => {
    try {
      return await axios.post(`${API_URL}/auth/reset-password/${token}`, { password })
    } catch (error) {
      console.error("Error resetting password:", error)
      throw error
    }
  },
}
