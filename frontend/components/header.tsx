"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/context/AuthContext"
import { BellIcon, LogOutIcon, SettingsIcon, UserIcon, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import { routes } from "@/constants/routes"

interface HeaderProps {
  user: any
}

export default function Header({ user }: HeaderProps) {
  const { logout } = useAuth()
  const [notifications, setNotifications] = useState<any[]>([])
  const [socket, setSocket] = useState<any>(null)

  // Fallback values if user data is not available
  const displayName = user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : "User"
  const email = user?.email || "user@example.com"
  const initials = user?.firstName ? user.firstName[0] + (user.lastName?.[0] || "") : "U"

  useEffect(() => {
    // Fonction pour charger les notifications existantes
    const loadNotifications = async () => {
      try {
        // Ici, vous devriez appeler votre API pour récupérer les notifications existantes
        // Exemple: const response = await fetch('/api/notifications');
        // const data = await response.json();
        // setNotifications(data);

        // Pour l'exemple, nous utilisons des données fictives
        setNotifications([
          {
            id: 1,
            type: "invitation_accepted",
            title: "Invitation acceptée",
            message: "John Doe a accepté votre invitation pour le poste de Développeur Frontend",
            createdAt: new Date().toISOString(),
          },
          {
            id: 2,
            type: "invitation_refused",
            title: "Invitation refusée",
            message: "Jane Smith a refusé votre invitation pour le poste de Designer UX/UI",
            createdAt: new Date(Date.now() - 86400000).toISOString(), // Hier
          },
        ])
      } catch (error) {
        console.error("Erreur lors du chargement des notifications:", error)
      }
    }

    // Charger les notifications existantes
    loadNotifications()

    // Configurer la connexion WebSocket
    if (user?.id) {
      // Ici, vous devriez initialiser votre connexion WebSocket
      // Exemple avec Socket.io:
      // const newSocket = io('https://votre-serveur.com');
      // setSocket(newSocket);
      // Écouter les événements de notification
      // newSocket.on('notification', (notification) => {
      //   setNotifications(prev => [notification, ...prev]);
      // });
      // Fonction de nettoyage
      // return () => {
      //   newSocket.disconnect();
      // };
    }
  }, [user?.id])

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold">Talent Platform</span>
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <BellIcon className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                {notifications.length || 0}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80" align="end">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">Aucune notification</div>
            ) : (
              notifications.map((notification) => (
                <DropdownMenuItem key={notification.id} className="flex flex-col items-start p-3">
                  <div className="flex w-full items-center gap-2">
                    {notification.type === "invitation_accepted" ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : notification.type === "invitation_refused" ? (
                      <XCircle className="h-4 w-4 text-red-500" />
                    ) : (
                      <BellIcon className="h-4 w-4" />
                    )}
                    <span className="font-medium">{notification.title}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{notification.message}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar || ""} alt={displayName} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{displayName}</p>
                <p className="text-xs leading-none text-muted-foreground">{email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={user?.userType === "company" ? routes.company.profile : routes.talent.profile}>
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={user?.userType === "company" ? routes.company.settings : routes.talent.settings}>
                <SettingsIcon className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOutIcon className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
