'use client'

import { useState, useEffect } from 'react'
import {
  Copy, Check, Smartphone, Building2, CreditCard, Hash,
  MapPin, Mail, FileText, Landmark, ExternalLink, ChevronDown, ChevronUp, Link2,
  Calculator, ChevronRight, Search, X as XIcon,
} from 'lucide-react'

const S = {
  bg:           '#060608',
  card:         '#0c0c14',
  border:       '#1a1a28',
  borderLight:  'rgba(180,185,210,0.18)',
  silver:       '#b8bcc8',
  silverBright: '#d4d8e8',
  silverDim:    '#3a3e4a',
}

/* ─── Tipos ─────────────────────────────────────────────────────────────── */
type LinkItem = { nombre: string; precio: string; url?: string }
type Subseccion = { titulo: string; items: LinkItem[] }

/* ─── Datos de cuenta ───────────────────────────────────────────────────── */
const ZELLE = [
  { label: 'Cuenta',   value: 'SINERGETICOS LLC',     icon: <Building2 size={14} /> },
  { label: 'Teléfono', value: '(305) 903 2686',        icon: <Smartphone size={14} /> },
  { label: 'Correo',   value: 'jmdeleon@zigma3.com',   icon: <Mail size={14} /> },
]
const FISCALES = [
  { label: 'Razón Social',  value: 'JAC/ SAPI DE CV',                          icon: <Building2 size={14} /> },
  { label: 'RFC',           value: 'JAC2001305B8',                              icon: <Hash size={14} /> },
  { label: 'Dirección',     value: 'Colima 130 El Mante, Zapopan, Jalisco CP. 45235', icon: <MapPin size={14} /> },
  { label: 'Correo',        value: 'sdominguez@aslcorporativo.com',             icon: <Mail size={14} /> },
  { label: 'Uso de CFDI',   value: 'Gastos en General',                         icon: <FileText size={14} /> },
  { label: 'Forma de Pago', value: 'Transferencia Electrónica de Fondos',       icon: <CreditCard size={14} /> },
]
const BANCARIOS = [
  { label: 'Banco',  value: 'SANTANDER',         icon: <Landmark size={14} /> },
  { label: 'Cuenta', value: '65508021375',        icon: <CreditCard size={14} /> },
  { label: 'CLABE',  value: '014320655080213750', icon: <Hash size={14} /> },
]

