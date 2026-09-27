"use client"

import { useState } from "react"
import { emprunterEquipement } from "@/app/actions/equipement"
import { ArrowRightLeft, Camera, Search } from "lucide-react"
import dynamic from 'next/dynamic'

const BarcodeScanner = dynamic(() => import('./BarcodeScanner').then(mod => mod.BarcodeScanner), { ssr: false })

export function EmpruntEquipementForm({ equipements, clients }: { equipements: any[], clients: any[] }) {
  const [isScanning, setIsScanning] = useState(false)
  const [selectedEquipementId, setSelectedEquipementId] = useState("")
  const [actionType, setActionType] = useState("Emprunt")
  const [scanError, setScanError] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  
  const [selectedClientId, setSelectedClientId] = useState("")
  const [clientSearchQuery, setClientSearchQuery] = useState("")
  const [showClientDropdown, setShowClientDropdown] = useState(false)

  const selectedClient = clients.find(c => c.id === selectedClientId)
  
  const handleScan = (code: string) => {
    setIsScanning(false)
    setScanError(null)

    const trimmedCode = code.trim()
    const dispositif = equipements.find(o => o.reference === trimmedCode)
    if (dispositif) {
      setSelectedEquipementId(dispositif.id)
      
      // Auto-select action based on current status
      if (dispositif.statut === "Disponible") setActionType("Emprunt")
      else if (dispositif.statut === "En Client") setActionType("Retour")
      
    } else {
      setScanError(`Dispositif introuvable (Code lu : ${trimmedCode})`)
    }
  }

  const selectedDispositif = equipements.find(o => o.id === selectedEquipementId)

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 p-6 sticky top-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
          <ArrowRightLeft className="h-5 w-5" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-50">Emprunt & Retour</h2>
      </div>

      <div className="mb-6">
        <button 
          onClick={() => setIsScanning(true)}
          className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-4 rounded-xl hover:bg-gray-800 transition-colors font-medium shadow-md shadow-gray-900/20"
        >
          <Camera className="h-5 w-5" />
          Scanner un dispositif
        </button>
        {scanError && <p className="text-red-500 text-sm mt-2 font-medium text-center">{scanError}</p>}
      </div>

      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px bg-gray-200"></div>
        <span className="text-xs font-medium text-gray-400 dark:text-zinc-500 uppercase tracking-wider">OU SÉLECTION MANUELLE</span>
        <div className="flex-1 h-px bg-gray-200"></div>
      </div>

      <form action={async (formData) => {
        await emprunterEquipement(formData)
        setSelectedEquipementId("")
        setActionType("Emprunt")
      }} className="space-y-5">
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-zinc-200 mb-1">Sélectionner l'dispositif</label>
          <div className="relative">
            {/* Native select visually hidden for form validation and submission */}
            <select 
              name="equipementId" 
              required 
              value={selectedEquipementId}
              onChange={(e) => {
                setSelectedEquipementId(e.target.value)
                const out = equipements.find(o => o.id === e.target.value)
                if (out?.statut === "Disponible") setActionType("Emprunt")
                if (out?.statut === "En Client") setActionType("Retour")
              }}
              className="absolute opacity-0 w-full h-full -z-10 pointer-events-none"
              tabIndex={-1}
            >
              <option value="">-- Choisir un dispositif --</option>
              {equipements.map(o => (
                <option key={o.id} value={o.id}>{o.id}</option>
              ))}
            </select>

            {!selectedEquipementId ? (
              <>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400 dark:text-zinc-500" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setShowDropdown(true)
                  }}
                  onFocus={() => setShowDropdown(true)}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                  className="block w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:border-blue-500 focus:ring-blue-500 text-sm transition-colors"
                  placeholder="Rechercher un dispositif (nom, réf)..."
                />
                
                {showDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {equipements
                      .filter(o => 
                        !searchQuery || 
                        o.nom.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        (o.reference && o.reference.toLowerCase().includes(searchQuery.toLowerCase()))
                      )
                      .slice(0, 50)
                      .map(o => (
                        <button
                          key={o.id}
                          type="button"
                          onClick={() => {
                            setSelectedEquipementId(o.id)
                            setSearchQuery('')
                            setShowDropdown(false)
                            if (o.statut === "Disponible") setActionType("Emprunt")
                            if (o.statut === "En Client") setActionType("Retour")
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-zinc-800 border-b border-gray-100 dark:border-zinc-800 last:border-0 transition-colors flex justify-between items-center"
                        >
                          <div>
                            <div className="font-medium text-gray-900 dark:text-zinc-100">{o.nom}</div>
                            <div className="text-xs text-gray-500 dark:text-zinc-400">Réf: {o.reference || 'Aucune'}</div>
                          </div>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            o.statut === 'Disponible' ? 'bg-emerald-100 text-emerald-800' :
                            o.statut === 'En Client' ? 'bg-orange-100 text-orange-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {o.statut}
                          </span>
                        </button>
                      ))}
                    {equipements.filter(o => !searchQuery || o.nom.toLowerCase().includes(searchQuery.toLowerCase()) || (o.reference && o.reference.toLowerCase().includes(searchQuery.toLowerCase()))).length === 0 && (
                      <div className="px-4 py-3 text-sm text-gray-500 dark:text-zinc-400 text-center">
                        Aucun dispositif trouvé.
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-between p-3 border border-blue-200 bg-blue-50 dark:border-blue-900/50 dark:bg-blue-900/20 rounded-md">
                <div>
                  <div className="text-sm font-medium text-blue-900 dark:text-blue-100">{selectedDispositif?.nom}</div>
                  <div className="text-xs text-blue-700 dark:text-blue-300">Réf: {selectedDispositif?.reference || 'Aucune'}</div>
                  <span className={`mt-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    selectedDispositif?.statut === 'Disponible' ? 'bg-emerald-100 text-emerald-800' :
                    selectedDispositif?.statut === 'En Client' ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {selectedDispositif?.statut}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedEquipementId('')
                    setActionType("Emprunt") // Reset to default
                  }}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-bold"
                >
                  Changer
                </button>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-zinc-200 mb-1">Action</label>
          <div className="grid grid-cols-2 gap-2">
            <label className={`border rounded-lg p-3 flex flex-col items-center gap-1 cursor-pointer transition-colors ${actionType === 'Emprunt' ? 'bg-blue-50 border-blue-600 text-blue-700' : 'hover:bg-gray-50 dark:hover:bg-zinc-800/50 dark:bg-zinc-950 text-gray-600 dark:text-zinc-300'}`}>
              <input type="radio" name="type" value="Emprunt" checked={actionType === 'Emprunt'} onChange={(e) => setActionType(e.target.value)} className="sr-only" />
              <span className="text-sm font-semibold">Emprunter</span>
            </label>
            <label className={`border rounded-lg p-3 flex flex-col items-center gap-1 cursor-pointer transition-colors ${actionType === 'Retour' ? 'bg-emerald-50 border-emerald-600 text-emerald-700' : 'hover:bg-gray-50 dark:hover:bg-zinc-800/50 dark:bg-zinc-950 text-gray-600 dark:text-zinc-300'}`}>
              <input type="radio" name="type" value="Retour" checked={actionType === 'Retour'} onChange={(e) => setActionType(e.target.value)} className="sr-only" />
              <span className="text-sm font-semibold">Restituer</span>
            </label>
            <label className={`border rounded-lg p-3 flex flex-col items-center gap-1 cursor-pointer transition-colors ${actionType === 'Réparation' ? 'bg-orange-50 border-orange-600 text-orange-700' : 'hover:bg-gray-50 dark:hover:bg-zinc-800/50 dark:bg-zinc-950 text-gray-600 dark:text-zinc-300'}`}>
              <input type="radio" name="type" value="Réparation" checked={actionType === 'Réparation'} onChange={(e) => setActionType(e.target.value)} className="sr-only" />
              <span className="text-sm font-semibold text-center leading-tight">Envoyer en réparation</span>
            </label>
            <label className={`border rounded-lg p-3 flex flex-col items-center gap-1 cursor-pointer transition-colors ${actionType === 'Perte' ? 'bg-red-50 border-red-600 text-red-700' : 'hover:bg-gray-50 dark:hover:bg-zinc-800/50 dark:bg-zinc-950 text-gray-600 dark:text-zinc-300'}`}>
              <input type="radio" name="type" value="Perte" checked={actionType === 'Perte'} onChange={(e) => setActionType(e.target.value)} className="sr-only" />
              <span className="text-sm font-semibold">Déclarer perdu</span>
            </label>
          </div>
        </div>

        {actionType === 'Emprunt' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-200 mb-1">Client de destination *</label>
            <div className="relative">
              {/* Native select visually hidden for form validation and submission */}
              <select 
                name="clientId" 
                required 
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="absolute opacity-0 w-full h-full -z-10 pointer-events-none"
                tabIndex={-1}
              >
                <option value="">-- Sélectionner --</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.id}</option>
                ))}
              </select>

              {!selectedClientId ? (
                <>
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400 dark:text-zinc-500" />
                  </div>
                  <input
                    type="text"
                    value={clientSearchQuery}
                    onChange={(e) => {
                      setClientSearchQuery(e.target.value)
                      setShowClientDropdown(true)
                    }}
                    onFocus={() => setShowClientDropdown(true)}
                    onBlur={() => setTimeout(() => setShowClientDropdown(false), 200)}
                    className="block w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:border-blue-500 focus:ring-blue-500 text-sm transition-colors"
                    placeholder="Rechercher un client..."
                  />
                  
                  {showClientDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {clients
                        .filter(c => !clientSearchQuery || c.nom.toLowerCase().includes(clientSearchQuery.toLowerCase()))
                        .slice(0, 50)
                        .map(c => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              setSelectedClientId(c.id)
                              setClientSearchQuery('')
                              setShowClientDropdown(false)
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-zinc-800 border-b border-gray-100 dark:border-zinc-800 last:border-0 transition-colors"
                          >
                            <div className="font-medium text-gray-900 dark:text-zinc-100">{c.nom}</div>
                          </button>
                        ))}
                      {clients.filter(c => !clientSearchQuery || c.nom.toLowerCase().includes(clientSearchQuery.toLowerCase())).length === 0 && (
                        <div className="px-4 py-3 text-sm text-gray-500 dark:text-zinc-400 text-center">
                          Aucun client trouvé.
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-between p-3 border border-blue-200 bg-blue-50 dark:border-blue-900/50 dark:bg-blue-900/20 rounded-md">
                  <div>
                    <div className="text-sm font-medium text-blue-900 dark:text-blue-100">{selectedClient?.nom}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedClientId('')}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-bold"
                  >
                    Changer
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-zinc-200 mb-1">Collaborateur *</label>
          <input 
            type="text" 
            name="utilisateur" 
            required
            defaultValue={selectedDispositif?.utilisateur || ""}
            placeholder="Ex: Quentin, Julien..."
            className="w-full rounded-md border border-gray-300 dark:border-zinc-700 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-zinc-200 mb-1">Observation (Optionnel)</label>
          <input 
            type="text" 
            name="observation" 
            placeholder="État de la dispositif, batterie manquante..."
            className="w-full rounded-md border border-gray-300 dark:border-zinc-700 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <button 
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-bold text-lg shadow-md transition-colors"
        >
          Valider le mouvement
        </button>
      </form>

      {isScanning && (
        <BarcodeScanner 
          onScan={handleScan} 
          onClose={() => setIsScanning(false)} 
        />
      )}
    </div>
  )
}
