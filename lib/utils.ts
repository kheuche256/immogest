import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatMontant(montant: number): string {
  return new Intl.NumberFormat('fr-FR').format(montant) + ' FCFA'
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('fr-FR')
}