/* ─── Black Access / Bootcamp ───────────────────────────────────────────── */
const BLACK_ACCESS: Subseccion[] = [
  {
    titulo: 'BOOTCAMP MEX PAUTA',
    items: [
      { nombre: 'BOOTCAMP MEX PAUTA · 05,06 Y 07 DE JUNIO', precio: '$13,036', url: 'https://bootcampsinergetico.com/?utm_source=clubsinergetico' },
      { nombre: 'BOLETERA BOOTCAMP (WhatsApp)',             precio: '$13,036', url: 'https://go.wha.link/b8B1We' },
    ],
  },
  {
    titulo: 'LINKS OFICIALES CON REGISTRO TODO EL MUNDO',
    items: [
      { nombre: 'CHECKOUT BLACK ACCESS OFICIAL', precio: 'Ver link', url: 'https://synergyunlimited.com/' },
    ],
  },
  {
    titulo: 'LINKS MÉXICO BLACK',
    items: [
      { nombre: 'BLACK ACCESS 36,997 MXN',            precio: '$36,997 MXN', url: 'https://www.synergyforeducation.com/offers/bEcVEwrw' },
      { nombre: 'PASE DOBLE BLACK ACCESS 55,497 MXN', precio: '$55,497 MXN', url: 'https://www.synergyforeducation.com/offers/SkQRGRbe' },
    ],
  },
  {
    titulo: 'A MESES',
    items: [
      { nombre: 'BLACK ACCESS A MESES 42,916 MXN',    precio: '$42,916 MXN', url: 'https://buy.stripe.com/eVq28s5wo4k28fgetg7Rk1e' },
      { nombre: 'PASE DOBLE BLACK ACCESS 64,376 MXN', precio: '$64,376 MXN', url: 'https://buy.stripe.com/7sY00k9MEg2K3Z01Gu7Rk1f' },
    ],
  },
  {
    titulo: 'APARTADO CONTADO',
    items: [
      { nombre: 'BLACK ACCESS 9,999 MXN',             precio: '$9,999 MXN',  url: 'https://www.synergyforeducation.com/offers/QW4bS32r' },
      { nombre: 'PASE DOBLE BLACK ACCESS 15,999 MXN', precio: '$15,999 MXN', url: 'https://www.synergyforeducation.com/offers/nMxUDpQp' },
    ],
  },
  {
    titulo: 'APARTADO A MESES',
    items: [
      { nombre: 'BLACK ACCESS 11,599 MXN',            precio: '$11,599 MXN', url: 'https://buy.stripe.com/9B6cN68IAaIq8fgcl87Rk1g' },
      { nombre: 'PASE DOBLE BLACK ACCESS 18,558 MXN', precio: '$18,558 MXN', url: 'https://buy.stripe.com/7sYeVebUMdUCgLMgBo7Rk1h' },
    ],
  },
  {
    titulo: 'GENERAL CONTADO PAUTA',
    items: [
      { nombre: 'GENERAL ACCESS 5,997 MXN', precio: '$5,997 MXN', url: 'https://www.synergyforeducation.com/offers/sHf5tG7W' },
    ],
  },
  {
    titulo: 'GENERAL MESES PAUTA',
    items: [
      { nombre: 'GENERAL ACCESS 6,837 MXN', precio: '$6,837 MXN', url: 'https://buy.stripe.com/5kQcN69ME7we6783OC7Rk1i' },
    ],
  },
  {
    titulo: 'GENERAL CONTADO CLUB',
    items: [
      { nombre: 'GENERAL ACCESS 3,997 MXN', precio: '$3,997 MXN', url: 'https://www.synergyforeducation.com/offers/Q4LogqdV' },
    ],
  },
  {
    titulo: 'GENERAL MESES CLUB',
    items: [
      { nombre: 'GENERAL ACCESS 4,556 MXN', precio: '$4,556 MXN', url: 'https://buy.stripe.com/dRmcN65wo6sa5345WK7Rk1j' },
    ],
  },
  {
    titulo: 'VIP CONTADO PAUTA',
    items: [
      { nombre: 'GENERAL ACCESS 7,997 MXN', precio: '$7,997 MXN', url: 'https://www.synergyforeducation.com/offers/8dLZZrus' },
    ],
  },
  {
    titulo: 'VIP MESES PAUTA',
    items: [
      { nombre: 'GENERAL ACCESS 9,116 MXN', precio: '$9,116 MXN', url: 'https://buy.stripe.com/eVqdRa2kc4k20MOad07Rk1k' },
    ],
  },
  {
    titulo: 'VIP CONTADO CLUB',
    items: [
      { nombre: 'VIP ACCESS 5,997 MXN', precio: '$5,997 MXN', url: 'https://www.synergyforeducation.com/offers/vFAPaM3B' },
    ],
  },
  {
    titulo: 'VIP MESES CLUB',
    items: [
      { nombre: 'VIP ACCESS 6,836 MXN', precio: '$6,836 MXN', url: 'https://buy.stripe.com/6oU8wQ6As2bU7bc0Cq7Rk1l' },
    ],
  },
  {
    titulo: 'CENTURION CONTADO',
    items: [
      { nombre: 'CENTURION 90,000 MXN', precio: '$90,000 MXN', url: 'https://www.synergyforeducation.com/offers/VoBDAjgW' },
    ],
  },
  {
    titulo: 'CENTURION A MESES',
    items: [
      { nombre: 'CENTURION 104,000 MXN', precio: '$104,000 MXN', url: 'https://buy.stripe.com/bJedRacYQ6sa9jk0Cq7Rk1m' },
    ],
  },
  {
    titulo: 'CENTURION CONTADO DOBLE',
    items: [
      { nombre: 'CENTURION 144,000 MXN', precio: '$144,000 MXN', url: 'https://www.synergyforeducation.com/offers/wfLpTKeQ' },
    ],
  },
  {
    titulo: 'CENTURION A MESES DOBLE',
    items: [
      { nombre: 'CENTURION 167,000 MXN', precio: '$167,000 MXN', url: 'https://buy.stripe.com/14AbJ2bUM3fY8fg84S7Rk1n' },
    ],
  },
  {
    titulo: 'ABONO CENTURION CONTADO',
    items: [
      { nombre: 'ABONO CENTURION 55,997 MXN', precio: '$55,997 MXN', url: 'https://www.synergyforeducation.com/offers/LJtVB2Dm' },
    ],
  },
  {
    titulo: 'ABONO CENTURION A MESES',
    items: [
      { nombre: 'ABONO CENTURION 64,997 MXN', precio: '$64,997 MXN', url: 'https://buy.stripe.com/dRm5kEcYQ4k2cvwgBo7Rk1o' },
    ],
  },
  {
    titulo: 'ABONO CENTURION DOBLE CONTADO',
    items: [
      { nombre: 'ABONO CENTURION 91,997 MXN', precio: '$91,997 MXN', url: 'https://www.synergyforeducation.com/offers/tPTU7xdQ' },
    ],
  },
  {
    titulo: 'ABONO CENTURION DOBLE A MESES',
    items: [
      { nombre: 'CENTURION DOBLE A MESES 106,716 MXN', precio: '$106,716 MXN', url: 'https://buy.stripe.com/8x228s2kcaIqeDE5WK7Rk1p' },
    ],
  },
  {
    titulo: 'BLACK ACCESS CONTADO Y A MESES (USA)',
    items: [
      { nombre: 'BLACK ACCESS 1997 USD',            precio: '$1,997 USD', url: 'https://www.synergyforeducation.com/offers/ttDoMbie' },
      { nombre: 'PASE DOBLE BLACK ACCESS 2997 USD', precio: '$2,997 USD', url: 'https://www.synergyforeducation.com/offers/5Frzbkfk' },
      { nombre: 'APARTADO 499 USD',                 precio: '$499 USD',   url: 'https://www.synergyforeducation.com/offers/rE7ZWZea' },
      { nombre: 'APARTADO 799 USD',                 precio: '$799 USD',   url: 'https://www.synergyforeducation.com/offers/BKZNFA2P' },
    ],
  },
  {
    titulo: 'GENERAL CONTADO PAUTA (USA)',
    items: [
      { nombre: '297 USD', precio: '$297 USD', url: 'https://www.synergyforeducation.com/offers/oyzBqqCj' },
    ],
  },
  {
    titulo: 'GENERAL CONTADO CLUB (USA)',
    items: [
      { nombre: '197 USD', precio: '$197 USD', url: 'https://www.synergyforeducation.com/offers/uNJqZNRV' },
    ],
  },
  {
    titulo: 'VIP CONTADO PAUTA (USA)',
    items: [
      { nombre: '397 USD', precio: '$397 USD', url: 'https://www.synergyforeducation.com/offers/cipSNDwV' },
    ],
  },
  {
    titulo: 'VIP CONTADO CLUB (USA)',
    items: [
      { nombre: '297 USD', precio: '$297 USD', url: 'https://www.synergyforeducation.com/offers/4x5wRKH4' },
    ],
  },
  {
    titulo: 'CENTURION CONTADO (USA)',
    items: [
      { nombre: '4997 USD', precio: '$4,997 USD', url: 'https://www.synergyforeducation.com/offers/rdpUDkve' },
    ],
  },
  {
    titulo: 'CENTURION DOBLE CONTADO (USA)',
    items: [
      { nombre: '7997 USD', precio: '$7,997 USD', url: 'https://www.synergyforeducation.com/offers/LA9tfSqF' },
    ],
  },
  {
    titulo: 'ABONO CENTURION CONTADO (USA)',
    items: [
      { nombre: '3,000 USD', precio: '$3,000 USD', url: 'https://www.synergyforeducation.com/offers/2muzVugM' },
    ],
  },
  {
    titulo: 'ABONO CENTURION DOBLE CONTADO (USA)',
    items: [
      { nombre: '5,000 USD', precio: '$5,000 USD', url: 'https://www.synergyforeducation.com/offers/ry6JizC2' },
    ],
  },
  {
    titulo: 'LINKS LATAM',
    items: [
      { nombre: 'BLACK ACCESS LATAM',            precio: 'Ver link', url: 'https://pay.hotmart.com/Q106162772V?off=5o7ja6fi' },
      { nombre: 'PASE DOBLE BLACK ACCESS LATAM', precio: 'Ver link', url: 'https://pay.hotmart.com/O106162861G?off=y0uogpak' },
    ],
  },
]

