import { EquipementForm } from "@/components/EquipementForm"
import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"

export default async function EditEquipementPage({ params }: { params: { id: string } }) {
  const { id } = await params
  
  const dispositif = await prisma.equipement.findUnique({
    where: { id }
  })

  if (!dispositif) {
    notFound()
  }

  return (
    <div className="py-6">
      <EquipementForm equipement={dispositif} />
    </div>
  )
}
