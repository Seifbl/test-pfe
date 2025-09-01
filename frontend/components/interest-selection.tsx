"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Code2, Paintbrush, BarChart, Rocket, Globe, Briefcase, Users, GraduationCap } from "lucide-react"
import { useRouter } from "next/navigation"

export default function InterestSelectionPage() {
  const router = useRouter()
  const interests = [
    { icon: Code2, title: "Engineering", bgColor: "bg-blue-50" },
    { icon: Paintbrush, title: "Design", bgColor: "bg-purple-50" },
    { icon: BarChart, title: "Product", bgColor: "bg-green-50" },
    { icon: Globe, title: "Web3", bgColor: "bg-orange-50" },
    { icon: Briefcase, title: "Freelancing", bgColor: "bg-pink-50" },
    { icon: Rocket, title: "Career advice", bgColor: "bg-yellow-50" },
    { icon: Users, title: "Mentorship", bgColor: "bg-indigo-50" },
    { icon: GraduationCap, title: "Mentoring", bgColor: "bg-red-50" },
  ]

  const handleContinue = () => {
    router.push("/signup/account")
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="mb-8 text-center">
          <h1 className="mb-6 text-2xl font-semibold">What are you interested in?</h1>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          {interests.map((interest) => (
            <Card
              key={interest.title}
              className={`cursor-pointer p-6 transition-shadow hover:shadow-lg ${interest.bgColor}`}
            >
              <interest.icon className="mb-4 h-6 w-6" />
              <h3 className="text-lg font-medium">{interest.title}</h3>
            </Card>
          ))}
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
          <Button onClick={handleContinue}>Continue</Button>
        </div>
      </div>
    </div>
  )
}