/* ─── Links de pago ─────────────────────────────────────────────────────── */
const WEBINARS_LINKS: Subseccion[] = [
  {
    titulo: 'Links USA',
    items: [
      { nombre: 'Pago Club Total',        precio: '$1,499', url: 'https://www.synergyforeducation.com/offers/r7RycGhZ/checkout' },
      { nombre: 'Apartado $100',          precio: '$100',   url: 'https://buy.stripe.com/aEU8ynfpzeiNgjS02G' },
      { nombre: 'Apartado $200',          precio: '$200',   url: 'https://buy.stripe.com/fZeg0P4KV2A52t203Vu' },
      { nombre: 'Apartado $500',          precio: '$500',   url: 'https://buy.stripe.com/4gw7uj7X75Mh6Ji6sl' },
      { nombre: 'Apartado $600',          precio: '$600',   url: 'https://buy.stripe.com/8wMcP8230aZCds416t' },
      { nombre: 'Restante (ap. $200)',    precio: '$799',   url: 'https://www.synergyforeducation.com/offers/iUsLucxF' },
      { nombre: 'Restante (ap. $300)',    precio: '$699',   url: 'https://www.synergyforeducation.com/offers/2WoBNigS' },
      { nombre: 'Restante (ap. $500)',    precio: '$499',   url: 'https://buy.stripe.com/fZe4iC3746Jm9bOcNH' },
      { nombre: 'Restante (ap. $600)',    precio: '$399',   url: 'https://buy.stripe.com/5kA7uj5OZb6B5Fe04L' },
      { nombre: 'Restante (ap. $700)',    precio: '$299',   url: 'https://buy.stripe.com/28o5mb91beiN8RqdTV' },
      { nombre: 'Restante (ap. $250)',    precio: '$749',   url: 'https://www.synergyforeducation.com/offers/mgU4zE5J' },
      { nombre: 'Apartado Club',          precio: '$499',   url: 'https://www.synergyforeducation.com/offers/vLAoDsKD' },
      { nombre: 'Apartado Club',          precio: '$600',   url: 'https://www.synergyforeducation.com/offers/VffXyNPT' },
      { nombre: 'Apartado Club',          precio: '$899',   url: 'https://www.synergyforeducation.com/offers/Bv8pGzFC' },
      { nombre: 'Apartado Club',          precio: '$1,000', url: 'https://www.synergyforeducation.com/offers/L2k7GaAe' },
      { nombre: 'Apartado Club',          precio: '$1,099', url: 'https://www.synergyforeducation.com/offers/sSzD4m3A' },
      { nombre: 'Apartado Club',          precio: '$1,199', url: 'https://www.synergyforeducation.com/offers/vogAoJDV' },
      { nombre: 'Apartado Club',          precio: '$1,299', url: 'https://www.synergyforeducation.com/offers/i4wSPCza' },
      { nombre: 'Apartado Club',          precio: '$1,350', url: 'https://www.synergyforeducation.com/offers/Jvv7s3ny' },
    ],
  },
  {
    titulo: 'Webinar',
    items: [
      { nombre: 'Pago Club Total',            precio: '$999' },
      { nombre: 'Pago Club Total (anterior)', precio: '$799',  url: 'https://buy.stripe.com/28o8yS7nkaZC4VyfZQ' },
      { nombre: 'Apartado $100',              precio: '$100',  url: 'https://buy.stripe.com/aEU8ynfpzeiNgjS02G' },
      { nombre: 'Apartado $200',              precio: '$200',  url: 'https://buy.stripe.com/fZeg0P4KV2A52t203V' },
      { nombre: 'Apartado $250',              precio: '$250',  url: 'https://www.synergyforeducation.com/offers/e2qyLS6j' },
      { nombre: 'Apartado $300',              precio: '$300',  url: 'https://buy.stripe.com/4gw5mbcdndeJebK9Ff' },
      { nombre: 'Apartado $350',              precio: '$350' },
      { nombre: 'Apartado $400',              precio: '$400',  url: 'https://buy.stripe.com/bIY8yngtD6QlebKdVR' },
      { nombre: 'Apartado $450',              precio: '$450' },
      { nombre: 'Apartado $500',              precio: '$500',  url: 'https://buy.stripe.com/4gw7uj7X75Mh6Ji6sl' },
      { nombre: 'Apartado $600',              precio: '$600' },
    ],
  },
  {
    titulo: 'Presenciales México',
    items: [
      { nombre: 'Pago Total Contado 3 Meses',        precio: '$9,997', url: 'https://www.synergyforeducation.com/offers/pZabs8XY/checkout' },
      { nombre: 'Pago Total 3 Meses a Meses',        precio: '$11,397', url: 'https://buy.stripe.com/fZu7sM6As9Embrs' },
      { nombre: 'Pago Total Contado 6 Meses',        precio: '$12,997', url: 'https://www.synergyforeducation.com/offers/vMzthz2s/checkout' },
      { nombre: 'Pago Total 6 Meses a Meses',        precio: '$14,817', url: 'https://buy.stripe.com/bJeeVecYQ9Emano8' },
      { nombre: 'Pago Total Contado 12 Meses',       precio: '$14,997', url: 'https://www.synergyforeducation.com/offers/SuxLQPiC/checkout' },
      { nombre: 'Pago Total 12 Meses a Meses',       precio: '$17,097', url: 'https://buy.stripe.com/dRmfZiaQI5o6fHIe' },
      { nombre: 'Restante Club de Contado',          precio: '$7,997',  url: 'https://www.synergyforeducation.com/offers/LfjzEzGF' },
      { nombre: 'Restante Club a Meses',             precio: '$9,116',  url: 'https://buy.stripe.com/6oE6qf7X7fmRebKe3O' },
      { nombre: 'Restante',                          precio: '$3,999',  url: 'https://www.synergyforeducation.com/offers/tiNNmTXi' },
      { nombre: 'Apartado Club Contado',             precio: '$2,000',  url: 'https://www.synergyforeducation.com/offers/7mw2rFz3' },
      { nombre: 'Restante Club Sinergético Contado', precio: '$4,497',  url: 'https://buy.stripe.com/eVqfZigb2dUC7bc1Gu' },
      { nombre: 'Restante Club Sinergético Contado', precio: '$4,997',  url: 'https://buy.stripe.com/00w6oIbUMbMucvw70O' },
      { nombre: 'Restante Club Sinergético a Meses', precio: '$5,597',  url: 'https://buy.stripe.com/aFa28s4sk3fYbrsfxk' },
      { nombre: 'VIP Presenciales',                  precio: '$1,000' },
    ],
  },
  {
    titulo: 'Renovación Club Sinergético',
    items: [
      { nombre: 'Renovación MX',       precio: '$4,997', url: 'https://pay.hotmart.com/Y99824146R?off=ckc0y9q3&bid=1748027679564' },
      { nombre: 'Renovación USA',      precio: '$999',   url: 'https://www.synergyforeducation.com/offers/moLFo6Pi' },
      { nombre: 'OXXO (Emergencias)',  precio: '$1,000', url: 'https://mpago.li/1ykFsjZ' },
      { nombre: 'OXXO (Emergencias)',  precio: '$1,500', url: 'https://mpago.li/2w7ZW4c' },
    ],
  },
  {
    titulo: 'Repitch Club Sinergético',
    items: [
      { nombre: 'Repitch MX · 3 Meses',    precio: '$5,997', url: 'https://pay.hotmart.com/M101848244V?checkoutMode=10' },
      { nombre: 'Repitch LATAM · 3 Meses', precio: '$299',   url: 'https://pay.hotmart.com/B99463683H?checkoutMode=10' },
      { nombre: 'Repitch USA · 3 Meses',   precio: '$999',   url: 'https://www.synergyforeducation.com/offers/qVezpFYZ' },
    ],
  },
  {
    titulo: 'Upgrades / Renovar Club Sinergético LIVE',
    items: [
      { nombre: 'Upgrade MX · 3 Meses extra',      precio: '$2,000' },
      { nombre: 'Upgrade MX · 12 Meses',           precio: '$4,000', url: 'https://pay.hotmart.com/S103254182Y?off=tb6ky0re&checkoutMode=10' },
      { nombre: 'Upgrade LATAM · 3 Meses extra',   precio: '$50' },
      { nombre: 'Upgrade LATAM · 12 Meses',        precio: '$100',   url: 'https://pay.hotmart.com/E106300427A?off=c79ny8c0' },
      { nombre: 'Upgrade USA · 3 Meses extra',     precio: '$200' },
      { nombre: 'Upgrade USA · 12 Meses',          precio: '$300',   url: 'https://www.synergyforeducation.com/offers/E9xNErzt' },
    ],
  },
]

