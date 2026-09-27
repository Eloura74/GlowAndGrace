"use client"

import { FileSpreadsheet } from "lucide-react"
import * as XLSX from "xlsx"

interface Props {
  dataReserve: any[]
  dataClients: any[]
}

export function ExportExcelComptableButton({ dataReserve, dataClients }: Props) {
  const handleExport = () => {
    // Créer un nouveau classeur
    const wb = XLSX.utils.book_new()
    
    // Créer les feuilles à partir des données JSON
    const wsReserve = XLSX.utils.json_to_sheet(dataReserve)
    const wsClients = XLSX.utils.json_to_sheet(dataClients)
    
    // Ajouter les feuilles au classeur
    XLSX.utils.book_append_sheet(wb, wsReserve, "Stock Reserve")
    XLSX.utils.book_append_sheet(wb, wsClients, "Stock Clients")
    
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
