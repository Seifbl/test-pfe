"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Search,
  Filter,
  MoreHorizontal,
  Mail,
  Phone,
  MapPin,
  Building2,
  Globe,
  Users,
  Shield,
  ShieldCheck,
  UserCheck,
  UserX,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { companiesApi, type Company } from "@/lib/api"

interface TransformedCompany {
  id: string
  name: string
  email: string
  phone: string
  location: string
  organizationSize: string
  status: "active" | "inactive" | "pending"
  joinDate: string
  avatar?: string
  industry?: string
  website?: string
  acceptTerms: boolean
  acceptMarketing: boolean
  isActive: boolean
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<TransformedCompany[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      setLoading(true)
      setError("")

      const response = await companiesApi.getAll()

      // Transformer les données pour l'affichage
      const transformedCompanies = response.entreprises.map((company: Company) => ({
        id: company.id.toString(),
        name: `${company.first_name} ${company.surname}`,
        email: company.email,
        phone: company.phone_number || "",
        location: [company.city, company.country].filter(Boolean).join(", ") || "",
        organizationSize: company.organization_size || "",
        status: company.is_active ? "active" : ("inactive" as const),
        joinDate: company.created_at,
        avatar: "", // Pas dans l'API actuelle
        industry: company.industry || "",
        website: company.website || "",
        acceptTerms: company.accept_terms,
        acceptMarketing: company.accept_marketing,
        isActive: company.is_active,
      }))

      setCompanies(transformedCompanies)
    } catch (error: any) {
      console.error("Erreur lors du chargement des entreprises:", error)
      setError(error.message || "Erreur lors du chargement des entreprises")
    } finally {
      setLoading(false)
    }
  }

  const filteredCompanies = companies.filter(
    (company) =>
      company.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.industry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.organizationSize?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusBadge = (status: string, isActive: boolean) => {
    if (!isActive) {
      return (
        <Badge variant="destructive" className="bg-red-600">
          <UserX className="mr-1 h-3 w-3" />
          Inactive/Bannie
        </Badge>
      )
    }

    switch (status) {
      case "active":
        return (
          <Badge variant="default" className="bg-green-500">
            <UserCheck className="mr-1 h-3 w-3" />
            Active
          </Badge>
        )
      case "inactive":
        return (
          <Badge variant="secondary">
            <UserX className="mr-1 h-3 w-3" />
            Inactive
          </Badge>
        )
      case "pending":
        return <Badge variant="outline">En attente</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getOrganizationSizeBadge = (size: string) => {
    const colors = {
      "1-10 employés": "bg-blue-100 text-blue-800",
      "11-50 employés": "bg-green-100 text-green-800",
      "51-200 employés": "bg-yellow-100 text-yellow-800",
      "200+ employés": "bg-purple-100 text-purple-800",
    }

    return (
      <Badge variant="outline" className={colors[size as keyof typeof colors] || ""}>
        <Users className="mr-1 h-3 w-3" />
        {size}
      </Badge>
    )
  }

  const handleToggleStatus = async (id: string) => {
    try {
      await companiesApi.toggleStatus(id)
      // Recharger la liste
      fetchCompanies()
    } catch (error: any) {
      console.error("Erreur lors du changement de statut:", error)
      setError(`Erreur lors du changement de statut: ${error.message}`)
    }
  }

  const handleBanCompany = async (id: string, name: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir bannir l'entreprise ${name} ? Cette action peut être annulée plus tard.`)) {
      return
    }

    try {
      await companiesApi.ban(id)
      // Recharger la liste
      fetchCompanies()
    } catch (error: any) {
      console.error("Erreur lors du bannissement:", error)
      setError(`Erreur lors du bannissement: ${error.message}`)
    }
  }

  const handleUnbanCompany = async (id: string, name: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir débannir l'entreprise ${name} ?`)) {
      return
    }

    try {
      await companiesApi.unban(id)
      // Recharger la liste
      fetchCompanies()
    } catch (error: any) {
      console.error("Erreur lors du débannissement:", error)
      setError(`Erreur lors du débannissement: ${error.message}`)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Entreprises</h1>
          <p className="text-muted-foreground">Chargement...</p>
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
          <h1 className="text-3xl font-bold tracking-tight">Entreprises</h1>
          <p className="text-muted-foreground">Gérez toutes les entreprises de votre plateforme</p>
        </div>
        <Button>
          <Building2 className="mr-2 h-4 w-4" />
          Ajouter une entreprise
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher des entreprises..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          Filtres
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Entreprises ({filteredCompanies.length})</CardTitle>
          <CardDescription>Toutes les entreprises inscrites sur votre plateforme</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredCompanies.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Aucune entreprise trouvée</h3>
              <p className="mt-2 text-muted-foreground">
                {searchTerm ? "Aucun résultat pour votre recherche" : "Aucune entreprise inscrite"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Entreprise</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Taille</TableHead>
                  <TableHead>Industrie</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date d'inscription</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompanies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={company.avatar || "/placeholder.svg"} />
                          <AvatarFallback>
                            <Building2 className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{company.name || "Nom non disponible"}</div>
                          {company.website && (
                            <div className="text-sm text-muted-foreground flex items-center">
                              <Globe className="mr-1 h-3 w-3" />
                              {company.website}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Mail className="mr-1 h-3 w-3" />
                          {company.email}
                        </div>
                        {company.phone && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Phone className="mr-1 h-3 w-3" />
                            {company.phone}
                          </div>
                        )}
                        {company.location && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="mr-1 h-3 w-3" />
                            {company.location}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {company.organizationSize && getOrganizationSizeBadge(company.organizationSize)}
                    </TableCell>
                    <TableCell>
                      {company.industry ? (
                        <Badge variant="outline">{company.industry}</Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">Non spécifié</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(company.status, company.isActive)}</TableCell>
                    <TableCell>{new Date(company.joinDate).toLocaleDateString("fr-FR")}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Ouvrir le menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>Voir le profil</DropdownMenuItem>
                          <DropdownMenuItem>Modifier</DropdownMenuItem>
                          <DropdownMenuSeparator />

                          {/* Actions de statut */}
                          <DropdownMenuItem onClick={() => handleToggleStatus(company.id)}>
                            {company.status === "active" ? "Suspendre" : "Activer"}
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          {/* Actions de bannissement */}
                          {!company.isActive ? (
                            <DropdownMenuItem
                              className="text-green-600"
                              onClick={() => handleUnbanCompany(company.id, company.name)}
                            >
                              <ShieldCheck className="mr-2 h-4 w-4" />
                              Débannir
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleBanCompany(company.id, company.name)}
                            >
                              <Shield className="mr-2 h-4 w-4" />
                              Bannir
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">Supprimer</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
