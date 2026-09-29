"use client"

import { useEffect } from "react"
import { progressStore } from "@/lib/progress/store"

/**
 * Points the progress store at the signed-in account, or at this device for
 * guests. The id comes from the server render, so signing out (a server
 * action) switches the store back to guest on the next layout render.
 */
export function ProgressAccount({ userId }: { userId: string | null }) {
  useEffect(() => {
    progressStore().setAccount(userId)
  }, [userId])
  return null
}
