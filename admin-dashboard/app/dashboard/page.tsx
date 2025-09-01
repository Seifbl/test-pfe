"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Building2, TrendingUp, Briefcase } from "lucide-react"
import { statsApi, type StatsResponse } from "@/lib/api"

export default function DashboardPage() {
  const [stats, setStats] = useState<StatsResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await statsApi.getAll()
      setStats(response)
    } catch (error) {
      console.error("Erreur lors du chargement des statistiques:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Vue d'ensemble de votre plateforme</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Freelancers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats?.total_freelances || 0}</div>
            <p className="text-xs text-muted-foreground">Freelancers inscrits</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entreprises</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats?.total_entreprises || 0}</div>
            <p className="text-xs text-muted-foreground">Entreprises inscrites</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats?.total_jobs || 0}</div>
            <p className="text-xs text-muted-foreground">Offres publiées</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Candidatures</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats?.total_candidatures || 0}</div>
            <p className="text-xs text-muted-foreground">Candidatures soumises</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Activité Récente</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">Plateforme active</p>
                  <p className="text-sm text-muted-foreground">
                    {stats ? stats.total_freelances + stats.total_entreprises : 0} utilisateurs au total
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">Jobs disponibles</p>
                  <p className="text-sm text-muted-foreground">{stats?.total_jobs || 0} offres d'emploi publiées</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">Engagement élevé</p>
                  <p className="text-sm text-muted-foreground">
                    {stats?.total_candidatures || 0} candidatures et {stats?.total_invitations || 0} invitations
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Statistiques Rapides</CardTitle>
            <CardDescription>Aperçu des performances de la plateforme</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Candidatures par job</span>
                <span className="text-sm font-medium">
                  {stats && stats.total_jobs > 0 ? (stats.total_candidatures / stats.total_jobs).toFixed(1) : "0"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Invitations envoyées</span>
                <span className="text-sm font-medium">{stats?.total_invitations || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Total utilisateurs</span>
                <span className="text-sm font-medium">
                  {stats ? stats.total_freelances + stats.total_entreprises : 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
