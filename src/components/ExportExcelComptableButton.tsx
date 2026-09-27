"use client"

import { FileSpreadsheet } from "lucide-react"
import * as XLSX from "xlsx"

interface Props {
  dataPharmacie: any[]
  dataPatients: any[]
}

export function ExportExcelComptableButton({ dataPharmacie, dataPatients }: Props) {
  const handleExport = () => {
    // Créer un nouveau classeur
    const wb = XLSX.utils.book_new()
    
    // Créer les feuilles à partir des données JSON
    const wsPharmacie = XLSX.utils.json_to_sheet(dataPharmacie)
    const wsPatients = XLSX.utils.json_to_sheet(dataPatients)
    
    // Ajouter les feuilles au classeur
    XLSX.utils.book_append_sheet(wb, wsPharmacie, "Stock Pharmacie")
    XLSX.utils.book_append_sheet(wb, wsPatients, "Stock Patients")
    
    // Générer le fichier avec la date du jour
    const date = new Date().toISOString().split('T')[0]
    XLSX.writeFile(wb, `Export_Comptable_${date}.xlsx`)
  }

  return (
    <button
      onClick={handleExport}
      className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm flex items-center gap-2"
    >
      <FileSpreadsheet className="w-4 h-4" />
      Export Comptable
    </button>
  )
}
