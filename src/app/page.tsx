import { Package, HeartPulse, AlertTriangle, TrendingDown, ArrowRight, Stethoscope, Activity, ArrowRightLeft, FileText } from "lucide-react"
import prisma from "@/lib/prisma"
import Link from "next/link"
import { calculerStockProduit } from "@/lib/stockUtils"
import { DashboardCharts } from "@/components/DashboardCharts"
import { ExportExcelComptableButton } from "@/components/ExportExcelComptableButton"

export default async function Home() {
  // Récupérer les produits avec leurs mouvements pour calculer les vrais stocks
  const produits = await prisma.produit.findMany({
    include: { mouvements: true }
  })
  
  // Calculer les stats réelles
  let produitsEnAlerte = 0
  let valeurTotaleReserve = 0
  let valeurTotaleClients = 0
  
  const alertesDetails = []

  for (const produit of produits) {
    const stock = calculerStockProduit(produit, produit.mouvements)
    const prix = produit.prixUnitaire || 0
    valeurTotaleReserve += stock.stockReserve * prix
    valeurTotaleClients += stock.stockClientsTotal * prix
    
    if (stock.enAlerte) {
      produitsEnAlerte++
      alertesDetails.push({
        produit,
        stock
      })
    }
  }

  const produitsCount = produits.length;
  const clientsActifsCount = await prisma.client.count({ where: { statut: 'Actif' } });
  
  // Trier les produits pour le Top 3 immobilisations
  const topImmobilisations = [...produits]
    .map(produit => ({
      produit,
      valeur: (calculerStockProduit(produit, produit.mouvements).stockReserve) * (produit.prixUnitaire || 0)
    }))
    .filter(item => item.valeur > 0)
    .sort((a, b) => b.valeur - a.valeur)
    .slice(0, 3);
  
  const recentMouvements = await prisma.mouvement.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      client: true,
      produit: true
    }
  });

  // Export Excel Data Prep
  const dataReserve = produits.map(produit => {
    const stock = calculerStockProduit(produit, produit.mouvements)
    return {
      "Référence": produit.reference,
      "Désignation": produit.designation,
      "Catégorie": produit.categorie || "-",
      "Stock Reserve": stock.stockReserve,
      "Prix Unitaire (€)": produit.prixUnitaire || 0,
      "Valeur Totale (€)": stock.stockReserve * (produit.prixUnitaire || 0)
    }
  })

  const clientsComplets = await prisma.client.findMany({
    include: {
      mouvements: { include: { produit: true } }
    }
  });

  const dataClients: any[] = [];
  clientsComplets.forEach(client => {
    const equipementMap = new Map<string, { produit: any, quantite: number }>();
    client.mouvements.forEach((mvt: any) => {
      if (!equipementMap.has(mvt.produitId)) equipementMap.set(mvt.produitId, { produit: mvt.produit, quantite: 0 });
      const current = equipementMap.get(mvt.produitId)!;
      if (mvt.type === 'Depart') current.quantite += mvt.quantite;
      if (mvt.type === 'Retour' || mvt.type === 'Consomme') current.quantite -= mvt.quantite;
    });

    equipementMap.forEach(m => {
      if (m.quantite > 0) {
        dataClients.push({
          "Client": client.nom,
          "Statut": client.statut,
          "Référence": m.produit.reference,
          "Désignation": m.produit.designation,
          "Quantité sur site": m.quantite,
          "Valeur (€)": m.quantite * (m.produit.prixUnitaire || 0)
        });
      }
    });
  });

  return (
    <div className="space-y-6">
      {/* Alert Banner */}
      {produitsEnAlerte > 0 && (
        <Link href="/catalogue?alert=true" className="bg-rose-50 border border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/20 rounded-2xl p-4 flex items-center justify-between group hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors shadow-sm cursor-pointer">
          <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
            <AlertTriangle className="w-6 h-6 shrink-0" />
            <div className="font-semibold text-sm sm:text-base">
              ⚠️ {produitsEnAlerte} produit(s) en rupture ou sous le seuil d'alerte ! Cliquez ici pour les voir.
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-rose-500 transform group-hover:translate-x-1 transition-transform" />
        </Link>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/catalogue" className="bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20 ring-1 ring-rose-200 dark:ring-rose-500/30 px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2">
            <Package className="w-4 h-4" /> Nouveau Produit
          </Link>
          <Link href="/clients" className="bg-fuchsia-50 dark:bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 hover:bg-fuchsia-100 dark:hover:bg-fuchsia-500/20 ring-1 ring-fuchsia-200 dark:ring-fuchsia-500/30 px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2">
            <Activity className="w-4 h-4" /> Nouveau Client
          </Link>
          <Link href="/reassort" className="bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-500/20 ring-1 ring-orange-200 dark:ring-orange-500/30 px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4" /> Nouveau Réassort
          </Link>
          <Link href="/mouvements" className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm flex items-center gap-2 ml-auto sm:ml-0">
            <FileText className="w-4 h-4" /> Mouvement manuel
          </Link>
          <div className="ml-auto sm:ml-0">
            <ExportExcelComptableButton dataReserve={dataReserve} dataClients={dataClients} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPIs */}
        <div className="rounded-xl border bg-linear-to-br from-white to-rose-50/30 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-rose-100 p-3 text-rose-600 shadow-inner">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Total Produits</p>
              <h2 className="text-2xl font-black text-gray-900 dark:text-zinc-50 mt-1">{produitsCount}</h2>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-linear-to-br from-white to-fuchsia-50/30 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-fuchsia-100 p-3 text-fuchsia-600 shadow-inner">
              <HeartPulse className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Clients Actifs</p>
              <h2 className="text-2xl font-black text-gray-900 dark:text-zinc-50 mt-1">{clientsActifsCount}</h2>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-linear-to-br from-white to-orange-50/30 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-orange-100 p-3 text-orange-600 shadow-inner">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Valeur en Réserve</p>
              <h2 className="text-2xl font-black text-gray-900 dark:text-zinc-50 mt-1">{valeurTotaleReserve.toFixed(2)} €</h2>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-linear-to-br from-white to-purple-50/30 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-purple-100 p-3 text-purple-600 shadow-inner">
              <Stethoscope className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Valeur en Cabine</p>
              <h2 className="text-2xl font-black text-gray-900 dark:text-zinc-50 mt-1">{valeurTotaleClients.toFixed(2)} €</h2>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-linear-to-br from-white to-red-50/30 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-red-100 p-3 text-red-600 shadow-inner">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Alertes Stock</p>
              <h2 className="text-2xl font-black text-gray-900 dark:text-zinc-50 mt-1">{produitsEnAlerte}</h2>
            </div>
          </div>
        </div>
      </div>

      <DashboardCharts mouvementsRecents={recentMouvements} produits={produits} />

      <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
        {/* Top 3 Immobilisations */}
        <div className="rounded-xl border bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
          <div className="border-b bg-gray-50 dark:bg-zinc-950/50 px-6 py-4 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-zinc-50">Capital Immobilisé (Top 3)</h3>
          </div>
          <div className="p-6 space-y-4">
            {topImmobilisations.map((item, index) => (
              <div key={item.produit.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-700 font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-zinc-50 line-clamp-1 text-sm">{item.produit.designation}</p>
                    <p className="text-xs text-gray-500 dark:text-zinc-400">{item.produit.reference}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 dark:text-zinc-50">{item.valeur.toFixed(2)} €</p>
                </div>
              </div>
            ))}
            {topImmobilisations.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-zinc-400 text-center py-4">Aucune donnée financière.</p>
            )}
          </div>
        </div>
        {/* Alertes de stock */}
        <div className="rounded-xl border bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
          <div className="border-b bg-gray-50 dark:bg-zinc-950/50 px-6 py-4 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-zinc-50">Produits à recommander</h3>
            <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded-full">{produitsEnAlerte} alertes</span>
          </div>
          <div className="p-6">
              {produits.map((produit: any) => {
                const stockInfo = calculerStockProduit(produit, produit.mouvements)
                if (!stockInfo.enAlerte) return null;

                // Trouver le dernier mouvement qui a fait baisser le stock
                const derniersMouvements = (produit.mouvements || []).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
                const dernierMvt = derniersMouvements.find((m: any) => m.type === 'Depart' || m.type === 'Consomme' || m.type === 'Perte');
                let raison = "";
                if (dernierMvt) {
                  raison = `Dernière baisse : ${dernierMvt.type} (${dernierMvt.quantite}) le ${new Date(dernierMvt.date).toLocaleDateString('fr-FR')}`;
                }

                // Quantité à commander = (seuil * 2) - stock
                const aCommander = Math.max(0, (produit.stockMinimum * 2) - stockInfo.stockReserve);

                return (
                  <div key={produit.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="mt-1 h-2 w-2 rounded-full bg-red-500"></div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-zinc-50">{produit.designation}</p>
                        <p className="text-xs text-gray-500 dark:text-zinc-400">{produit.reference}</p>
                        {raison && <p className="text-xs text-orange-600 mt-1">{raison}</p>}
                      </div>
                    </div>
                    <div className="text-right flex flex-col gap-1">
                      <div className="flex flex-col items-end">
                        <span className="font-bold text-red-600">{stockInfo.stockReserve} {produit.unite}</span>
                        <span className="text-xs text-gray-500 dark:text-zinc-400">Seuil: {produit.stockMinimum}</span>
                      </div>
                      {aCommander > 0 && (
                        <div className="bg-rose-50 text-rose-700 text-xs px-2 py-1 rounded-md mt-1">
                          À commander : <b>{aCommander}</b>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
              {produitsEnAlerte === 0 && (
                <div className="p-8 text-center text-gray-500 dark:text-zinc-400 text-sm">
                  Aucun produit en rupture de stock.
                </div>
              )}
            
            {alertesDetails.length > 5 && (
              <div className="p-3 text-center bg-gray-50 dark:bg-zinc-950">
                <Link href="/catalogue" className="text-sm font-medium text-rose-600 hover:underline">
                  Voir toutes les alertes
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Historique récent */}
        <div className="rounded-xl border bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
          <div className="border-b bg-gray-50 dark:bg-zinc-950/50 px-6 py-4 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-zinc-50">Activité récente</h3>
            <Link href="/mouvements" className="text-sm text-rose-600 hover:underline">Voir tout</Link>
          </div>
          <div className="divide-y">
            {recentMouvements.length > 0 ? recentMouvements.map((mvt) => (
              <div key={mvt.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-zinc-800/50 dark:bg-zinc-950">
                <div className={`rounded-full p-2 ${
                  mvt.type === 'Depart' ? 'bg-orange-100 text-orange-600' :
                  mvt.type === 'Retour' ? 'bg-rose-100 text-rose-600' :
                  mvt.type === 'Consomme' ? 'bg-purple-100 text-purple-600' :
                  'bg-fuchsia-100 text-fuchsia-600'
                }`}>
                  {mvt.type === 'Depart' ? <ArrowRight className="h-4 w-4" /> : 
                   mvt.type === 'Retour' ? <TrendingDown className="h-4 w-4" /> :
                   <Package className="h-4 w-4" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-zinc-50">
                    {mvt.quantite}x {mvt.produit.reference}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-zinc-400">
                    {mvt.type} {mvt.client ? `- ${mvt.client.nom}` : ''}
                  </p>
                </div>
                <div className="text-xs text-gray-400 dark:text-zinc-500">
                  {new Date(mvt.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                </div>
              </div>
            )) : (
              <div className="p-8 text-center text-gray-500 dark:text-zinc-400 text-sm">
                Aucun mouvement récent.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
