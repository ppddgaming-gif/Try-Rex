import "server-only"
import { LEVEL_1, LEVEL_2, LEVEL_3 } from "@/lib/learn/exam/bank-1-3"
import { LEVEL_4, LEVEL_5, LEVEL_6 } from "@/lib/learn/exam/bank-4-6"
import type { Bank } from "@/lib/learn/exam/engine"

// The answer key of every level exam. Server only: imported by the exam
// route and nothing that reaches the browser.

export const BANK: Bank = { 1: LEVEL_1, 2: LEVEL_2, 3: LEVEL_3, 4: LEVEL_4, 5: LEVEL_5, 6: LEVEL_6 }
