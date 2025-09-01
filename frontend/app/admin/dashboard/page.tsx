"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { adminService } from "@/services/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Briefcase, TrendingUp, Settings, Eye } from "lucide-react"
import { useRouter } from "next/navigation"
import { routes } from "@/constants/routes"

interface DashboardStats {
  totalUsers: number
  totalJobs: number
  totalFreelancers: number
  totalCompanies: number
  activeJobs: number
  completedJobs: number
}

export default function AdminDashboard() {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalJobs: 0,
    totalFreelancers: 0,
    totalCompanies: 0,
    activeJobs: 0,
    completedJobs: 0,
  })
  const [dashboardLoading, setDashboardLoading] = useState(true)

  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.userType !== "admin")) {
      router.push(routes.admin.login)
      return
    }

    if (isAuthenticated && user?.userType === "admin") {
      loadDashboardData()
    }
  }, [isAuthenticated, user, loading, router])

  const loadDashboardData = async () => {
    try {
      setDashboardLoading(true)
      const response = await adminService.getDashboard()

      if (response.data) {
        setStats(response.data)
      } else {
        // Données de démonstration si l'API ne répond pas
        setStats({
          totalUsers: 156,
          totalJobs: 89,
          totalFreelancers: 124,
          totalCompanies: 32,
          activeJobs: 45,
          completedJobs: 44,
        })
      }
    } catch (error) {
      console.error("Erreur lors du chargement du dashboard:", error)
      // Utiliser des données de démonstration en cas d'erreur
      setStats({
        totalUsers: 156,
        totalJobs: 89,
        totalFreelancers: 124,
        totalCompanies: 32,
        activeJobs: 45,
        completedJobs: 44,
      })
    } finally {
      setDashboardLoading(false)
    }
  }

  if (loading || dashboardLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated || user?.userType !== "admin") {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Administration</h1>
        <p className="text-gray-600">
          Bienvenue, {user.firstName} {user.lastName}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Utilisateurs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalFreelancers} freelancers, {stats.totalCompanies} entreprises
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalJobs}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeJobs} actifs, {stats.completedJobs} terminés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Freelancers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFreelancers}</div>
            <p className="text-xs text-muted-foreground">Talents inscrits sur la plateforme</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entreprises</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCompanies}</div>
            <p className="text-xs text-muted-foreground">Clients actifs</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Actions Rapides</CardTitle>
            <CardDescription>Gérez rapidement les éléments de la plateforme</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              className="w-full justify-start bg-transparent"
              variant="outline"
              onClick={() => router.push(routes.admin.users)}
            >
              <Users className="mr-2 h-4 w-4" />
              Gérer les utilisateurs
            </Button>
            <Button
              className="w-full justify-start bg-transparent"
              variant="outline"
              onClick={() => router.push(routes.admin.jobs)}
            >
              <Briefcase className="mr-2 h-4 w-4" />
              Gérer les jobs
            </Button>
            <Button
              className="w-full justify-start bg-transparent"
              variant="outline"
              onClick={() => router.push(routes.admin.settings)}
            >
              <Settings className="mr-2 h-4 w-4" />
              Paramètres système
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activité Récente</CardTitle>
            <CardDescription>Dernières actions sur la plateforme</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Nouveau freelancer inscrit</p>
                  <p className="text-xs text-muted-foreground">Il y a 2 heures</p>
                </div>
                <Badge variant="secondary">Nouveau</Badge>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Job publié par TechCorp</p>
                  <p className="text-xs text-muted-foreground">Il y a 4 heures</p>
                </div>
                <Badge variant="outline">Job</Badge>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Projet terminé</p>
                  <p className="text-xs text-muted-foreground">Il y a 6 heures</p>
                </div>
                <Badge variant="default">Terminé</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Derniers Utilisateurs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Jean Dupont", type: "Freelancer", status: "Actif" },
                { name: "Marie Martin", type: "Freelancer", status: "Actif" },
                { name: "TechStart SAS", type: "Entreprise", status: "Actif" },
              ].map((user, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.type}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={user.status === "Actif" ? "default" : "secondary"}>{user.status}</Badge>
                    <Button size="sm" variant="ghost">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Derniers Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { title: "Développeur React", company: "TechCorp", status: "Actif" },
                { title: "Designer UI/UX", company: "CreativeAgency", status: "En cours" },
                { title: "Développeur Backend", company: "StartupXYZ", status: "Terminé" },
              ].map((job, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{job.title}</p>
                    <p className="text-sm text-muted-foreground">{job.company}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={job.status === "Actif" ? "default" : job.status === "En cours" ? "secondary" : "outline"}
                    >
                      {job.status}
                    </Badge>
                    <Button size="sm" variant="ghost">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
