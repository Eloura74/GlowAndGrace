"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getProduits() {
  return prisma.produit.findMany({
    include: { mouvements: true },
    orderBy: { reference: 'asc' }
  })
}

export async function createProduit(formData: FormData) {
  const reference = formData.get("reference") as string
  const designation = formData.get("designation") as string
  const categorie = formData.get("categorie") as string
  const unite = formData.get("unite") as string
  const stockMinimum = parseInt(formData.get("stockMinimum") as string || "0")
  const stockInitial = parseInt(formData.get("stockInitial") as string || "0")
  const prixUnitaire = parseFloat(formData.get("prixUnitaire") as string || "0")
  const quantiteParBoite = parseInt(formData.get("quantiteParBoite") as string || "1")
  const retourAttendu = formData.get("retourAttendu") === "on"
  const referenceFournisseur = formData.get("referenceFournisseur") as string || null
  const fournisseur = (formData.get("fournisseur") as string)?.trim() || null
  const codeBarre = (formData.get("codeBarre") as string)?.trim() || null

  await prisma.produit.create({
    data: {
      reference,
      designation,
      categorie,
      unite,
      stockInitial,
      stockMinimum,
      quantiteParBoite,
      prixUnitaire,
      referenceFournisseur,
      fournisseur,
      codeBarre,
      retourAttendu,
    } as any
  })

  revalidatePath("/catalogue")
  revalidatePath("/mouvements")
  revalidatePath("/reassort")
}

export async function deleteProduit(id: string) {
  await prisma.produit.delete({
    where: { id }
  })
  revalidatePath("/catalogue")
  revalidatePath("/mouvements")
  revalidatePath("/reassort")
}

export async function updateProduit(formData: FormData) {
  const id = formData.get("id") as string
  const reference = formData.get("reference") as string
  const designation = formData.get("designation") as string
  const categorie = formData.get("categorie") as string
  const unite = formData.get("unite") as string
  const stockMinimum = parseInt(formData.get("stockMinimum") as string || "0")
  const quantiteParBoite = parseInt(formData.get("quantiteParBoite") as string || "1")
  const prixUnitaire = parseFloat(formData.get("prixUnitaire") as string || "0")
  const referenceFournisseur = (formData.get("referenceFournisseur") as string)?.trim() || null
  const fournisseur = (formData.get("fournisseur") as string)?.trim() || null
  const codeBarre = (formData.get("codeBarre") as string)?.trim() || null

  if (id) {
    await prisma.produit.update({
      where: { id },
      data: {
        reference,
        designation,
        categorie,
        unite,
        stockMinimum,
        quantiteParBoite,
        prixUnitaire,
        referenceFournisseur,
        fournisseur,
        codeBarre,
      } as any
    })
    revalidatePath("/catalogue")
    revalidatePath(`/catalogue/${id}`)
    revalidatePath("/mouvements")
    revalidatePath("/reassort")
    revalidatePath("/")
  }
}

export async function creerProduitEtStock(formData: FormData) {
  const reference = formData.get("reference") as string
  const designation = formData.get("designation") as string
  const fournisseur = (formData.get("fournisseur") as string)?.trim() || null
  const codeBarre = (formData.get("codeBarre") as string)?.trim() || null
  const quantiteReelle = parseInt(formData.get("quantiteReelle") as string || "0")
  const observation = formData.get("observation") as string || "Création via Scan & Go"

  const produit = await prisma.produit.create({
    data: {
      reference: reference || `REF-${Date.now()}`,
      designation,
      fournisseur,
      codeBarre,
      stockInitial: 0,
      categorie: "À classer",
      unite: "u"
    } as any
  })

  if (quantiteReelle > 0) {
    await prisma.mouvement.create({
      data: {
        type: "Correction",
        quantite: quantiteReelle,
        produitId: produit.id,
        observation: observation,
        utilisateur: "Magasinier"
      }
    })
  }

  revalidatePath("/inventaire")
  revalidatePath("/catalogue")
  
  return produit.id
}

export async function updateInfosRapides(formData: FormData) {
  const id = formData.get("id") as string
  const designation = (formData.get("designation") as string)?.trim()
  const fournisseur = (formData.get("fournisseur") as string)?.trim() || null
  const reference = (formData.get("reference") as string)?.trim() || null

  if (id) {
    await prisma.produit.update({
      where: { id },
      data: {
        ...(designation ? { designation } : {}),
        ...(fournisseur !== null ? { fournisseur } : {}),
        ...(reference !== null ? { reference } : {})
      }
    })
    revalidatePath("/inventaire")
    revalidatePath("/catalogue")
  }
}
