'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useInventaire } from '@/hooks/useInventaire'
import { useBiens } from '@/hooks/useBiens'
import type { InventaireArticle } from '@/types'
import {
  Package,
  Plus,
  Search,
  Home,
  Sofa,
  Bed,
  UtensilsCrossed,
  Palette,
  Wrench,
  MoreHorizontal,
  Edit,
  Trash2,
  Check,
  X,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Loader2,
  TrendingUp,
  Cpu,
} from 'lucide-react'
import toast from 'react-hot-toast'

// ── Config catégories ──────────────────────────────────────────────────────────
const CAT_CONFIG: Record<string, {
  icon: React.ElementType; color: string; bg: string; label: string
}> = {
  mobilier:       { icon: Sofa,           color: '#8B4513', bg: '#FFF5EB', label: 'Mobilier'        },
  electromenager: { icon: Cpu,            color: '#0EA5E9', bg: '#E0F2FE', label: 'Électroménager'   },
  literie:        { icon: Bed,            color: '#8B5CF6', bg: '#EDE9FE', label: 'Literie'          },
  cuisine:        { icon: UtensilsCrossed,color: '#F59E0B', bg: '#FEF3C7', label: 'Cuisine'          },
  decoration:     { icon: Palette,        color: '#EC4899', bg: '#FCE7F3', label: 'Décoration'       },
  equipement:     { icon: Wrench,         color: '#10B981', bg: '#D1FAE5', label: 'Équipement'       },
  autre:          { icon: MoreHorizontal, color: '#6B7280', bg: '#F3F4F6', label: 'Autre'            },
}

// ── Config états ───────────────────────────────────────────────────────────────
const ETAT_CONFIG: Record<string, {
  color: string; bg: string; label: string; icon: React.ElementType
}> = {
  neuf:        { color: '#22C55E', bg: '#F0FDF4', label: 'Neuf',         icon: CheckCircle  },
  bon:         { color: '#556B2F', bg: '#F0F5E8', label: 'Bon état',     icon: CheckCircle  },
  use:         { color: '#F59E0B', bg: '#FEF3C7', label: 'Usé',          icon: AlertTriangle },
  a_remplacer: { color: '#DC2626', bg: '#FEF2F2', label: 'À remplacer',  icon: AlertTriangle },
}

function fmt(n: number) {
  return new Intl.NumberFormat('fr-FR').format(n)
}