const PRESENCIALES: Subseccion[] = [
  {
    titulo: 'Webinar LATAM Centro · Miércoles 7 pm CDMX',
    items: [
      { nombre: 'Renovación MX 1 año',   precio: '$5,997', url: 'https://checkout.synergyforeducation.com/pay/pl_d5a368bddbdd56eac7c049c65fe3d6c9' },
      { nombre: 'Renovación LATAM 1 año', precio: '$299',  url: 'https://pay.hotmart.com/D106300176V' },
      { nombre: 'Renovación USA 1 año',  precio: '$999',   url: 'https://synergyforeducation.com/offers/hAH7JZbL' },
    ],
  },
  {
    titulo: 'Webinar México JS Jorge · Jueves 8 pm CDMX',
    items: [
      { nombre: 'Total CS + 1 Año', precio: '$11,997', url: 'https://pay.hotmart.com/X102928391G' },
      { nombre: 'Total CS + 1 Año', precio: '$9,997',  url: 'https://pay.hotmart.com/X102928391G' },
      { nombre: 'Apartado JS',      precio: '$8,997',  url: 'https://pay.hotmart.com/J99418451H' },
    ],
  },
  {
    titulo: 'Webinar México Manuel · Martes 8 pm CDMX',
    items: [
      { nombre: 'Total CS + 1 Año', precio: '$11,997', url: 'https://pay.hotmart.com/A102653279Q' },
      { nombre: 'Apartado MDL',     precio: '$8,997',  url: 'https://pay.hotmart.com/N99414326Q' },
    ],
  },
  {
    titulo: 'Webinar USA JS · Miércoles 7/8 pm CDMX',
    items: [
      { nombre: 'Total CS + 1 Año', precio: '$1,499', url: 'https://synergyforeducation.com/offers/jQFm9RkR' },
      { nombre: 'Apartado JS',      precio: '$1,399', url: 'https://synergyforeducation.com/offers/LMLFRXkq' },
    ],
  },
]

