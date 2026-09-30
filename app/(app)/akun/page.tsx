import { redirect } from "next/navigation"

// The account page grew into Settings. Old links still land in the right tab.
export default function AccountPage() {
  redirect("/pengaturan#profil")
}
