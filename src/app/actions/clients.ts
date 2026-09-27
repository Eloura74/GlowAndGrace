"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { calculerResteSurClient } from "@/lib/stockUtils"

export async function getClients() {
  return prisma.client.findMany({
    orderBy: { createdAt: 'desc' }
  })
}

export async function createClient(formData: FormData) {
  const nom = formData.get("nom") as string
  const telephone = formData.get("telephone") as string || null
  const email = formData.get("email") as string || null
  const typePeau = formData.get("typePeau") as string || null
  const allergies = formData.get("allergies") as string || null
  const notes = formData.get("notes") as string || null

  await prisma.client.create({
    data: {
      nom,
      telephone,
      email,
      typePeau,
      allergies,
      notes,
      statut: "Actif"
    }
  })

  revalidatePath("/clients")
}

export async function deleteClient(id: string) {
  await prisma.client.delete({
    where: { id }
  })
  revalidatePath("/clients")
}

export async function updateClient(formData: FormData) {
  const id = formData.get("id") as string
  const nom = formData.get("nom") as string
  const statut = formData.get("statut") as string

  if (id) {
    await prisma.client.update({
      where: { id },
      data: {
        nom,
        statut
      }
    })
    revalidatePath("/clients")
    revalidatePath(`/clients/${id}`)
  }
}

export async function cloturerClient(id: string) {
  // 1. Fetch client with its movements
  const client = await prisma.client.findUnique({
    where: { id },
    include: { mouvements: true }
  })

  if (!client) return

  // 2. Compute remaining stock on site
  const restes = calculerResteSurClient(client.mouvements)

  // 3. Create auto-returns for remaining items
  const mouvementsARetourner = Object.entries(restes)
    .filter(([produitId, qty]) => qty > 0)
    .map(([produitId, qty]) => ({
      produitId,
      clientId: id,
      type: "Retour",
      quantite: qty,
      utilisateur: "Système",
      observation: "Retour automatique suite à la clôture du client"
    }))

  if (mouvementsARetourner.length > 0) {
    await prisma.mouvement.createMany({
      data: mouvementsARetourner
    })
  }

  // 4. Also return all Equipements assigned to this client
  await prisma.equipement.updateMany({
    where: { clientId: id },
    data: { 
      statut: "Disponible",
      clientId: null,
      utilisateur: null
    }
  })

  // 5. Update status
  await prisma.client.update({
    where: { id },
    data: { statut: "Terminé" }
  })

  revalidatePath("/clients")
  revalidatePath(`/clients/${id}`)
  revalidatePath("/catalogue")
  revalidatePath("/equipement")
}
