"use server"

import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { revalidatePath } from "next/cache"

type RetourInput = {
  clientId: string
  username: string
  lignes: { produitId: string; quantite: number }[]
  observation?: string
}

export async function validerRetourClient(data: RetourInput) {
  try {
    const session = await getSession()
    if (!session) throw new Error("Non autorisé")

    const { clientId, username, lignes, observation } = data

    await prisma.$transaction(async (tx) => {
      for (const ligne of lignes) {
        if (ligne.quantite <= 0) continue

        const produit = await tx.produit.findUnique({ where: { id: ligne.produitId } })
        if (!produit) throw new Error("Produit introuvable")

        // Créer le mouvement de type "Retour"
        await tx.mouvement.create({
          data: {
            type: "Retour",
            quantite: ligne.quantite,
            produitId: ligne.produitId,
            clientId: clientId,
            utilisateur: username,
            observation: observation || null,
          }
        })
      }
    })

    revalidatePath("/clients")
    revalidatePath("/mouvements")
    revalidatePath("/cabine")
    
    return { success: true }
  } catch (error: any) {
    console.error("Erreur retour client:", error)
    return { success: false, error: error.message }
  }
}
