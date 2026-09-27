import { MaterielForm } from "@/components/MaterielForm"
import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"

export default async function EditMaterielPage({ params }: { params: { id: string } }) {
  const { id } = await params
  
  const dispositif = await prisma.materiel.findUnique({
    where: { id }
  })

  if (!dispositif) {
    notFound()
  }

  return (
    <div className="py-6">
      <MaterielForm materiel={dispositif} />
    </div>
  )
}
