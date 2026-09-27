"use client";

import { useState } from "react";
import { ShoppingCart, Check, FileDown, Mail } from "lucide-react";

interface OrderItem {
  articleId: string;
  designation: string;
  reference: string;
  referenceFournisseur?: string;
  stockPharmacie: number;
  stockMinimum: number;
  quantiteParBoite: number;
  unite?: string;
  suggestedQuantity: number;
}

interface Props {
  fournisseur: string;
  items: OrderItem[];
}

export function CommandeFournisseurCard({ fournisseur, items }: Props) {
  const [quantities, setQuantities] = useState<Record<string, number>>(
    items.reduce((acc, item) => ({ ...acc, [item.articleId]: item.suggestedQuantity }), {})
  );

  return (
    <div className="bg-white dark:bg-zinc-900 border rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 border-b bg-gray-50 dark:bg-zinc-950 flex items-center justify-between">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-blue-600" />
          {fournisseur}
        </h3>
        <div className="flex gap-2">
          <button className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-1.5">
            <Mail className="h-4 w-4" /> Envoyer par email
          </button>
        </div>
      </div>
      <div className="p-0 overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 bg-gray-50 dark:bg-zinc-950 dark:text-gray-400">
            <tr>
              <th className="px-4 py-3">Réf / Désignation</th>
              <th className="px-4 py-3 text-center">Stock Actuel</th>
              <th className="px-4 py-3 text-center">Seuil Alerte</th>
              <th className="px-4 py-3 text-center">Qté à Commander</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-zinc-800">
            {items.map((item) => (
              <tr key={item.articleId} className="hover:bg-gray-50 dark:hover:bg-zinc-900/50">
                <td className="px-4 py-3">
                  <div className="font-medium">{item.designation}</div>
                  <div className="text-xs text-gray-500">{item.reference} {item.referenceFournisseur && `(Fournisseur: ${item.referenceFournisseur})`}</div>
                </td>
                <td className="px-4 py-3 text-center text-red-600 font-bold">{item.stockPharmacie}</td>
                <td className="px-4 py-3 text-center text-gray-500">{item.stockMinimum}</td>
                <td className="px-4 py-3 text-center">
                  <input
                    type="number"
                    min="1"
                    className="w-20 text-center border rounded-md p-1 dark:bg-zinc-800 dark:border-zinc-700"
                    value={quantities[item.articleId] || 0}
                    onChange={(e) => setQuantities({ ...quantities, [item.articleId]: parseInt(e.target.value) || 0 })}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
