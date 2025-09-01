"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Users, Building2, Briefcase, Mail, FileText, TrendingUp, Activity, RefreshCw, BarChart3 } from "lucide-react"
import { statsApi, type StatsResponse } from "@/lib/api"

export default function StatisticsPage() {
  const [stats, setStats] = useState<StatsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError("")

      const response = await statsApi.getAll()
      setStats(response)
    } catch (error: any) {
      console.error("Erreur lors du chargement des statistiques:", error)
      setError(error.message || "Erreur lors du chargement des statistiques")
    } finally {
      setLoading(false)
    }
  }

  const getStatCards = () => {
    if (!stats) return []

    return [
      {
        title: "Total Freelancers",
        value: stats.total_freelances,
        icon: Users,
        description: "Freelancers inscrits",
        color: "text-blue-600",
        bgColor: "bg-blue-50",
      },
      {
        title: "Total Entreprises",
        value: stats.total_entreprises,
        icon: Building2,
        description: "Entreprises inscrites",
        color: "text-green-600",
        bgColor: "bg-green-50",
      },
      {
        title: "Total Jobs",
        value: stats.total_jobs,
        icon: Briefcase,
        description: "Offres d'emploi publiées",
        color: "text-purple-600",
        bgColor: "bg-purple-50",
      },
      {
        title: "Total Invitations",
        value: stats.total_invitations,
        icon: Mail,
        description: "Invitations envoyées",
        color: "text-orange-600",
        bgColor: "bg-orange-50",
      },
      {
        title: "Total Candidatures",
        value: stats.total_candidatures,
        icon: FileText,
        description: "Candidatures soumises",
        color: "text-red-600",
        bgColor: "bg-red-50",
      },
    ]
  }

  const getEngagementMetrics = () => {
    if (!stats) return { candidaturesPerJob: 0, invitationsPerCompany: 0, totalUsers: 0 }

    const totalUsers = stats.total_freelances + stats.total_entreprises
    const candidaturesPerJob = stats.total_jobs > 0 ? (stats.total_candidatures / stats.total_jobs).toFixed(1) : 0
    const invitationsPerCompany =
      stats.total_entreprises > 0 ? (stats.total_invitations / stats.total_entreprises).toFixed(1) : 0

    return {
      candidaturesPerJob,
      invitationsPerCompany,
      totalUsers,
    }
  }

  const metrics = getEngagementMetrics()

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Statistiques</h1>
          <p className="text-muted-foreground">Chargement des statistiques...</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Statistiques</h1>
          <p className="text-muted-foreground">Vue d'ensemble des métriques de votre plateforme</p>
        </div>
        <Button onClick={fetchStats} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Actualiser
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Statistiques principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {getStatCards().map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Métriques d'engagement */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Utilisateurs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Freelancers + Entreprises</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Candidatures/Job</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.candidaturesPerJob}</div>
            <p className="text-xs text-muted-foreground">Moyenne par offre</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Invitations/Entreprise</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.invitationsPerCompany}</div>
            <p className="text-xs text-muted-foreground">Moyenne par entreprise</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux d'Engagement</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats
                ? Math.round(((stats.total_candidatures + stats.total_invitations) / metrics.totalUsers) * 100)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">Actions par utilisateur</p>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques et analyses */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Répartition des Utilisateurs</CardTitle>
            <CardDescription>Distribution entre freelancers et entreprises</CardDescription>
          </CardHeader>
          <CardContent>
            {stats && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Freelancers</span>
                  </div>
                  <div className="text-sm font-medium">
                    {stats.total_freelances} ({Math.round((stats.total_freelances / metrics.totalUsers) * 100)}%)
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{
                      width: `${(stats.total_freelances / metrics.totalUsers) * 100}%`,
                    }}
                  ></div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Entreprises</span>
                  </div>
                  <div className="text-sm font-medium">
                    {stats.total_entreprises} ({Math.round((stats.total_entreprises / metrics.totalUsers) * 100)}%)
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{
                      width: `${(stats.total_entreprises / metrics.totalUsers) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activité de la Plateforme</CardTitle>
            <CardDescription>Métriques d'engagement et d'activité</CardDescription>
          </CardHeader>
          <CardContent>
            {stats && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Jobs publiés</span>
                  <span className="text-sm font-medium">{stats.total_jobs}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Candidatures reçues</span>
                  <span className="text-sm font-medium">{stats.total_candidatures}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Invitations envoyées</span>
                  <span className="text-sm font-medium">{stats.total_invitations}</span>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total interactions</span>
                    <span className="text-sm font-bold">
                      {stats.total_candidatures + stats.total_invitations + stats.total_jobs}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Insights et recommandations */}
      <Card>
        <CardHeader>
          <CardTitle>Insights et Recommandations</CardTitle>
          <CardDescription>Analyse automatique de vos données</CardDescription>
        </CardHeader>
        <CardContent>
          {stats && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-medium text-green-600">Points forts</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  {stats.total_candidatures > stats.total_jobs && (
                    <li>• Forte demande : {metrics.candidaturesPerJob} candidatures par job en moyenne</li>
                  )}
                  {metrics.totalUsers > 20 && <li>• Base d'utilisateurs solide avec {metrics.totalUsers} inscrits</li>}
                  {stats.total_invitations > 0 && (
                    <li>• Engagement actif des entreprises avec {stats.total_invitations} invitations</li>
                  )}
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-orange-600">Opportunités d'amélioration</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  {stats.total_jobs < stats.total_entreprises && (
                    <li>• Encourager plus d'entreprises à publier des offres</li>
                  )}
                  {Number.parseFloat(metrics.candidaturesPerJob) < 2 && (
                    <li>• Améliorer la visibilité des offres d'emploi</li>
                  )}
                  {Number.parseFloat(metrics.invitationsPerCompany) < 1 && (
                    <li>• Inciter les entreprises à être plus proactives</li>
                  )}
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
 