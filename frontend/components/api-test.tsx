"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import axios from "axios"

export default function ApiTest() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const { toast } = useToast()

  const testApi = async () => {
    try {
      setLoading(true)

      // Récupérer le token d'authentification
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Token d'authentification non trouvé")
      }

      // URL de l'API
      const apiUrl = process.env.API_BASE_URL || "http://localhost:5000/api/invitations/12"

      // Faire une requête GET à l'API
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      // Afficher le résultat
      setResult(response.data)

      toast({
        title: "Succès",
        description: "La requête a été effectuée avec succès.",
      })
    } catch (error) {
      console.error("Erreur lors du test de l'API:", error)

      // Afficher plus de détails sur l'erreur
      if (error.response) {
        setResult({
          error: true,
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers,
        })
      } else {
        setResult({
          error: true,
          message: error.message,
        })
      }

      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors du test de l'API.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test de l'API</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={testApi} disabled={loading}>
          {loading ? "Test en cours..." : "Tester l'API"}
        </Button>

        {result && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Résultat:</h3>
            <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-96">{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