// ── Ligne item ─────────────────────────────────────────────────────────────────
function ItemRow({
  item,
  catColor,
  onDelete,
  deleteId,
  setDeleteId,
  deleting,
}: {
  item: InventaireArticle
  catColor: string
  onDelete: (id: string) => void
  deleteId: string | null
  setDeleteId: (id: string | null) => void
  deleting: boolean
}) {
  const etat     = ETAT_CONFIG[item.etat] ?? ETAT_CONFIG.bon
  const EtatIcon = etat.icon

  return (
    <div className="px-4 py-3 flex items-center gap-3">
      {/* Quantité */}
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
        style={{ backgroundColor: catColor }}
      >
        {item.quantite}
      </div>

      {/* Infos */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate" style={{ color: '#5D3A1A' }}>
          {item.nom}
        </p>
        <div className="flex items-center gap-1 text-xs" style={{ color: '#8B7355' }}>
          <Home className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{item.bien?.nom ?? '—'}</span>
        </div>
      </div>

      {/* État */}
      <span
        className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium flex-shrink-0"
        style={{ backgroundColor: etat.bg, color: etat.color }}
      >
        <EtatIcon className="w-3 h-3" />
        {etat.label}
      </span>

      {/* Valeur */}
      {item.valeur ? (
        <p className="hidden md:block text-sm font-semibold flex-shrink-0" style={{ color: '#5D3A1A' }}>
          {fmt(item.valeur)} F
        </p>
      ) : null}

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <Link
          href={`/inventaire/${item.id}/modifier`}
          className="p-1.5 rounded-lg transition-all hover:bg-amber-50"
          style={{ color: '#8B7355' }}
        >
          <Edit className="w-4 h-4" />
        </Link>

        {deleteId === item.id ? (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onDelete(item.id)}
              disabled={deleting}
              className="p-1.5 rounded-lg text-white transition-all"
              style={{ backgroundColor: '#DC2626' }}
            >
              {deleting
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <Check className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => setDeleteId(null)}
              className="p-1.5 rounded-lg"
              style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setDeleteId(item.id)}
            className="p-1.5 rounded-lg transition-all hover:bg-red-50"
            style={{ color: '#DC2626' }}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}

// ── Page principale ────────────────────────────────────────────────────────────
export default function InventairePage() {
  const { items, isLoading, stats, deleteItem } = useInventaire()
  const { biens } = useBiens()

  const [search,      setSearch]      = useState('')
  const [bienFilter,  setBienFilter]  = useState('tous')
  const [expanded,    setExpanded]    = useState<Record<string, boolean>>({})
  const [deleteId,    setDeleteId]    = useState<string | null>(null)
  const [deleting,    setDeleting]    = useState(false)

  // ── Filtres ────────────────────────────────────────────────────────────────
  const filtered = items.filter(i => {
    const matchSearch = !search || i.nom.toLowerCase().includes(search.toLowerCase())
    const matchBien   = bienFilter === 'tous' || i.bien_id === bienFilter
    return matchSearch && matchBien
  })

  // Grouper les items filtrés par catégorie
  const parCat = filtered.reduce<Record<string, InventaireArticle[]>>((acc, i) => {
    const c = i.categorie
    if (!acc[c]) acc[c] = []
    acc[c].push(i)
    return acc
  }, {})

  // ── Expand/collapse ────────────────────────────────────────────────────────
  const toggle = (cat: string) =>
    setExpanded(prev => ({ ...prev, [cat]: !prev[cat] }))

  const isExpanded = (cat: string) =>
    expanded[cat] !== false  // ouvert par défaut

  // ── Suppression ────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    setDeleting(true)
    const { error } = await deleteItem(id)
    setDeleting(false)
    setDeleteId(null)
    if (error) toast.error('Erreur lors de la suppression')
    else       toast.success('Item supprimé')
  }

  // ── Biens meublés pour le filtre ──────────────────────────────────────────
  const biensMeubles = biens.filter(b => b.est_meuble)

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#5D3A1A' }}>Inventaire</h1>
          <p className="text-sm" style={{ color: '#8B7355' }}>
            Meubles et équipements de vos biens meublés
          </p>
        </div>
        <Link
          href="/inventaire/nouveau"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white text-sm transition-all hover:opacity-90 w-fit"
          style={{ backgroundColor: '#8B4513' }}
        >
          <Plus className="w-4 h-4" />
          Ajouter un item
        </Link>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total items',    value: stats.total,                      color: '#8B4513' },
          { label: 'Valeur totale',  value: `${fmt(stats.valeurTotale)} F`,   color: '#DAA520' },
          { label: 'Bon état',       value: stats.neuf + stats.bon,           color: '#556B2F' },
          { label: 'Usés',           value: stats.use,                        color: '#F59E0B' },
          { label: 'À remplacer',    value: stats.aRemplacer,                 color: '#DC2626' },
        ].map((card, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 border" style={{ borderColor: '#F0E6D8' }}>
            <p className="text-2xl font-bold" style={{ color: card.color }}>{card.value}</p>
            <p className="text-xs mt-1" style={{ color: '#8B7355' }}>{card.label}</p>
          </div>
        ))}
      </div>

      {/* ── Filtres ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#8B7355' }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un item…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 text-sm outline-none transition-all"
            style={{ borderColor: '#F0E6D8', backgroundColor: '#FFFFFF', color: '#5D3A1A' }}
            onFocus={e => { e.target.style.borderColor = '#8B4513' }}
            onBlur={e  => { e.target.style.borderColor = '#F0E6D8'  }}
          />
        </div>
        <select
          value={bienFilter}
          onChange={e => setBienFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border-2 text-sm outline-none"
          style={{ borderColor: '#F0E6D8', backgroundColor: '#FFFFFF', color: '#5D3A1A' }}
        >
          <option value="tous">Tous les biens meublés</option>
          {biensMeubles.map(b => (
            <option key={b.id} value={b.id}>{b.nom}</option>
          ))}
        </select>
      </div>

      {/* ── Contenu ── */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#8B4513' }} />
        </div>

      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border" style={{ borderColor: '#F0E6D8' }}>
          <Package className="w-16 h-16 mx-auto mb-4 opacity-20" style={{ color: '#8B7355' }} />
          <h3 className="text-lg font-bold mb-2" style={{ color: '#5D3A1A' }}>
            {search || bienFilter !== 'tous' ? 'Aucun résultat' : 'Inventaire vide'}
          </h3>
          <p className="text-sm mb-6" style={{ color: '#8B7355' }}>
            {search || bienFilter !== 'tous'
              ? 'Modifiez vos critères de recherche'
              : 'Commencez par ajouter des meubles et équipements'}
          </p>
          {!search && bienFilter === 'tous' && (
            <Link
              href="/inventaire/nouveau"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white text-sm hover:opacity-90"
              style={{ backgroundColor: '#8B4513' }}
            >
              <Plus className="w-4 h-4" />
              Ajouter un item
            </Link>
          )}
        </div>

      ) : (
        <div className="space-y-4">
          {Object.entries(parCat).map(([categorie, catItems]) => {
            const cfg  = CAT_CONFIG[categorie] ?? CAT_CONFIG.autre
            const Icon = cfg.icon
            const open = isExpanded(categorie)

            return (
              <div
                key={categorie}
                className="bg-white rounded-2xl border overflow-hidden"
                style={{ borderColor: '#F0E6D8' }}
              >
                {/* ── Header catégorie ── */}
                <button
                  onClick={() => toggle(categorie)}
                  className="w-full px-4 py-3 flex items-center justify-between transition-all hover:opacity-90"
                  style={{ backgroundColor: cfg.bg }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${cfg.color}20` }}
                    >
                      <Icon className="w-4 h-4" style={{ color: cfg.color }} />
                    </div>
                    <span className="font-bold text-sm" style={{ color: '#5D3A1A' }}>
                      {cfg.label}
                    </span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-semibold"
                      style={{ backgroundColor: 'rgba(255,255,255,0.7)', color: cfg.color }}
                    >
                      {catItems.length} item{catItems.length > 1 ? 's' : ''}
                    </span>
                    {/* Valeur catégorie */}
                    {catItems.some(i => i.valeur) && (
                      <span className="text-xs hidden sm:block" style={{ color: '#8B7355' }}>
                        · {fmt(catItems.reduce((s, i) => s + (i.valeur ?? 0), 0))} F
                      </span>
                    )}
                  </div>
                  {open
                    ? <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: '#8B7355' }} />
                    : <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: '#8B7355' }} />}
                </button>

                {/* ── Items ── */}
                {open && (
                  <div className="divide-y" style={{ borderColor: '#F9F3EC' }}>
                    {catItems.map(item => (
                      <ItemRow
                        key={item.id}
                        item={item}
                        catColor={cfg.color}
                        onDelete={handleDelete}
                        deleteId={deleteId}
                        setDeleteId={setDeleteId}
                        deleting={deleting}
                      />
                    ))}
                  </div>
                )}
              </div>
            )
          })}

          {/* ── Récap valeur totale ── */}
          {stats.valeurTotale > 0 && (
            <div
              className="rounded-2xl border p-4 flex items-center gap-3"
              style={{ backgroundColor: '#FDF8E8', borderColor: '#F0E6D8' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#DAA520' }}
              >
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-sm" style={{ color: '#5D3A1A' }}>
                  Valeur totale de l'inventaire : {fmt(stats.valeurTotale)} FCFA
                </p>
                <p className="text-xs" style={{ color: '#8B7355' }}>
                  {stats.total} items répartis sur {stats.categories} catégorie{stats.categories > 1 ? 's' : ''}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
