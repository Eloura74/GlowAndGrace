"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, Users, Scissors, FileText, ArrowRightLeft, PackageSearch, LogOut, Menu, X, Sparkles, Wand2 } from "lucide-react";
import { logout } from "@/app/actions/auth";
import { ThemeToggle } from "./ThemeToggle";

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { href: "/", label: "Tableau de bord", icon: Home },
    { href: "/catalogue", label: "Produits", icon: Package },
    { href: "/clients", label: "Clients", icon: Users },
    { href: "/cabine", label: "En Cabine", icon: Sparkles },
    { href: "/equipement", label: "Équipements", icon: Wand2 },
    { href: "/inventaire", label: "Inventaire", icon: PackageSearch },
    { href: "/mouvements", label: "Mouvements", icon: FileText },
    { href: "/reassort", label: "Réassort", icon: ArrowRightLeft },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <div className="flex h-dvh w-64 flex-col border-r bg-rose-50/30 dark:bg-zinc-950/40 px-4 py-6 shadow-sm">
          <div className="flex items-center gap-2 px-2 pb-6">
            <Sparkles className="h-6 w-6 text-rose-500" />
            <span className="text-lg font-bold tracking-tight text-rose-950 dark:text-rose-200">Glow&Grace</span>
          </div>
          
          <nav className="flex flex-1 flex-col gap-1 text-sm font-medium">
            {links.map((link) => {
              const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href !== "/");
              const Icon = link.icon;
              return (
                <Link 
                  key={link.href}
                  href={link.href} 
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                    isActive 
                      ? "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300" 
                      : "text-gray-500 dark:text-zinc-400 hover:bg-rose-50 hover:text-rose-900 dark:hover:bg-zinc-800 dark:hover:text-gray-50"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {link.label}
                </Link>
              )
            })}
          </nav>
          
          <div className="mt-auto pt-4 border-t border-rose-100 dark:border-gray-800 space-y-2">
            <div className="flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400">
              Thème
              <ThemeToggle />
            </div>
            <form action={logout}>
              <button 
                type="submit" 
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors dark:text-rose-400 dark:hover:bg-rose-900/30"
              >
                <LogOut className="h-5 w-5" />
                <span className="font-medium text-sm">Déconnexion</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <button 
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-rose-500 text-white p-4 rounded-full shadow-xl shadow-rose-500/30 active:scale-95 transition-transform"
        >
          <Menu className="h-7 w-7" />
        </button>

        {isOpen && (
          <div className="fixed inset-0 z-50 bg-white dark:bg-zinc-900 flex flex-col animate-in slide-in-from-bottom-2 fade-in duration-200">
            <div className="flex justify-between items-center p-4 border-b dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center gap-3">
                <Sparkles className="h-7 w-7 text-rose-500" />
                <span className="text-2xl font-black tracking-tight dark:text-white">Glow&Grace</span>
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-3 bg-rose-50 dark:bg-zinc-800 hover:bg-rose-100 rounded-full text-rose-600 dark:text-gray-300 transition-colors"
                >
                  <X className="h-7 w-7" />
                </button>
              </div>
            </div>
            <nav className="flex-1 overflow-y-auto p-4 space-y-3 pb-24 dark:bg-zinc-950">
              {links.map((link) => {
                const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href !== "/");
                const Icon = link.icon;
                return (
                  <Link 
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${
                      isActive 
                        ? "bg-rose-50 text-rose-700 font-bold border border-rose-100 shadow-sm" 
                        : "bg-gray-50 dark:bg-zinc-950 text-gray-700 dark:text-zinc-200 font-medium border border-transparent hover:border-rose-100"
                    }`}
                  >
                    <Icon className={`h-6 w-6 ${isActive ? 'text-rose-600' : 'text-gray-400'}`} />
                    <span className="text-lg">{link.label}</span>
                  </Link>
                )
              })}
              
              <div className="mt-8 pt-4 border-t border-gray-100 dark:border-zinc-800">
                <form action={logout}>
                  <button 
                    type="submit" 
                    className="flex w-full items-center gap-4 p-4 rounded-2xl bg-rose-50 text-rose-700 font-bold border border-rose-100 hover:bg-rose-100 transition-colors"
                  >
                    <LogOut className="h-6 w-6 text-rose-600" />
                    <span className="text-lg">Déconnexion</span>
                  </button>
                </form>
              </div>
            </nav>
          </div>
        )}
      </div>
    </>
  );
}

