"use client"

import { FileDown } from "lucide-react"
import { jsPDF } from "jspdf"
import "jspdf-autotable"

export function ExportBonLivraisonButton({ 
  client, 
  equipementDeploye 
}: { 
  client: any, 
  equipementDeploye: { produit: any, quantite: number }[] 
}) {
  const exportPDF = () => {
    const doc = new (jsPDF as any)()
    
    // Header
    doc.setFontSize(22)
    doc.setTextColor(40, 40, 40)
    doc.text("FICHE CLIENTE (PRODUITS CABINE)", 14, 22)
    
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(`Date : ${new Date().toLocaleDateString("fr-FR")}`, 14, 30)
    
    // Client Info
    doc.setFontSize(14)
    doc.setTextColor(40, 40, 40)
    doc.text("Informations Cliente", 14, 45)
    
    doc.setFontSize(11)
    doc.setTextColor(80, 80, 80)
    doc.text(`Nom : ${client.nom}`, 14, 53)
    doc.text(`Téléphone : ${client.telephone || 'Non renseigné'}`, 14, 59)
    doc.text(`Email : ${client.email || 'Non renseigné'}`, 14, 65)
    doc.text(`Allergies/Peau : ${client.allergies || client.typePeau || 'Non renseigné'}`, 14, 71)

    // Table
    const tableBody = equipementDeploye.map(item => [
      item.produit.reference,
      item.produit.designation,
      item.quantite.toString(),
      item.produit.categorie || '-'
    ])

    doc.autoTable({
      startY: 80,
      head: [['Référence', 'Produit', 'Quantité', 'Catégorie']],
      body: tableBody,
      theme: 'grid',
      headStyles: { fillColor: [244, 63, 94] }, // Tailwind rose-500
      styles: { fontSize: 10, cellPadding: 4 },
      columnStyles: { 2: { halign: 'center' } }
    })

    const finalY = (doc as any).lastAutoTable.finalY || 80
    
    // Signatures
    doc.setFontSize(10)
    doc.text("Signature de l'esthéticienne :", 14, finalY + 20)
    doc.rect(14, finalY + 25, 60, 25)
    
    doc.text("Signature de la cliente :", 120, finalY + 20)
    doc.rect(120, finalY + 25, 60, 25)

    // Save
    doc.save(`Fiche_${client.nom.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().getTime()}.pdf`)
  }

  return (
    <button 
      type="button"
      onClick={exportPDF}
      className="flex items-center gap-2 rounded-md bg-white border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 px-3 py-2 text-sm font-semibold text-gray-700 dark:text-zinc-200 shadow-sm hover:bg-gray-50 dark:hover:bg-zinc-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 transition-colors"
    >
      <FileDown className="h-4 w-4" />
      Fiche Cliente (PDF)
    </button>
  )
}
