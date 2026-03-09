'use server'
import { prisma } from '@/lib/prisma'
import { TickDetails } from "@/prisma/generated/prisma"

export async function getTickDetails(): Promise<TickDetails[]> {
  const tickDetails = await prisma.tickDetails.findMany()
  return tickDetails
}
