"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getMouvements() {
  return prisma.mouvement.findMany({
    include: {
      produit: true,
      client: true
    },
    orderBy: { date: 'desc' }
  })
}

export async function createMouvement(formData: FormData) {
  const produitId = formData.get("produitId") as string
  const type = formData.get("type") as string
  const quantite = parseInt(formData.get("quantite") as string)
  const clientId = formData.get("clientId") as string || null
  const utilisateur = formData.get("utilisateur") as string || "Anonyme"
  const observation = formData.get("observation") as string || ""

  // Transaction pour créer le mouvement ET mettre à jour le stock
  // Dans une V3 complète, on aurait un StockEmplacement, 
  // mais ici on garde l'approche simple : on ne trace que Mouvement
  
  await prisma.mouvement.create({
    data: {
      produitId,
      type,
      quantite,
      clientId: clientId === "" ? null : clientId,
      utilisateur,
      observation
    }
  })
  revalidatePath("/mouvements")
  revalidatePath("/catalogue")
  revalidatePath("/reassort")
  revalidatePath("/")
}

export async function deleteMouvement(id: string) {
  // Not used anymore directly by the UI to avoid data loss. Kept for admin use.
  await prisma.mouvement.delete({
    where: { id }
  })
  revalidatePath("/mouvements")
  revalidatePath("/catalogue")
  revalidatePath("/reassort")
  revalidatePath("/")
}

export async function annulerMouvement(id: string) {
  const mvt = await prisma.mouvement.findUnique({ where: { id } })
  if (!mvt) return;

  let typeInverse = "";
  if (mvt.type === "Achat" || mvt.type === "Retour" || mvt.type === "Correction_Plus") {
    typeInverse = "Correction_Moins";
  } else {
    typeInverse = "Correction_Plus";
  }

  await prisma.mouvement.create({
    data: {
      type: typeInverse,
      quantite: mvt.quantite,
      produitId: mvt.produitId,
      clientId: mvt.clientId,
      utilisateur: "Système",
      observation: `Annulation du mouvement ${mvt.type} du ${mvt.date.toLocaleDateString("fr-FR")}`
    }
  });

  revalidatePath("/mouvements")
  revalidatePath("/catalogue")
  revalidatePath("/reassort")
  revalidatePath("/")
}

export async function entrerStock(produitId: string, quantite: number) {
  await prisma.mouvement.create({
    data: {
      type: "Achat",
      quantite,
      produitId,
      observation: "Mise à jour rapide du stock",
      utilisateur: "Système"
    }
  })
  revalidatePath("/catalogue")
  revalidatePath("/reassort")
  revalidatePath("/")
}

export async function entrerStockRapide(formData: FormData) {
  const produitId = formData.get("produitId") as string
  const quantite = parseInt(formData.get("quantite") as string || "1")
  
  if (produitId && quantite > 0) {
    await entrerStock(produitId, quantite)
  }
}

export async function corrigerStock(formData: FormData) {
  const produitId = formData.get("produitId") as string
  const ecart = parseInt(formData.get("ecart") as string)
  const observation = formData.get("observation") as string || "Inventaire : Ajustement automatique"
  
  if (produitId && ecart !== 0 && !isNaN(ecart)) {
    await prisma.mouvement.create({
      data: {
        type: "Correction",
        quantite: ecart, // Can be positive or negative
        produitId,
        observation: observation,
        utilisateur: "Système"
      }
    })
    
    revalidatePath("/inventaire")
    revalidatePath("/catalogue")
    revalidatePath("/reassort")
    revalidatePath("/")
  }
}
