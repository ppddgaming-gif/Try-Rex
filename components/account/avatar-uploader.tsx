"use client"

import { useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Camera, LoaderCircle, Trash2 } from "lucide-react"
import { Avatar } from "@/components/avatar"
import { setAvatar } from "@/lib/profile-actions"
import { createClient } from "@/lib/supabase/client"

const SIZE = 256
const MAX_INPUT = 10 * 1024 * 1024

/**
 * Center-crops to a square and scales to 256px WebP in the browser, so a
 * 10 MB phone photo uploads as ~20 KB and the bucket's 1 MB cap is never hit.
 */
async function toAvatarBlob(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const side = Math.min(bitmap.width, bitmap.height)
  const canvas = document.createElement("canvas")
  canvas.width = SIZE
  canvas.height = SIZE
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("canvas")
  ctx.imageSmoothingQuality = "high"
  ctx.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, SIZE, SIZE)
  bitmap.close()
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.86))
  if (!blob) throw new Error("encode")
  return blob
}

export function AvatarUploader({
  userId,
  name,
  src,
  disabled = false,
}: {
  userId: string
  name: string
  src: string | null
  /** True when the server can't store avatars yet. */
  disabled?: boolean
}) {
  const input = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [, startTransition] = useTransition()
  const shown = preview ?? src

  async function upload(file: File) {
    setError(null)
    if (!file.type.startsWith("image/")) return setError("Pilih file gambar (JPG, PNG, atau WebP).")
    if (file.size > MAX_INPUT) return setError("Ukuran foto maksimal 10 MB.")

    setBusy(true)
    try {
      const blob = await toAvatarBlob(file)
      setPreview(URL.createObjectURL(blob))
      const path = `${userId}/avatar-${Date.now()}.webp`
      const supabase = createClient()
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, blob, { contentType: "image/webp", cacheControl: "31536000" })
      if (uploadError) throw uploadError
      const result = await setAvatar(path)
      if (result.error) throw new Error(result.error)
      startTransition(() => router.refresh())
    } catch (e) {
      setPreview(null)
      setError(e instanceof Error && e.message.length < 80 ? e.message : "Gagal mengunggah foto. Coba lagi.")
    } finally {
      setBusy(false)
    }
  }

  async function remove() {
    setError(null)
    setBusy(true)
    const result = await setAvatar(null)
    setBusy(false)
    if (result.error) return setError(result.error)
    setPreview(null)
    startTransition(() => router.refresh())
  }

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
      <button
        type="button"
        onClick={() => input.current?.click()}
        disabled={disabled || busy}
        aria-label="Ganti foto profil"
        className="group relative rounded-full transition-transform duration-300 ease-out-expo enabled:hover:scale-[1.03] disabled:cursor-not-allowed"
      >
        <Avatar src={shown} name={name} size={96} />
        <span className="glass absolute inset-0 flex items-center justify-center rounded-full opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
          {busy ? <LoaderCircle className="h-6 w-6 animate-spin" /> : <Camera className="h-6 w-6" />}
        </span>
      </button>

      <div className="flex flex-col items-center gap-2 sm:items-start">
        <div className="flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => input.current?.click()}
            disabled={disabled || busy}
            className="btn btn-sm"
          >
            <Camera className="h-4 w-4" /> {src ? "Ganti foto" : "Unggah foto"}
          </button>
          {src && (
            <button type="button" onClick={remove} disabled={disabled || busy} className="btn btn-ghost btn-sm">
              <Trash2 className="h-4 w-4" /> Hapus
            </button>
          )}
        </div>
        <p className="text-xs text-faint">JPG, PNG, atau WebP. Dipotong jadi persegi otomatis.</p>
        {error && (
          <p role="alert" className="text-xs text-danger">
            {error}
          </p>
        )}
      </div>

      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => {
          const file = e.target.files?.[0]
          e.target.value = ""
          if (file) upload(file)
        }}
      />
    </div>
  )
}
