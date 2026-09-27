import { Produit, Mouvement } from "@prisma/client"

export type StockInfo = {
  stockInitial: number
  stockReserve: number
  stockClientsTotal: number
  enAlerte: boolean
}

/**
 * Calcule les stocks réels d'un produit en se basant sur ses mouvements.
 * 
 * Logique:
 * Stock Reserve = Stock Initial + Achat + Retour - Depart - Perte - Consomme (si consommé au reserve, rare mais possible)
 * Stock Client = Depart (vers ce client) - Retour (de ce client) - Consomme (sur ce client) - Perte (sur ce client)
 */
export function calculerStockProduit(produit: Produit, mouvements: Mouvement[]): StockInfo {
  let stockReserve = produit.stockInitial
  let stockClientsTotal = 0

  mouvements.forEach(mvt => {
    switch (mvt.type) {
      case "Achat":
      case "Correction":
        stockReserve += mvt.quantite
        break
      case "Depart":
        stockReserve -= mvt.quantite
        stockClientsTotal += mvt.quantite
        break
      case "Retour":
        stockClientsTotal -= mvt.quantite
        stockReserve += mvt.quantite
        break
      case "Consomme":
      case "Perte":
        if (mvt.clientId) {
          stockClientsTotal -= mvt.quantite
        } else {
          stockReserve -= mvt.quantite
        }
        break
    }
  })

  // Auto-correction : si le stock client est négatif, c'est que l'utilisateur 
  // a fait un "Consommé" sur client sans faire de "Départ" au préalable.
  // On déduit donc ce manque directement du reserve.
  if (stockClientsTotal < 0) {
    stockReserve += stockClientsTotal; // += car stockClientsTotal est négatif
    stockClientsTotal = 0;
  }

  return {
    stockInitial: produit.stockInitial,
    stockReserve,
    stockClientsTotal,
    enAlerte: stockReserve <= produit.stockMinimum
  }
}

/**
 * Calcule le matériel restant (déployé) sur un client spécifique
 */
export function calculerResteSurClient(mouvementsClient: Mouvement[]): Record<string, number> {
  const stockParProduit: Record<string, number> = {}

  mouvementsClient.forEach(mvt => {
    const artId = mvt.produitId
    if (stockParProduit[artId] === undefined) {
      stockParProduit[artId] = 0
    }

    if (mvt.type === "Depart") {
      stockParProduit[artId] += mvt.quantite
    } else if (mvt.type === "Retour" || mvt.type === "Consomme" || mvt.type === "Perte") {
      stockParProduit[artId] -= mvt.quantite
    }
  })

  // Auto-correction pour l'affichage (ne pas afficher de stock négatif)
  Object.keys(stockParProduit).forEach(artId => {
    if (stockParProduit[artId] < 0) {
      stockParProduit[artId] = 0
    }
  })

  return stockParProduit
}