/* ─── Componente campo copiable ─────────────────────────────────────────── */
function CopyField({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl"
      style={{ background: '#08080e', border: `1px solid ${S.border}` }}>
      <div className="flex items-start gap-2.5 min-w-0 flex-1">
        <span className="mt-0.5 flex-shrink-0" style={{ color: S.silverDim }}>{icon}</span>
        <div className="min-w-0">
          <p className="text-[10px] tracking-widest uppercase mb-0.5" style={{ color: S.silverDim }}>{label}</p>
          <p className="text-sm font-medium break-all" style={{ color: S.silverBright }}>{value}</p>
        </div>
      </div>
      <button onClick={copy}
        className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all"
        style={{ background: copied ? 'rgba(80,200,120,0.12)' : 'rgba(180,185,210,0.06)', border: `1px solid ${copied ? 'rgba(80,200,120,0.3)' : S.border}`, color: copied ? '#60c878' : S.silverDim }}>
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </button>
    </div>
  )
}

/* ─── Componente sección de cuenta ─────────────────────────────────────── */
function PaySection({ title, subtitle, badge, badgeColor, fields }: {
  title: string; subtitle: string; badge: string
  badgeColor: { bg: string; text: string; border: string }
  fields: { label: string; value: string; icon: React.ReactNode }[]
}) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: S.card, border: `1px solid ${S.borderLight}` }}>
      <div className="px-5 py-4 flex items-center gap-4" style={{ borderBottom: `1px solid ${S.border}`, background: 'rgba(180,185,210,0.02)' }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: badgeColor.bg, border: `1px solid ${badgeColor.border}` }}>
          <span className="text-base font-black" style={{ color: badgeColor.text }}>{badge}</span>
        </div>
        <div>
          <h2 className="text-base font-bold" style={{ color: S.silverBright }}>{title}</h2>
          <p className="text-xs mt-0.5" style={{ color: S.silverDim }}>{subtitle}</p>
        </div>
      </div>
      <div className="px-4 py-4 space-y-2">
        {fields.map(f => <CopyField key={f.label} label={f.label} value={f.value} icon={f.icon} />)}
      </div>
    </div>
  )
}

/* ─── Componente fila de link de pago ───────────────────────────────────── */
function LinkRow({ item }: { item: LinkItem }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    if (!item.url) return
    navigator.clipboard.writeText(item.url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
      style={{ background: '#08080e', border: `1px solid ${S.border}` }}>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate" style={{ color: item.url ? S.silver : S.silverDim }}>
          {item.nombre}
        </p>
      </div>
      <span className="flex-shrink-0 text-xs font-bold px-2 py-0.5 rounded-full"
        style={{ background: 'rgba(80,200,120,0.1)', color: '#60c878', border: '1px solid rgba(80,200,120,0.2)', whiteSpace: 'nowrap' }}>
        {item.precio}
      </span>
      {item.url ? (
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button onClick={copy}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
            style={{ background: copied ? 'rgba(80,200,120,0.12)' : 'rgba(180,185,210,0.06)', border: `1px solid ${copied ? 'rgba(80,200,120,0.3)' : S.border}`, color: copied ? '#60c878' : S.silverDim }}
            title="Copiar enlace">
            {copied ? <Check size={12} /> : <Copy size={12} />}
          </button>
          <a href={item.url} target="_blank" rel="noopener noreferrer"
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
            style={{ background: 'rgba(180,185,210,0.06)', border: `1px solid ${S.border}`, color: S.silverDim }}
            title="Abrir enlace">
            <ExternalLink size={12} />
          </a>
        </div>
      ) : (
        <div className="flex-shrink-0 text-[10px] px-2" style={{ color: '#2a2e3a' }}>sin link</div>
      )}
    </div>
  )
}

