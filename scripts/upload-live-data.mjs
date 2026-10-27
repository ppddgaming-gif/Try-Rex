// Uploads the output of build-live-data.mjs to the private Supabase Storage
// bucket `live-data` (created by migration _trading_pairs). Plain Node 18+.
//
//   SUPABASE_URL=https://<project>.supabase.co SUPABASE_SERVICE_ROLE_KEY=... \
//     node scripts/upload-live-data.mjs live-data-out
//
// The service-role key stays in your terminal; nothing is written to disk.
// Re-running overwrites (upsert).

import { readdirSync, readFileSync, statSync } from "node:fs"
import { join, relative } from "node:path"

const dir = process.argv[2] ?? "live-data-out"
const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error("Set SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY first.")
  process.exit(1)
}

const files = []
const walk = (d) => {
  for (const name of readdirSync(d)) {
    const p = join(d, name)
    if (statSync(p).isDirectory()) walk(p)
    else files.push(p)
  }
}
walk(dir)

let done = 0
for (const file of files) {
  const path = relative(dir, file).split("\\").join("/")
  const type = path.endsWith(".gz") ? "application/gzip" : "application/json"
  const res = await fetch(`${url}/storage/v1/object/live-data/${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, apikey: key, "Content-Type": type, "x-upsert": "true" },
    body: readFileSync(file),
  })
  if (!res.ok) {
    console.error(`FAILED ${path}: ${res.status} ${await res.text()}`)
    process.exit(1)
  }
  done++
  if (done % 25 === 0 || done === files.length) console.log(`${done}/${files.length}`)
}
console.log("Uploaded to bucket live-data.")
