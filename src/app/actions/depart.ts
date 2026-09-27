"use server"

import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { revalidatePath } from "next/cache"

type DepartInput = {
  clientId: string,
  username: string,
  observation?: string,
  lignes: { produitId: string, quantite: number }[]
}

export async function validerCabine({ clientId, username, observation, lignes }: DepartInput) {
  const session = await getSession()
  if (!session) return { error: "Non autorisé" }

  if (!lignes || lignes.length === 0) return { error: "Panier vide" }
  if (!clientId) return { error: "Client manquant" }

  try {
    // Exécuter en transaction pour éviter les erreurs partielles
    await prisma.$transaction(async (tx: any) => {
      for (const ligne of lignes) {
        
        const produit = await tx.produit.findUnique({ where: { id: ligne.produitId } })
        if (!produit) throw new Error("Produit introuvable")

        // Créer le mouvement
        await tx.mouvement.create({
          data: {
            produitId: ligne.produitId,
            type: 'Depart',
            quantite: ligne.quantite,
            clientId: clientId,
            utilisateur: username, // Le nom du Chef d'équipe !
            observation: observation || null
          }
        })
      }
    })

    revalidatePath("/cabine")
    revalidatePath("/catalogue")
    revalidatePath(`/clients/${clientId}`)
    
    return { success: true }
  } catch (error: any) {
    console.error("Erreur cabine:", error)
    return { error: error.message || "Erreur lors de l'enregistrement." }
  }
}