/* ─── Componente sección de links colapsable ────────────────────────────── */
function LinkSection({ titulo, subtitulo, badge, badgeColor, secciones }: {
  titulo: string; subtitulo: string; badge: string
  badgeColor: { bg: string; text: string; border: string }
  secciones: Subseccion[]
}) {
  const [open, setOpen] = useState(true)
  const [openSubs, setOpenSubs] = useState<Record<string, boolean>>(
    Object.fromEntries(secciones.map((s, i) => [i, true]))
  )
  const total = secciones.reduce((acc, s) => acc + s.items.length, 0)

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: S.card, border: `1px solid ${S.borderLight}` }}>
      {/* Header principal */}
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-4 px-5 py-4 transition-all"
        style={{ borderBottom: open ? `1px solid ${S.border}` : 'none', background: 'rgba(180,185,210,0.02)' }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: badgeColor.bg, border: `1px solid ${badgeColor.border}` }}>
          <Link2 size={16} style={{ color: badgeColor.text }} />
        </div>
        <div className="flex-1 text-left">
          <h2 className="text-base font-bold" style={{ color: S.silverBright }}>{titulo}</h2>
          <p className="text-xs mt-0.5" style={{ color: S.silverDim }}>{subtitulo} · {total} enlaces</p>
        </div>
        {open ? <ChevronUp size={16} style={{ color: S.silverDim }} /> : <ChevronDown size={16} style={{ color: S.silverDim }} />}
      </button>

      {open && (
        <div className="px-4 py-4 space-y-4">
          {secciones.map((sec, i) => (
            <div key={i}>
              {/* Subsección header */}
              <button
                onClick={() => setOpenSubs(prev => ({ ...prev, [i]: !prev[i] }))}
                className="w-full flex items-center justify-between mb-2 px-1">
                <p className="text-[11px] font-bold tracking-widest uppercase" style={{ color: badgeColor.text }}>
                  {sec.titulo}
                </p>
                <span style={{ color: S.silverDim }}>
                  {openSubs[i] ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </span>
              </button>
              {openSubs[i] && (
                <div className="space-y-1.5">
                  {sec.items.map((item, j) => <LinkRow key={j} item={item} />)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Buscador de links (modal) ─────────────────────────────────────────── */
type ResultadoBusqueda = LinkItem & { seccion: string; subseccion: string }

function todasLasEntradas(): ResultadoBusqueda[] {
  const grupos = [
    { seccion: 'Black Access · Bootcamp', lista: BLACK_ACCESS },
    { seccion: 'Nuevos Webinars Links',   lista: WEBINARS_LINKS },
    { seccion: 'Presenciales',            lista: PRESENCIALES },
  ]
  const out: ResultadoBusqueda[] = []
  for (const g of grupos) {
    for (const sub of g.lista) {
      for (const item of sub.items) {
        out.push({ ...item, seccion: g.seccion, subseccion: sub.titulo })
      }
    }
  }
  return out
}

function BuscadorModal({ onClose }: { onClose: () => void }) {
  const [query,  setQuery]  = useState('')
  const [copied, setCopied] = useState<string | null>(null)

  const q = query.trim().toLowerCase()
  const resultados: ResultadoBusqueda[] = q.length < 1 ? [] : todasLasEntradas().filter(e =>
    e.nombre.toLowerCase().includes(q) ||
    e.precio.toLowerCase().includes(q) ||
    (e.url ?? '').toLowerCase().includes(q) ||
    e.subseccion.toLowerCase().includes(q) ||
    e.seccion.toLowerCase().includes(q)
  )

  function copy(url: string, key: string) {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(key)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4"
      style={{ background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>

      <div className="w-full max-w-lg rounded-2xl overflow-hidden flex flex-col"
        style={{ background: '#09090f', border: '1px solid rgba(180,185,210,0.2)', boxShadow: '0 0 80px rgba(0,0,0,0.9)', maxHeight: '80vh' }}>

        {/* Barra de búsqueda */}
        <div className="flex items-center gap-3 px-4 py-3"
          style={{ borderBottom: `1px solid ${S.border}` }}>
          <Search size={18} style={{ color: '#6aaddc', flexShrink: 0 }} />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar por nombre, precio o sección…"
            className="flex-1 bg-transparent outline-none text-base"
            style={{ color: S.silverBright }}
          />
          {query
            ? <button onClick={() => setQuery('')} style={{ color: S.silverDim, flexShrink: 0 }}><XIcon size={16} /></button>
            : <button onClick={onClose} style={{ color: S.silverDim, flexShrink: 0 }}><XIcon size={16} /></button>
          }
        </div>

        {/* Resultados */}
        <div className="overflow-y-auto flex-1 px-3 py-3 space-y-2"
          style={{ scrollbarWidth: 'thin', scrollbarColor: `${S.silverDim} transparent` }}>

          {q.length === 0 && (
            <div className="text-center py-10" style={{ color: S.silverDim }}>
              <Search size={32} className="mx-auto mb-3 opacity-15" />
              <p className="text-sm">Escribe una palabra clave o monto</p>
              <p className="text-xs mt-1 opacity-60">ej. Black Access, 9997, USA, Centurion…</p>
            </div>
          )}

          {q.length > 0 && resultados.length === 0 && (
            <div className="text-center py-10" style={{ color: S.silverDim }}>
              <Search size={32} className="mx-auto mb-3 opacity-15" />
              <p className="text-sm">Sin resultados para "<span style={{ color: S.silver }}>{query}</span>"</p>
            </div>
          )}

          {resultados.length > 0 && (
            <>
              <p className="text-[10px] tracking-widest uppercase px-1 pb-1" style={{ color: S.silverDim }}>
                {resultados.length} resultado{resultados.length !== 1 ? 's' : ''}
              </p>
              {resultados.map((r, i) => {
                const key = `${i}-${r.nombre}`
                const isCopied = copied === key
                return (
                  <div key={key} className="rounded-xl overflow-hidden"
                    style={{ border: `1px solid ${S.border}` }}>
                    <div className="flex items-center gap-1.5 px-3 py-1.5"
                      style={{ background: 'rgba(70,140,220,0.05)', borderBottom: `1px solid ${S.border}` }}>
                      <span className="text-[9px] tracking-widest uppercase" style={{ color: 'rgba(106,173,220,0.6)' }}>
                        {r.seccion}
                      </span>
                      <ChevronRight size={10} style={{ color: S.silverDim }} />
                      <span className="text-[9px]" style={{ color: S.silverDim }}>{r.subseccion}</span>
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2.5" style={{ background: '#08080e' }}>
                      <p className="flex-1 text-xs font-medium truncate" style={{ color: r.url ? S.silver : S.silverDim }}>
                        {r.nombre}
                      </p>
                      <span className="flex-shrink-0 text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(80,200,120,0.1)', color: '#60c878', border: '1px solid rgba(80,200,120,0.2)', whiteSpace: 'nowrap' }}>
                        {r.precio}
                      </span>
                      {r.url ? (
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <button onClick={() => copy(r.url!, key)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                            style={{ background: isCopied ? 'rgba(80,200,120,0.12)' : 'rgba(180,185,210,0.06)', border: `1px solid ${isCopied ? 'rgba(80,200,120,0.3)' : S.border}`, color: isCopied ? '#60c878' : S.silverDim }}>
                            {isCopied ? <Check size={12} /> : <Copy size={12} />}
                          </button>
                          <a href={r.url} target="_blank" rel="noopener noreferrer"
                            className="w-7 h-7 rounded-lg flex items-center justify-center"
                            style={{ background: 'rgba(180,185,210,0.06)', border: `1px solid ${S.border}`, color: S.silverDim }}>
                            <ExternalLink size={12} />
                          </a>
                        </div>
                      ) : (
                        <span className="flex-shrink-0 text-[10px] px-2" style={{ color: '#2a2e3a' }}>sin link</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </>
          )}
        </div>

        <div className="px-4 py-2 text-[10px] text-center" style={{ color: '#2a2e3a', borderTop: `1px solid ${S.border}` }}>
          Esc para cerrar
        </div>
      </div>
    </div>
  )
}

/* ─── Calculadora de pagos ──────────────────────────────────────────────── */
const PRESETS = [
  { label: 'Skool 3 meses',  precio: 9997 },
  { label: 'Skool 6 meses',  precio: 12997 },
  { label: 'Skool 12 meses', precio: 14997 },
]

const fmt = (n: number) =>
  n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 2 })

function Calculadora({ nombre, multiplicador, accentColor, presets }: {
  nombre: string
  multiplicador: number
  accentColor: { bg: string; border: string; text: string }
  presets?: { label: string; precio: number }[]
}) {
  const [contado, setContado] = useState('')
  const [abonos,  setAbonos]  = useState('')
  const [open,    setOpen]    = useState(true)

  const precioContado = parseFloat(contado.replace(/,/g, '')) || 0
  const precioMeses   = Math.round(precioContado * multiplicador * 100) / 100
  const totalAbonos   = parseFloat(abonos.replace(/,/g, ''))  || 0
  const faltaContado  = Math.max(0, precioContado - totalAbonos)
  const faltaMeses    = Math.max(0, precioMeses   - totalAbonos)
  const hayDatos      = precioContado > 0

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: S.card, border: `1px solid ${S.borderLight}` }}>
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-4 px-5 py-4 transition-all"
        style={{ borderBottom: open ? `1px solid ${S.border}` : 'none', background: 'rgba(180,185,210,0.02)' }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: accentColor.bg, border: `1px solid ${accentColor.border}` }}>
          <Calculator size={16} style={{ color: accentColor.text }} />
        </div>
        <div className="flex-1 text-left">
          <h2 className="text-base font-bold" style={{ color: S.silverBright }}>{nombre}</h2>
          <p className="text-xs mt-0.5" style={{ color: S.silverDim }}>
            Interés ×{multiplicador} · contado vs a meses · abonos
          </p>
        </div>
        {open ? <ChevronUp size={16} style={{ color: S.silverDim }} /> : <ChevronDown size={16} style={{ color: S.silverDim }} />}
      </button>

      {open && (
        <div className="px-4 py-5 space-y-5">

          {/* Presets opcionales */}
          {presets && presets.length > 0 && (
            <div>
              <p className="text-[10px] tracking-widest uppercase mb-2" style={{ color: S.silverDim }}>Precios rápidos · Presenciales</p>
              <div className="flex flex-wrap gap-2">
                {presets.map(p => {
                  const sel = contado === String(p.precio)
                  return (
                    <button key={p.label}
                      onClick={() => { setContado(String(p.precio)); setAbonos('') }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                      style={{
                        background: sel ? `${accentColor.bg}` : 'rgba(180,185,210,0.05)',
                        border:     `1px solid ${sel ? accentColor.border : S.border}`,
                        color:      sel ? accentColor.text : S.silverDim,
                      }}>
                      {p.label}
                      <span className="font-bold" style={{ color: sel ? accentColor.text : S.silver }}>
                        ${p.precio.toLocaleString()}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] tracking-widest uppercase mb-1.5" style={{ color: S.silverDim }}>Precio de contado ($)</p>
              <input type="number" value={contado} onChange={e => setContado(e.target.value)}
                placeholder="ej. 9997"
                className="w-full px-3 py-2.5 rounded-xl outline-none text-sm"
                style={{ background: '#08080e', border: `1px solid ${S.border}`, color: S.silverBright }} />
            </div>
            <div>
              <p className="text-[10px] tracking-widest uppercase mb-1.5" style={{ color: S.silverDim }}>Total abonos recibidos ($)</p>
              <input type="number" value={abonos} onChange={e => setAbonos(e.target.value)}
                placeholder="ej. 3000"
                className="w-full px-3 py-2.5 rounded-xl outline-none text-sm"
                style={{ background: '#08080e', border: `1px solid ${S.border}`, color: S.silverBright }} />
            </div>
          </div>

          {/* Resultados */}
          {hayDatos ? (
            <div className="space-y-2.5">
              {/* Precio a meses */}
              <div className="flex items-center justify-between px-4 py-3 rounded-xl"
                style={{ background: 'rgba(70,140,220,0.06)', border: '1px solid rgba(70,140,220,0.18)' }}>
                <div>
                  <p className="text-[10px] tracking-widest uppercase" style={{ color: 'rgba(106,173,220,0.7)' }}>
                    Precio a meses (×{multiplicador})
                  </p>
                  <p className="text-lg font-black mt-0.5" style={{ color: '#6aaddc' }}>{fmt(precioMeses)}</p>
                </div>
                <div className="flex items-center gap-1 text-xs" style={{ color: 'rgba(106,173,220,0.5)' }}>
                  <span>{fmt(precioContado)}</span>
                  <ChevronRight size={12} />
                  <span style={{ color: '#6aaddc' }}>{fmt(precioMeses)}</span>
                </div>
              </div>

              {/* Falta contado */}
              <div className="flex items-center justify-between px-4 py-3 rounded-xl"
                style={{ background: 'rgba(90,160,90,0.06)', border: '1px solid rgba(90,160,90,0.18)' }}>
                <div>
                  <p className="text-[10px] tracking-widest uppercase" style={{ color: 'rgba(112,200,120,0.7)' }}>Falta para contado</p>
                  <p className="text-lg font-black mt-0.5" style={{ color: faltaContado === 0 ? '#50e070' : '#70c878' }}>
                    {faltaContado === 0 ? '¡Pagado!' : fmt(faltaContado)}
                  </p>
                </div>
                {totalAbonos > 0 && (
                  <div className="text-right text-[11px]" style={{ color: 'rgba(112,200,120,0.5)' }}>
                    <p>Abonado: <span style={{ color: '#70c878' }}>{fmt(totalAbonos)}</span></p>
                    <p>de <span style={{ color: S.silver }}>{fmt(precioContado)}</span></p>
                  </div>
                )}
              </div>

              {/* Falta a meses */}
              <div className="flex items-center justify-between px-4 py-3 rounded-xl"
                style={{ background: 'rgba(220,160,60,0.06)', border: '1px solid rgba(220,160,60,0.18)' }}>
                <div>
                  <p className="text-[10px] tracking-widest uppercase" style={{ color: 'rgba(220,170,80,0.7)' }}>Falta para precio a meses</p>
                  <p className="text-lg font-black mt-0.5" style={{ color: faltaMeses === 0 ? '#50e070' : '#dcaa50' }}>
                    {faltaMeses === 0 ? '¡Pagado!' : fmt(faltaMeses)}
                  </p>
                </div>
                {totalAbonos > 0 && (
                  <div className="text-right text-[11px]" style={{ color: 'rgba(220,170,80,0.5)' }}>
                    <p>Abonado: <span style={{ color: '#dcaa50' }}>{fmt(totalAbonos)}</span></p>
                    <p>de <span style={{ color: S.silver }}>{fmt(precioMeses)}</span></p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-4" style={{ color: S.silverDim }}>
              <Calculator size={28} className="mx-auto mb-2 opacity-20" />
              <p className="text-xs">Ingresa un precio para calcular</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ─── Página principal ───────────────────────────────────────────────────── */
export default function PagosPage() {
  const [buscar, setBuscar] = useState(false)

  return (
    <div style={{ background: S.bg, minHeight: '100vh' }}>
      {buscar && <BuscadorModal onClose={() => setBuscar(false)} />}

      <div className="max-w-2xl mx-auto px-4 py-6">

        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: S.silverBright }}>Datos de Pago</h1>
            <p className="text-sm mt-1" style={{ color: S.silverDim }}>
              Toca <Copy size={11} className="inline mx-1" /> para copiar · <ExternalLink size={11} className="inline mx-1" /> para abrir el link
            </p>
          </div>
        </div>

        {/* ── Botón de búsqueda grande ── */}
        <button
          onClick={() => setBuscar(true)}
          className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl mb-6 transition-all group"
          style={{
            background: 'rgba(70,140,220,0.06)',
            border: '1px solid rgba(70,140,220,0.22)',
          }}>
          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
            style={{ background: 'rgba(70,140,220,0.14)', border: '1px solid rgba(70,140,220,0.32)' }}>
            <Search size={20} style={{ color: '#6aaddc' }} />
          </div>
          <div className="flex-1 text-left">
            <p className="text-base font-bold" style={{ color: '#6aaddc' }}>Buscar enlace de pago</p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(106,173,220,0.55)' }}>
              Escribe un nombre, precio o categoría…
            </p>
          </div>
          <ChevronRight size={18} style={{ color: 'rgba(106,173,220,0.4)' }} />
        </button>

        <div className="space-y-5">

          {/* ── Zelle ── */}
          <PaySection
            title="Pagos con Zelle" subtitle="Sinergeticos LLC · USA" badge="Z"
            badgeColor={{ bg: 'rgba(100,60,200,0.15)', text: '#8860e0', border: 'rgba(100,60,200,0.3)' }}
            fields={ZELLE}
          />

          {/* ── Fiscal ── */}
          <PaySection
            title="Datos Fiscales" subtitle="Transferencia · México" badge="F"
            badgeColor={{ bg: 'rgba(220,50,50,0.12)', text: '#dc6060', border: 'rgba(220,50,50,0.28)' }}
            fields={FISCALES}
          />

          {/* ── Bancarios ── */}
          <PaySection
            title="Datos Bancarios" subtitle="Santander · México" badge="B"
            badgeColor={{ bg: 'rgba(220,50,50,0.12)', text: '#dc6060', border: 'rgba(220,50,50,0.28)' }}
            fields={BANCARIOS}
          />

          {/* ── Calculadora Presencial / Webinar (×1.14) ── */}
          <Calculadora
            nombre="Presencial / Webinar"
            multiplicador={1.14}
            accentColor={{ bg: 'rgba(90,160,90,0.12)', border: 'rgba(90,160,90,0.28)', text: '#70c878' }}
            presets={PRESETS}
          />

          {/* ── Calculadora High Ticket (×1.16) ── */}
          <Calculadora
            nombre="High Ticket"
            multiplicador={1.16}
            accentColor={{ bg: 'rgba(160,100,220,0.12)', border: 'rgba(160,100,220,0.28)', text: '#b070e0' }}
          />

          {/* ── Divider ── */}
          <div className="flex items-center gap-3 py-2">
            <div className="flex-1 h-px" style={{ background: S.border }} />
            <span className="text-[10px] tracking-widest uppercase" style={{ color: S.silverDim }}>Links de pago</span>
            <div className="flex-1 h-px" style={{ background: S.border }} />
          </div>

          {/* ── Black Access / Bootcamp ── */}
          <LinkSection
            titulo="Black Access · Bootcamp"
            subtitulo="México · USA · LATAM · Centurion"
            badge="B"
            badgeColor={{ bg: 'rgba(220,80,160,0.12)', text: '#dc60b0', border: 'rgba(220,80,160,0.28)' }}
            secciones={BLACK_ACCESS}
          />

          {/* ── Nuevos Webinars Links ── */}
          <LinkSection
            titulo="Nuevos Webinars Links"
            subtitulo="USA · Webinar · Presenciales MX · Renovación"
            badge="W"
            badgeColor={{ bg: 'rgba(70,140,220,0.12)', text: '#6aaddc', border: 'rgba(70,140,220,0.28)' }}
            secciones={WEBINARS_LINKS}
          />

          {/* ── Presenciales ── */}
          <LinkSection
            titulo="Presenciales"
            subtitulo="LATAM · México · USA"
            badge="P"
            badgeColor={{ bg: 'rgba(180,130,60,0.12)', text: '#dcaa50', border: 'rgba(180,130,60,0.28)' }}
            secciones={PRESENCIALES}
          />

        </div>

        <p className="text-center text-[11px] mt-8" style={{ color: '#2a2e3a' }}>
          Información confidencial — solo visible para el equipo de soporte
        </p>
      </div>
    </div>
  )
}
