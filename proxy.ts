import type { NextRequest } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"

// Next 16's name for middleware. Keeps the Supabase session fresh and guards
// /dashboard; the rules live in lib/supabase/middleware.ts.
export function proxy(request: NextRequest) {
  return updateSession(request)
}

export const config = {
  // Skip static assets and image optimisation so redirects never block them.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
}
