"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getMateriels() {
  return prisma.materiel.findMany({
    include: {
      patient: true,
      mouvements: {
        orderBy: { date: 'desc' },
        take: 5
      }
    },
    orderBy: { nom: 'asc' }
  })
}

export async function createMateriel(formData: FormData) {
  const nom = formData.get("nom") as string
  const marque = formData.get("marque") as string || null
  const reference = (formData.get("reference") as string)?.trim() || null
  const valeur = parseFloat(formData.get("valeur") as string || "0")
  
  await prisma.materiel.create({
    data: {
      nom,
      marque,
      reference,
      valeur,
      statut: "Disponible"
    }
  })

  revalidatePath("/materiel")
  revalidatePath("/")
}

export async function updateMateriel(formData: FormData) {
  const id = formData.get("id") as string
  const nom = formData.get("nom") as string
  const marque = formData.get("marque") as string || null
  const reference = (formData.get("reference") as string)?.trim() || null
  const valeur = parseFloat(formData.get("valeur") as string || "0")

  if (id) {
    await prisma.materiel.update({
      where: { id },
      data: {
        nom,
        marque,
        reference,
        valeur
      }
    })
    revalidatePath("/materiel")
    revalidatePath("/")
  }
}

export async function deleteMateriel(id: string) {
  await prisma.materiel.delete({
    where: { id }
  })
  revalidatePath("/materiel")
  revalidatePath("/")
}

export async function emprunterMateriel(formData: FormData) {
  const materielId = formData.get("materielId") as string
  const patientId = formData.get("patientId") as string || null
  const utilisateur = formData.get("utilisateur") as string || "Anonyme"
  const type = formData.get("type") as string // "Emprunt", "Retour", "Réparation", "Perte"
  const observation = formData.get("observation") as string || ""

  // Si on emprunte
  if (type === "Emprunt" && patientId) {
    await prisma.$transaction([
      prisma.mouvementMateriel.create({
        data: { materielId, type, patientId, utilisateur, observation }
      }),
      prisma.materiel.update({
        where: { id: materielId },
        data: { statut: "En Patient", patientId, utilisateur }
      })
    ])
  } 
  // Si on retourne
  else if (type === "Retour") {
    await prisma.$transaction([
      prisma.mouvementMateriel.create({
        data: { materielId, type, patientId: null, utilisateur, observation }
      }),
      prisma.materiel.update({
        where: { id: materielId },
        data: { statut: "Disponible", patientId: null, utilisateur: null }
      })
    ])
  }
  // Si en réparation ou perte
  else if (type === "Réparation" || type === "Perte") {
    await prisma.$transaction([
      prisma.mouvementMateriel.create({
        data: { materielId, type, patientId: null, utilisateur, observation }
      }),
      prisma.materiel.update({
        where: { id: materielId },
        data: { statut: type === "Réparation" ? "En Réparation" : "Perdu", patientId: null, utilisateur: null }
      })
    ])
  }

  revalidatePath("/materiel")
  revalidatePath("/")
}
