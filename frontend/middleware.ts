import { type NextRequest, NextResponse } from "next/server"

// Completely disable middleware for now to prevent redirection loops
export function middleware(request: NextRequest) {
  // Just pass through all requests without any redirects
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}
