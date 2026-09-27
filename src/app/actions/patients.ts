"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { calculerResteSurPatient } from "@/lib/stockUtils"

export async function getPatients() {
  return prisma.patient.findMany({
    orderBy: { createdAt: 'desc' }
  })
}

export async function createPatient(formData: FormData) {
  const nom = formData.get("nom") as string

  await prisma.patient.create({
    data: {
      nom,
      statut: "Actif"
    }
  })

  revalidatePath("/patients")
}

export async function deletePatient(id: string) {
  await prisma.patient.delete({
    where: { id }
  })
  revalidatePath("/patients")
}

export async function updatePatient(formData: FormData) {
  const id = formData.get("id") as string
  const nom = formData.get("nom") as string
  const statut = formData.get("statut") as string

  if (id) {
    await prisma.patient.update({
      where: { id },
      data: {
        nom,
        statut
      }
    })
    revalidatePath("/patients")
    revalidatePath(`/patients/${id}`)
  }
}

export async function cloturerPatient(id: string) {
  // 1. Fetch patient with its movements
  const patient = await prisma.patient.findUnique({
    where: { id },
    include: { mouvements: true }
  })

  if (!patient) return

  // 2. Compute remaining stock on site
  const restes = calculerResteSurPatient(patient.mouvements)

  // 3. Create auto-returns for remaining items
  const mouvementsARetourner = Object.entries(restes)
    .filter(([articleId, qty]) => qty > 0)
    .map(([articleId, qty]) => ({
      articleId,
      patientId: id,
      type: "Retour",
      quantite: qty,
      utilisateur: "Système",
      observation: "Retour automatique suite à la clôture du patient"
    }))

  if (mouvementsARetourner.length > 0) {
    await prisma.mouvement.createMany({
      data: mouvementsARetourner
    })
  }

  // 4. Also return all Materiels assigned to this patient
  await prisma.materiel.updateMany({
    where: { patientId: id },
    data: { 
      statut: "Disponible",
      patientId: null,
      utilisateur: null
    }
  })

  // 5. Update status
  await prisma.patient.update({
    where: { id },
    data: { statut: "Terminé" }
  })

  revalidatePath("/patients")
  revalidatePath(`/patients/${id}`)
  revalidatePath("/catalogue")
  revalidatePath("/materiel")
}
