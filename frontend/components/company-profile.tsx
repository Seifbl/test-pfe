"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Camera, AlertCircle, CheckCircle } from "lucide-react"

import { companyService } from "@/services/api"
import { Alert, AlertDescription } from "@/components/ui/alert"
// Remove the direct CompanySidebar import and usage since it's now part of the layout
interface CompanyProfileData {
  firstName: string
  surname: string
  organizationName: string
  phoneNumber: string
  phonePrefix: string
  organizationSize: string
  businessEmail: string
  industry: string
  password: string
  website: string
  country: string
  city: string
  zipCode: string
}

export default function CompanyProfilePage() {
  const { user, updateUser } = useAuth()
  const currentTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
  const currentDate = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  const [profileData, setProfileData] = useState<CompanyProfileData>({
    firstName: user?.firstName || "",
    surname: user?.lastName || "",
    organizationName: "",
    phoneNumber: user?.phoneNumber || "",
    phonePrefix: "+33",
    organizationSize: user?.organizationSize || "",
    businessEmail: user?.email || "",
    industry: "",
    password: "********",
    website: "",
    country: "",
    city: "",
    zipCode: "",
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Charger les données du profil au chargement du composant
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await companyService.getCompanyProfile()
        const data = response.data

        setProfileData({
          firstName: data.first_name || user?.firstName || "",
          surname: data.surname || user?.lastName || "",
          organizationName: data.organization_name || "",
          phoneNumber: data.phone_number || "",
          phonePrefix: "+33",
          organizationSize: data.organization_size || "",
          businessEmail: data.email || user?.email || "",
          industry: data.industry || "",
          password: "********",
          website: data.website || "",
          country: data.country || "",
          city: data.city || "",
          zipCode: data.zip_code || "",
        })
      } catch (err) {
        console.error("Erreur lors du chargement du profil:", err)
      }
    }

    fetchProfileData()
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Préparer les données à envoyer à l'API
      const apiData = {
        first_name: profileData.firstName,
        surname: profileData.surname,
        organization_size: profileData.organizationSize,
        phone_number: profileData.phoneNumber,
        industry: profileData.industry,
        website: profileData.website,
        country: profileData.country,
        city: profileData.city,
        zip_code: profileData.zipCode,
      }

      // Envoyer la requête à l'API
      await companyService.updateCompanyProfile(apiData)

      // Mettre à jour les données de l'utilisateur dans le contexte
      updateUser({
        firstName: profileData.firstName,
        lastName: profileData.surname,
        email: profileData.businessEmail,
        organizationSize: profileData.organizationSize,
        phoneNumber: profileData.phoneNumber,
      })

      setSuccess("Profil mis à jour avec succès")

      // Masquer le message de succès après 3 secondes
      setTimeout(() => {
        setSuccess(null)
      }, 3000)
    } catch (err: any) {
      console.error("Erreur lors de la mise à jour du profil:", err)
      setError(err.response?.data?.message || "Une erreur est survenue lors de la mise à jour du profil")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#F8F9FE]">
      <main className="p-8">
        <div className="bg-white rounded-lg p-8">
          <div className="flex items-start gap-8 mb-8">
            {/* Profile Image */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-2 border-gray-200 flex items-center justify-center bg-gray-100">
                <span className="text-4xl text-gray-300">{profileData.firstName?.[0] || ""}</span>
              </div>
              <div className="absolute bottom-0 right-0 bg-gray-800 rounded-full p-1 cursor-pointer">
                <Camera className="h-4 w-4 text-white" />
              </div>
            </div>

            {/* Profile Info */}
            <div>
              <h2 className="text-xl font-semibold">
                {profileData.firstName} {profileData.surname}
              </h2>
              <p className="text-gray-600">Your account is ready, you can now apply for advice.</p>
            </div>

            <div className="ml-auto text-sm text-gray-400">Last update: {new Date().toLocaleDateString()}</div>
          </div>

          <h3 className="text-xl font-semibold mb-6">Edit Profile</h3>

          {error && (
            <Alert className="mb-6 bg-red-50 border border-red-200 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6 bg-green-50 border border-green-200 text-green-700">
              <CheckCircle className="h-5 w-5" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-x-8 gap-y-6">
              {/* First Name */}
              <div>
                <Label htmlFor="firstName" className="text-sm font-medium text-gray-600 mb-1 block">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={profileData.firstName}
                  onChange={handleChange}
                  className="bg-gray-100"
                  required
                />
              </div>

              {/* Surname */}
              <div>
                <Label htmlFor="surname" className="text-sm font-medium text-gray-600 mb-1 block">
                  Surname
                </Label>
                <Input
                  id="surname"
                  name="surname"
                  value={profileData.surname}
                  onChange={handleChange}
                  className="bg-gray-100"
                  required
                />
              </div>

              {/* Organization Name */}
              <div>
                <Label htmlFor="organizationName" className="text-sm font-medium text-gray-600 mb-1 block">
                  Organization Name
                </Label>
                <Input
                  id="organizationName"
                  name="organizationName"
                  value={profileData.organizationName}
                  onChange={handleChange}
                  placeholder="Enter Value"
                  className="bg-gray-100"
                />
              </div>

              {/* Organization Size */}
              <div>
                <Label htmlFor="organizationSize" className="text-sm font-medium text-gray-600 mb-1 block">
                  Organization Size
                </Label>
                <Input
                  id="organizationSize"
                  name="organizationSize"
                  value={profileData.organizationSize}
                  onChange={handleChange}
                  placeholder="Enter Value"
                  className="bg-gray-100"
                  required
                />
              </div>

              {/* Phone Number */}
              <div>
                <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-600 mb-1 block">
                  Phone Number
                </Label>
                <div className="flex">
                  <Input
                    id="phonePrefix"
                    name="phonePrefix"
                    value={profileData.phonePrefix}
                    onChange={handleChange}
                    className="w-16 rounded-r-none bg-gray-100"
                  />
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    value={profileData.phoneNumber}
                    onChange={handleChange}
                    placeholder="Enter Value"
                    className="flex-1 rounded-l-none bg-gray-100"
                    required
                  />
                </div>
              </div>

              {/* Industry */}
              <div>
                <Label htmlFor="industry" className="text-sm font-medium text-gray-600 mb-1 block">
                  Industry
                </Label>
                <Input
                  id="industry"
                  name="industry"
                  value={profileData.industry}
                  onChange={handleChange}
                  placeholder="Enter Value"
                  className="bg-gray-100"
                />
              </div>

              {/* Business Email */}
              <div className="col-span-2">
                <Label htmlFor="businessEmail" className="text-sm font-medium text-gray-600 mb-1 block">
                  Business Email
                </Label>
                <Input
                  id="businessEmail"
                  name="businessEmail"
                  type="email"
                  value={profileData.businessEmail}
                  onChange={handleChange}
                  placeholder="Enter Value"
                  className="bg-gray-100"
                  required
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">L'email ne peut pas être modifié</p>
              </div>

              {/* Password */}
              <div className="col-span-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-600 mb-1 block">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={profileData.password}
                  onChange={handleChange}
                  className="bg-gray-100"
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">Pour modifier votre mot de passe, utilisez la page dédiée</p>
              </div>

              {/* Website */}
              <div className="col-span-2">
                <Label htmlFor="website" className="text-sm font-medium text-gray-600 mb-1 block">
                  Website
                </Label>
                <Input
                  id="website"
                  name="website"
                  value={profileData.website}
                  onChange={handleChange}
                  placeholder="Enter Value"
                  className="bg-gray-100"
                />
              </div>

              {/* Country, City, Zip Code */}
              <div>
                <Label htmlFor="country" className="text-sm font-medium text-gray-600 mb-1 block">
                  Country
                </Label>
                <Input
                  id="country"
                  name="country"
                  value={profileData.country}
                  onChange={handleChange}
                  placeholder="Enter Value"
                  className="bg-gray-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city" className="text-sm font-medium text-gray-600 mb-1 block">
                    City
                  </Label>
                  <Input
                    id="city"
                    name="city"
                    value={profileData.city}
                    onChange={handleChange}
                    placeholder="Enter Value"
                    className="bg-gray-100"
                  />
                </div>

                <div>
                  <Label htmlFor="zipCode" className="text-sm font-medium text-gray-600 mb-1 block">
                    Zip Code
                  </Label>
                  <Input
                    id="zipCode"
                    name="zipCode"
                    value={profileData.zipCode}
                    onChange={handleChange}
                    placeholder="Enter Value"
                    className="bg-gray-100"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <Button type="submit" className="bg-black hover:bg-gray-800 text-white" disabled={loading}>
                {loading ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
