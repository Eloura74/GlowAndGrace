import prisma from "@/lib/prisma"
import Link from "next/link"
import { Plus } from "lucide-react"
import { MaterielCard } from "@/components/MaterielCard"
import { EmpruntMaterielForm } from "@/components/EmpruntMaterielForm"
import { getMateriels } from "@/app/actions/materiel"

export default async function MaterielPage() {
  const materiels = await getMateriels()
  
  const patients = await prisma.patient.findMany({
    where: { statut: 'Actif' },
    orderBy: { nom: 'asc' }
  })

  // Stats rapides
  const total = materiels.length
  const disponibles = materiels.filter((o: any) => o.statut === "Disponible").length
  const enPatient = materiels.filter((o: any) => o.statut === "En Patient").length
  const autres = total - disponibles - enPatient // En réparation ou perdu

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Materiel</h1>
          <p className="text-gray-500 dark:text-zinc-400 mt-1">Gérez vos dispositifs et dispositifs médicaux onéreux.</p>
        </div>
        <Link href="/materiel/nouveau" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2">
          <Plus className="h-4 w-4" />
          Ajouter un dispositif
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-zinc-900 border rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-zinc-50">{total}</div>
          <div className="text-xs text-gray-500 dark:text-zinc-400 uppercase tracking-wide">Dispositifs</div>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-emerald-700">{disponibles}</div>
          <div className="text-xs text-emerald-600 uppercase tracking-wide">En pharmacie</div>
        </div>
        <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-orange-700">{enPatient}</div>
          <div className="text-xs text-orange-600 uppercase tracking-wide">Sur Patient</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {materiels.map((dispositif: any) => (
              <MaterielCard key={dispositif.id} dispositif={dispositif} />
            ))}
            {materiels.length === 0 && (
              <div className="col-span-full py-12 text-center text-gray-500 dark:text-zinc-400 bg-white dark:bg-zinc-900 rounded-xl border border-dashed">
                Aucun dispositif enregistré pour le moment.
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <EmpruntMaterielForm materiels={materiels} patients={patients} />
        </div>

      </div>
    </div>
  )
}
