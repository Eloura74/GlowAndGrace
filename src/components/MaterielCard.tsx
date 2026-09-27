import Link from "next/link"
import { Stethoscope, CheckCircle, Clock, AlertTriangle, User, MapPin } from "lucide-react"

export function MaterielCard({ dispositif }: { dispositif: any }) {
  const isDisponible = dispositif.statut === "Disponible"
  const isEnPatient = dispositif.statut === "En Patient"
  const isEnReparation = dispositif.statut === "En Réparation"
  const isPerdu = dispositif.statut === "Perdu"

  return (
    <Link href={`/materiel/${dispositif.id}`}>
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 p-5 hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col">
        
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${
              isDisponible ? 'bg-emerald-100 text-emerald-600' : 
              isEnPatient ? 'bg-orange-100 text-orange-600' : 
              'bg-red-100 text-red-600'
            }`}>
              <Stethoscope className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-zinc-50 leading-tight">{dispositif.nom}</h3>
              <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">{dispositif.marque || 'Sans marque'} {dispositif.reference ? `• Réf: ${dispositif.reference}` : ''}</p>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-gray-50 flex flex-col gap-2">
          {isDisponible && (
            <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg text-sm font-medium w-max">
              <CheckCircle className="h-4 w-4" />
              Disponible au pharmacie
            </div>
          )}
          
          {isEnPatient && (
            <div className="flex flex-col gap-1 text-orange-800 bg-orange-50 px-3 py-2 rounded-lg text-sm font-medium">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Sur Patient
              </div>
              <div className="flex items-center gap-4 text-xs font-normal text-orange-700 mt-1">
                {dispositif.patient && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {dispositif.patient.nom}
                  </div>
                )}
                {dispositif.utilisateur && (
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {dispositif.utilisateur}
                  </div>
                )}
              </div>
            </div>
          )}

          {(isEnReparation || isPerdu) && (
            <div className="flex items-center gap-2 text-red-700 bg-red-50 px-3 py-2 rounded-lg text-sm font-medium w-max">
              <AlertTriangle className="h-4 w-4" />
              {dispositif.statut}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
