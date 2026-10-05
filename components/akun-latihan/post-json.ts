/**
 * POSTs JSON to an Akun Latihan route and returns the parsed body. Errors
 * come back as { error } with the server's Indonesian message.
 */
export async function postJson<T = Record<string, unknown>>(url: string, body: unknown): Promise<T & { error?: string }> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    })
    const data = (await res.json().catch(() => ({}))) as T & { error?: string }
    if (!res.ok && !data.error) return { ...data, error: "Terjadi kesalahan. Coba lagi sebentar lagi." }
    return data
  } catch {
    return { error: "Tidak bisa terhubung. Periksa koneksimu." } as T & { error?: string }
  }
}
