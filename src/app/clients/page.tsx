import { getClients, createClient, deleteClient } from "@/app/actions/clients"
import { Activity, Plus, Trash2 } from "lucide-react"
import { calculerResteSurClient } from "@/lib/stockUtils"
import prisma from "@/lib/prisma"
import { DeleteButton } from "@/components/DeleteButton"
import Link from "next/link"

export default async function ClientsPage() {
  const clients = await prisma.client.findMany({
    include: { 
      mouvements: {
        include: { produit: true }
      } 
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Gestion des Clients</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Formulaire d'ajout */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
            <div className="border-b bg-rose-50 dark:bg-zinc-950/50 px-4 py-3 font-medium text-rose-900 dark:text-rose-200">
              Nouveau client
            </div>
            <form action={createClient} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-200">Nom complet</label>
                <input required name="nom" type="text" className="mt-1 block w-full rounded-md border border-gray-300 dark:border-zinc-700 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500" placeholder="ex: Marie Dupont" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-zinc-200">Téléphone</label>
                  <input name="telephone" type="tel" className="mt-1 block w-full rounded-md border border-gray-300 dark:border-zinc-700 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500" placeholder="06 12..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-zinc-200">Email</label>
                  <input name="email" type="email" className="mt-1 block w-full rounded-md border border-gray-300 dark:border-zinc-700 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500" placeholder="@" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-200">Type de peau / Allergies</label>
                <input name="allergies" type="text" className="mt-1 block w-full rounded-md border border-gray-300 dark:border-zinc-700 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500" placeholder="ex: Sèche, allergies aux noix..." />
              </div>
              
              <button type="submit" className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2">
                <Plus className="h-4 w-4" />
                Créer la fiche
              </button>
            </form>
          </div>
        </div>

        {/* Liste des clients */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-800 text-sm">
                <thead className="bg-gray-50 dark:bg-zinc-950">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-zinc-400">Nom du Client</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-zinc-400">Adresse</th>
                    <th className="px-4 py-3 text-center font-medium text-gray-500 dark:text-zinc-400">Statut</th>
                    <th className="px-4 py-3 text-center font-medium text-gray-500 dark:text-zinc-400">Matériel affecté</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-500 dark:text-zinc-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
                  {clients.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-500 dark:text-zinc-400">
                        Aucun client enregistré.
                      </td>
                    </tr>
                  ) : (
                    clients.map((client: any) => {
                      const resteClient = calculerResteSurClient(client.mouvements)
                      let equipementDeploye = 0;
                      let valeurClient = 0;
                      Object.entries(resteClient).forEach(([produitId, qty]) => {
                        equipementDeploye += (qty as number);
                        const mvt = client.mouvements.find((m: any) => m.produitId === produitId);
                        if (mvt?.produit?.prixUnitaire) {
                          valeurClient += (qty as number) * mvt.produit.prixUnitaire;
                        }
                      });
                      
                      return (
                        <tr key={client.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 dark:bg-zinc-950">
                          <td className="px-4 py-3 font-medium text-gray-900 dark:text-zinc-50">
                            <div className="flex items-center gap-3">
                              <div className="rounded-full bg-gray-100 dark:bg-zinc-800 p-2">
                                <Activity className="h-5 w-5 text-gray-500 dark:text-zinc-400" />
                              </div>
                              <Link href={`/clients/${client.id}`} className="font-medium text-gray-900 dark:text-zinc-50 hover:text-blue-600 hover:underline">
                                {client.nom}
                              </Link>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-500 dark:text-zinc-400">{client.adresse || '-'}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              client.statut === 'Actif' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-zinc-100'
                            }`}>
                              {client.statut}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center text-blue-600">
                            <div className="font-bold">{equipementDeploye} unités</div>
                            <div className="text-xs text-gray-500">{valeurClient.toFixed(2)} €</div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-2">
                              <Link href={`/clients/${client.id}`} className="rounded p-1 text-blue-500 hover:bg-blue-50" title="Modifier/Détails">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                              </Link>
                              <form action={deleteClient.bind(null, client.id)}>
                                <DeleteButton message="Supprimer ce client va aussi supprimer son historique de mouvements. Continuer ?" />
                              </form>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Vue Mobile (Cartes) */}
            <div className="md:hidden divide-y divide-gray-100">
              {clients.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-zinc-400">Aucun client enregistré.</div>
              ) : (
                clients.map((client: any) => {
                  const resteClient = calculerResteSurClient(client.mouvements)
                  let equipementDeploye = 0;
                  let valeurClient = 0;
                  Object.entries(resteClient).forEach(([produitId, qty]) => {
                    equipementDeploye += (qty as number);
                    const mvt = client.mouvements.find((m: any) => m.produitId === produitId);
                    if (mvt?.produit?.prixUnitaire) {
                      valeurClient += (qty as number) * mvt.produit.prixUnitaire;
                    }
                  });
                  
                  return (
                    <div key={client.id} className="p-4 bg-white dark:bg-zinc-900 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="rounded-full bg-gray-100 dark:bg-zinc-800 p-2">
                            <Activity className="h-5 w-5 text-gray-500 dark:text-zinc-400" />
                          </div>
                          <div>
                            <Link href={`/clients/${client.id}`} className="font-bold text-gray-900 dark:text-zinc-50 hover:text-blue-600">
                              {client.nom}
                            </Link>
                            <div className="text-xs text-gray-500 dark:text-zinc-400">{client.adresse || 'Pas d\'adresse'}</div>
                          </div>
                        </div>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          client.statut === 'Actif' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-zinc-100'
                        }`}>
                          {client.statut}
                        </span>
                      </div>

                      <div className="flex justify-between items-center bg-gray-50 dark:bg-zinc-950 p-3 rounded-lg border border-gray-100 dark:border-zinc-800">
                        <div className="text-xs text-gray-500 dark:text-zinc-400 font-medium">Matériel affecté</div>
                        <div className="text-right">
                          <div className="font-bold text-blue-600">{equipementDeploye} unités</div>
                          <div className="text-xs text-gray-500">{valeurClient.toFixed(2)} €</div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <Link href={`/clients/${client.id}`} className="rounded p-1.5 text-blue-500 bg-blue-50 hover:bg-blue-100">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </Link>
                        <form action={deleteClient.bind(null, client.id)}>
                          <DeleteButton message="Supprimer ce client va aussi supprimer son historique de mouvements. Continuer ?" />
                        </form>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
