import { getProduits } from "@/app/actions/produits"
import { calculerStockProduit } from "@/lib/stockUtils"
import { ShoppingCart } from "lucide-react"
import { CommandeFournisseurCard } from "@/components/CommandeFournisseurCard"

export default async function ReassortPage() {
  const produits = await getProduits()
  
  // Filtrer les produits en alerte
  const aCommander = produits.map(produit => {
    const stockInfo = calculerStockProduit(produit, produit.mouvements)
    return { produit, stockInfo }
  }).filter(item => item.stockInfo.enAlerte)

  // Grouper par fournisseur (le nom du fournisseur)
  const parFournisseur = aCommander.reduce((acc: any, item: any) => {
    const fn = item.produit.fournisseur || "Fournisseur Inconnu"
    if (!acc[fn]) acc[fn] = []
    acc[fn].push(item)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-50">Réassort & Commandes</h1>
      </div>

      {Object.keys(parFournisseur).length === 0 ? (
        <div className="rounded-xl border bg-white dark:bg-zinc-900 p-12 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
            <ShoppingCart className="h-6 w-6 text-emerald-600" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-zinc-50">Tout est en ordre !</h3>
          <p className="mt-2 text-gray-500 dark:text-zinc-400">Aucun produit n'est actuellement sous son seuil d'alerte.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(parFournisseur).map(([fournisseur, items]: [string, any]) => {
            const orderItems = items.map((item: any) => {
              const qteRecommandee = Math.max(0, (item.produit.stockMinimum * 2) - item.stockInfo.stockReserve)
              const quantiteParBoite = item.produit.quantiteParBoite || 1
              const boitesACommander = Math.ceil(qteRecommandee / quantiteParBoite)
              const suggestedQuantity = boitesACommander * quantiteParBoite

              return {
                produitId: item.produit.id,
                designation: item.produit.designation,
                reference: item.produit.reference,
                referenceFournisseur: item.produit.referenceFournisseur,
                stockReserve: item.stockInfo.stockReserve,
                stockMinimum: item.produit.stockMinimum,
                quantiteParBoite,
                unite: item.produit.unite,
                suggestedQuantity
              }
            })

            return (
              <CommandeFournisseurCard 
                key={fournisseur} 
                fournisseur={fournisseur} 
                items={orderItems} 
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
