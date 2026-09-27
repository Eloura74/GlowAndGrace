import { Article, Mouvement } from "@prisma/client"

export type StockInfo = {
  stockInitial: number
  stockPharmacie: number
  stockPatientsTotal: number
  enAlerte: boolean
}

/**
 * Calcule les stocks réels d'un article en se basant sur ses mouvements.
 * 
 * Logique:
 * Stock Pharmacie = Stock Initial + Achat + Retour - Depart - Perte - Consomme (si consommé au pharmacie, rare mais possible)
 * Stock Patient = Depart (vers ce patient) - Retour (de ce patient) - Consomme (sur ce patient) - Perte (sur ce patient)
 */
export function calculerStockArticle(article: Article, mouvements: Mouvement[]): StockInfo {
  let stockPharmacie = article.stockInitial
  let stockPatientsTotal = 0

  mouvements.forEach(mvt => {
    switch (mvt.type) {
      case "Achat":
      case "Correction":
        stockPharmacie += mvt.quantite
        break
      case "Depart":
        stockPharmacie -= mvt.quantite
        stockPatientsTotal += mvt.quantite
        break
      case "Retour":
        stockPatientsTotal -= mvt.quantite
        stockPharmacie += mvt.quantite
        break
      case "Consomme":
      case "Perte":
        if (mvt.patientId) {
          stockPatientsTotal -= mvt.quantite
        } else {
          stockPharmacie -= mvt.quantite
        }
        break
    }
  })

  // Auto-correction : si le stock patient est négatif, c'est que l'utilisateur 
  // a fait un "Consommé" sur patient sans faire de "Départ" au préalable.
  // On déduit donc ce manque directement du pharmacie.
  if (stockPatientsTotal < 0) {
    stockPharmacie += stockPatientsTotal; // += car stockPatientsTotal est négatif
    stockPatientsTotal = 0;
  }

  return {
    stockInitial: article.stockInitial,
    stockPharmacie,
    stockPatientsTotal,
    enAlerte: stockPharmacie <= article.stockMinimum
  }
}

/**
 * Calcule le matériel restant (déployé) sur un patient spécifique
 */
export function calculerResteSurPatient(mouvementsPatient: Mouvement[]): Record<string, number> {
  const stockParArticle: Record<string, number> = {}

  mouvementsPatient.forEach(mvt => {
    const artId = mvt.articleId
    if (stockParArticle[artId] === undefined) {
      stockParArticle[artId] = 0
    }

    if (mvt.type === "Depart") {
      stockParArticle[artId] += mvt.quantite
    } else if (mvt.type === "Retour" || mvt.type === "Consomme" || mvt.type === "Perte") {
      stockParArticle[artId] -= mvt.quantite
    }
  })

  // Auto-correction pour l'affichage (ne pas afficher de stock négatif)
  Object.keys(stockParArticle).forEach(artId => {
    if (stockParArticle[artId] < 0) {
      stockParArticle[artId] = 0
    }
  })

  return stockParArticle
}
