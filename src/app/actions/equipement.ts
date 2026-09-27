"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getEquipements() {
  return prisma.equipement.findMany({
    include: {
      client: true,
      mouvements: {
        orderBy: { date: 'desc' },
        take: 5
      }
    },
    orderBy: { nom: 'asc' }
  })
}

export async function createEquipement(formData: FormData) {
  const nom = formData.get("nom") as string
  const marque = formData.get("marque") as string || null
  const reference = (formData.get("reference") as string)?.trim() || null
  const valeur = parseFloat(formData.get("valeur") as string || "0")
  
  await prisma.equipement.create({
    data: {
      nom,
      marque,
      reference,
      valeur,
      statut: "Disponible"
    }
  })

  revalidatePath("/equipement")
  revalidatePath("/")
}

export async function updateEquipement(formData: FormData) {
  const id = formData.get("id") as string
  const nom = formData.get("nom") as string
  const marque = formData.get("marque") as string || null
  const reference = (formData.get("reference") as string)?.trim() || null
  const valeur = parseFloat(formData.get("valeur") as string || "0")

  if (id) {
    await prisma.equipement.update({
      where: { id },
      data: {
        nom,
        marque,
        reference,
        valeur
      }
    })
    revalidatePath("/equipement")
    revalidatePath("/")
  }
}

export async function deleteEquipement(id: string) {
  await prisma.equipement.delete({
    where: { id }
  })
  revalidatePath("/equipement")
  revalidatePath("/")
}

export async function emprunterEquipement(formData: FormData) {
  const equipementId = formData.get("equipementId") as string
  const clientId = formData.get("clientId") as string || null
  const utilisateur = formData.get("utilisateur") as string || "Anonyme"
  const type = formData.get("type") as string // "Emprunt", "Retour", "Réparation", "Perte"
  const observation = formData.get("observation") as string || ""

  // Si on emprunte
  if (type === "Emprunt" && clientId) {
    await prisma.$transaction([
      prisma.mouvementEquipement.create({
        data: { equipementId, type, clientId, utilisateur, observation }
      }),
      prisma.equipement.update({
        where: { id: equipementId },
        data: { statut: "En Client", clientId, utilisateur }
      })
    ])
  } 
  // Si on retourne
  else if (type === "Retour") {
    await prisma.$transaction([
      prisma.mouvementEquipement.create({
        data: { equipementId, type, clientId: null, utilisateur, observation }
      }),
      prisma.equipement.update({
        where: { id: equipementId },
        data: { statut: "Disponible", clientId: null, utilisateur: null }
      })
    ])
  }
  // Si en réparation ou perte
  else if (type === "Réparation" || type === "Perte") {
    await prisma.$transaction([
      prisma.mouvementEquipement.create({
        data: { equipementId, type, clientId: null, utilisateur, observation }
      }),
      prisma.equipement.update({
        where: { id: equipementId },
        data: { statut: type === "Réparation" ? "En Réparation" : "Perdu", clientId: null, utilisateur: null }
      })
    ])
  }

  revalidatePath("/equipement")
  revalidatePath("/")
}
