import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

/** Routes that need an account. Guests are sent to /login?next=… */
const PROTECTED = ["/dashboard"]
/** Auth screens a signed-in user has no reason to see. */
const GUEST_ONLY = ["/login", "/signup"]

const matches = (path: string, list: string[]) => list.some((p) => path === p || path.startsWith(p + "/"))

/**
 * Runs from the root proxy.ts on every page request. Refreshes the Supabase
 * session cookie and applies the route rules above. /trading-game,
 * /ai-evaluation and /start are deliberately open to guests.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  // Create a new client per request; never keep it in a module global.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  // Nothing may run between createServerClient and getClaims(), or users get
  // logged out at random. getClaims() is what refreshes the session.
  const { data } = await supabase.auth.getClaims()
  const signedIn = Boolean(data?.claims)
  const { pathname, search } = request.nextUrl

  if (!signedIn && matches(pathname, PROTECTED)) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    url.search = `?next=${encodeURIComponent(pathname + search)}`
    return redirectKeepingCookies(url, supabaseResponse)
  }

  if (signedIn && matches(pathname, GUEST_ONLY)) {
    const url = request.nextUrl.clone()
    url.pathname = "/dashboard"
    url.search = ""
    return redirectKeepingCookies(url, supabaseResponse)
  }

  // Return this exact response object: it carries the refreshed cookies.
  return supabaseResponse
}

/** A redirect must carry the refreshed session cookies too, or it drops them. */
function redirectKeepingCookies(url: URL, from: NextResponse) {
  const res = NextResponse.redirect(url)
  from.cookies.getAll().forEach((c) => res.cookies.set(c))
  return res
}
