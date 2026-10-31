import type { Text } from "@/lib/learn/types"

/** Indonesian first, English second: the handouts are written in Indonesian. */
export const tx = (id: string, en: string): Text => ({ id, en })
