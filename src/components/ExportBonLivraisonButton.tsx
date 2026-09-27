"use client"

import { FileDown } from "lucide-react"
import { jsPDF } from "jspdf"
import "jspdf-autotable"

export function ExportBonLivraisonButton({ 
  patient, 
  materielDeploye 
}: { 
  patient: any, 
  materielDeploye: { article: any, quantite: number }[] 
}) {
  const exportPDF = () => {
    const doc = new (jsPDF as any)()
    
    // Header
    doc.setFontSize(22)
    doc.setTextColor(40, 40, 40)
    doc.text("BON DE LIVRAISON", 14, 22)
    
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(`Date : ${new Date().toLocaleDateString("fr-FR")}`, 14, 30)
    
    // Patient Info
    doc.setFontSize(14)
    doc.setTextColor(40, 40, 40)
    doc.text("Patient", 14, 45)
    
    doc.setFontSize(11)
    doc.setTextColor(80, 80, 80)
    doc.text(`Nom : ${patient.nom}`, 14, 53)
    doc.text(`Adresse : ${patient.adresse || 'Non renseignée'}`, 14, 59)
    doc.text(`Statut : ${patient.statut}`, 14, 65)

    // Table
    const tableBody = materielDeploye.map(item => [
      item.article.reference,
      item.article.designation,
      item.quantite.toString(),
      item.article.categorie || '-'
    ])

    doc.autoTable({
      startY: 75,
      head: [['Référence', 'Désignation', 'Quantité', 'Catégorie']],
      body: tableBody,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] }, // Tailwind blue-500
      styles: { fontSize: 10, cellPadding: 4 },
      columnStyles: { 2: { halign: 'center' } }
    })

    const finalY = (doc as any).lastAutoTable.finalY || 75
    
    // Signatures
    doc.setFontSize(10)
    doc.text("Signature du responsable pharmacie :", 14, finalY + 20)
    doc.rect(14, finalY + 25, 60, 25)
    
    doc.text("Signature du chef d'équipe :", 120, finalY + 20)
    doc.rect(120, finalY + 25, 60, 25)

    // Save
    doc.save(`BL_${patient.nom.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().getTime()}.pdf`)
  }

  return (
    <button 
      type="button"
      onClick={exportPDF}
      className="flex items-center gap-2 rounded-md bg-white border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 px-3 py-2 text-sm font-semibold text-gray-700 dark:text-zinc-200 shadow-sm hover:bg-gray-50 dark:hover:bg-zinc-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors"
    >
      <FileDown className="h-4 w-4" />
      Bon de Livraison (PDF)
    </button>
  )
}
