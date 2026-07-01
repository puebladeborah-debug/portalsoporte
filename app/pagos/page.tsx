'use client'

import { useState, useEffect } from 'react'
import {
  Copy, Check, Smartphone, Building2, CreditCard, Hash,
  MapPin, Mail, FileText, Landmark, ExternalLink, ChevronDown, ChevronUp, Link2,
  Calculator, ChevronRight, Search, X as XIcon,
} from 'lucide-react'

const S = {
  bg:           'var(--th-bg)',
  card:         'var(--th-card)',
  border:       'var(--th-border)',
  borderLight:  'var(--th-border-light)',
  borderActive: 'var(--th-border-active)',
  silver:       'var(--th-silver)',
  silverBright: 'var(--th-bright)',
  silverDim:    'var(--th-dim)',
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
// Cada producto usa el nombre EXACTO de su categoría (tal como en la hoja),
// con el monto aparte — sin repetir "GENERAL ACCESS"/"BLACK ACCESS" en el nombre.
const BLACK_ACCESS: Subseccion[] = [
  {
    titulo: 'Bootcamp y Links Oficiales',
    items: [
      { nombre: 'BOOTCAMP MEX PAUTA · 05,06 Y 07 DE JUNIO', precio: '$13,036', url: 'https://bootcampsinergetico.com/?utm_source=clubsinergetico' },
      { nombre: 'BOLETERA BOOTCAMP (WhatsApp)',             precio: '$13,036', url: 'https://go.wha.link/b8B1We' },
      { nombre: 'CHECKOUT BLACK ACCESS OFICIAL',            precio: 'Ver link', url: 'https://synergyunlimited.com/' },
    ],
  },
  {
    titulo: 'México · Black Access',
    items: [
      { nombre: 'LINKS MÉXICO BLACK',               precio: '$36,997 MXN', url: 'https://www.synergyforeducation.com/offers/bEcVEwrw' },
      { nombre: 'LINKS MÉXICO BLACK · Pase Doble',  precio: '$55,497 MXN', url: 'https://www.synergyforeducation.com/offers/SkQRGRbe' },
      { nombre: 'A MESES',                          precio: '$42,916 MXN', url: 'https://buy.stripe.com/eVq28s5wo4k28fgetg7Rk1e' },
      { nombre: 'A MESES · Pase Doble',             precio: '$64,376 MXN', url: 'https://buy.stripe.com/7sY00k9MEg2K3Z01Gu7Rk1f' },
      { nombre: 'APARTADO CONTADO',                 precio: '$9,999 MXN',  url: 'https://www.synergyforeducation.com/offers/QW4bS32r' },
      { nombre: 'APARTADO CONTADO · Pase Doble',    precio: '$15,999 MXN', url: 'https://www.synergyforeducation.com/offers/nMxUDpQp' },
      { nombre: 'APARTADO A MESES',                 precio: '$11,599 MXN', url: 'https://buy.stripe.com/9B6cN68IAaIq8fgcl87Rk1g' },
      { nombre: 'APARTADO A MESES · Pase Doble',    precio: '$18,558 MXN', url: 'https://buy.stripe.com/7sYeVebUMdUCgLMgBo7Rk1h' },
    ],
  },
  {
    titulo: 'México · General y VIP',
    items: [
      { nombre: 'GENERAL CONTADO PAUTA', precio: '$5,997 MXN', url: 'https://www.synergyforeducation.com/offers/sHf5tG7W' },
      { nombre: 'GENERAL MESES PAUTA',   precio: '$6,837 MXN', url: 'https://buy.stripe.com/5kQcN69ME7we6783OC7Rk1i' },
      { nombre: 'GENERAL CONTADO CLUB',  precio: '$3,997 MXN', url: 'https://www.synergyforeducation.com/offers/Q4LogqdV' },
      { nombre: 'GENERAL MESES CLUB',    precio: '$4,556 MXN', url: 'https://buy.stripe.com/dRmcN65wo6sa5345WK7Rk1j' },
      { nombre: 'VIP CONTADO PAUTA',     precio: '$7,997 MXN', url: 'https://www.synergyforeducation.com/offers/8dLZZrus' },
      { nombre: 'VIP MESES PAUTA',       precio: '$9,116 MXN', url: 'https://buy.stripe.com/eVqdRa2kc4k20MOad07Rk1k' },
      { nombre: 'VIP CONTADO CLUB',      precio: '$5,997 MXN', url: 'https://www.synergyforeducation.com/offers/vFAPaM3B' },
      { nombre: 'VIP MESES CLUB',        precio: '$6,836 MXN', url: 'https://buy.stripe.com/6oU8wQ6As2bU7bc0Cq7Rk1l' },
    ],
  },
  {
    titulo: 'México · Centurion',
    items: [
      { nombre: 'CENTURION CONTADO',               precio: '$90,000 MXN',  url: 'https://www.synergyforeducation.com/offers/VoBDAjgW' },
      { nombre: 'CENTURION A MESES',                precio: '$104,000 MXN', url: 'https://buy.stripe.com/bJedRacYQ6sa9jk0Cq7Rk1m' },
      { nombre: 'CENTURION CONTADO DOBLE',          precio: '$144,000 MXN', url: 'https://www.synergyforeducation.com/offers/wfLpTKeQ' },
      { nombre: 'CENTURION A MESES DOBLE',          precio: '$167,000 MXN', url: 'https://buy.stripe.com/14AbJ2bUM3fY8fg84S7Rk1n' },
      { nombre: 'ABONO CENTURION CONTADO',          precio: '$55,997 MXN', url: 'https://www.synergyforeducation.com/offers/LJtVB2Dm' },
      { nombre: 'ABONO CENTURION A MESES',          precio: '$64,997 MXN', url: 'https://buy.stripe.com/dRm5kEcYQ4k2cvwgBo7Rk1o' },
      { nombre: 'ABONO CENTURION DOBLE CONTADO',    precio: '$91,997 MXN', url: 'https://www.synergyforeducation.com/offers/tPTU7xdQ' },
      { nombre: 'ABONO CENTURION DOBLE A MESES',    precio: '$106,716 MXN', url: 'https://buy.stripe.com/8x228s2kcaIqeDE5WK7Rk1p' },
    ],
  },
  {
    titulo: 'USA',
    items: [
      { nombre: 'BLACK ACCESS CONTADO Y A MESES',              precio: '$1,997 USD', url: 'https://www.synergyforeducation.com/offers/ttDoMbie' },
      { nombre: 'BLACK ACCESS CONTADO Y A MESES · Pase Doble', precio: '$2,997 USD', url: 'https://www.synergyforeducation.com/offers/5Frzbkfk' },
      { nombre: 'BLACK ACCESS CONTADO Y A MESES · Apartado',   precio: '$499 USD',   url: 'https://www.synergyforeducation.com/offers/rE7ZWZea' },
      { nombre: 'BLACK ACCESS CONTADO Y A MESES · Apartado',   precio: '$799 USD',   url: 'https://www.synergyforeducation.com/offers/BKZNFA2P' },
      { nombre: 'GENERAL CONTADO PAUTA',  precio: '$297 USD',   url: 'https://www.synergyforeducation.com/offers/oyzBqqCj' },
      { nombre: 'GENERAL CONTADO CLUB',   precio: '$197 USD',   url: 'https://www.synergyforeducation.com/offers/uNJqZNRV' },
      { nombre: 'VIP CONTADO PAUTA',      precio: '$397 USD',   url: 'https://www.synergyforeducation.com/offers/cipSNDwV' },
      { nombre: 'VIP CONTADO CLUB',       precio: '$297 USD',   url: 'https://www.synergyforeducation.com/offers/4x5wRKH4' },
      { nombre: 'CENTURION CONTADO',      precio: '$4,997 USD', url: 'https://www.synergyforeducation.com/offers/rdpUDkve' },
      { nombre: 'CENTURION DOBLE CONTADO', precio: '$7,997 USD', url: 'https://www.synergyforeducation.com/offers/LA9tfSqF' },
      { nombre: 'ABONO CENTURION CONTADO', precio: '$3,000 USD', url: 'https://www.synergyforeducation.com/offers/2muzVugM' },
      { nombre: 'ABONO CENTURION DOBLE CONTADO', precio: '$5,000 USD', url: 'https://www.synergyforeducation.com/offers/ry6JizC2' },
    ],
  },
  {
    titulo: 'LATAM',
    items: [
      { nombre: 'LINKS LATAM',              precio: 'Ver link', url: 'https://pay.hotmart.com/Q106162772V?off=5o7ja6fi' },
      { nombre: 'LINKS LATAM · Pase Doble', precio: 'Ver link', url: 'https://pay.hotmart.com/O106162861G?off=y0uogpak' },
    ],
  },
]

/* ─── Links de pago ─────────────────────────────────────────────────────── */
const WEBINARS_LINKS: Subseccion[] = [
  {
    titulo: 'Links USA',
    items: [
      { nombre: 'Landing de métodos de pago',  precio: 'Ver link', url: 'https://synergyforeducation.mx/metodos-de-pago-seed-usa-presencial' },
      { nombre: 'PAGO CLUB TOTAL',        precio: '$1,499.00', url: 'https://www.synergyforeducation.com/offers/r7RycGhZ/checkout' },
      { nombre: 'APARTADO 100',           precio: '$100.00',   url: 'https://buy.stripe.com/aEU8ynfpzeiNgjS02G' },
      { nombre: 'APARTADO 200',           precio: '$200.00',   url: 'https://buy.stripe.com/fZeg0P4KV2A52t203Vu' },
      { nombre: 'APARTADO 500',           precio: '$500.00',   url: 'https://buy.stripe.com/4gw7uj7X75Mh6Ji6sl' },
      { nombre: 'APARTADO 600',           precio: '$600.00',   url: 'https://buy.stripe.com/8wMcP8230aZCds416t' },
      { nombre: 'RESTANTE APARTADO 200',  precio: '$799.00',   url: 'https://www.synergyforeducation.com/offers/iUsLucxF' },
      { nombre: 'RESTANTE APARTADO 300',  precio: '$699.00',   url: 'https://www.synergyforeducation.com/offers/2WoBNigS' },
      { nombre: 'RESTANTE APARTADO 500',  precio: '$499.00',   url: 'https://buy.stripe.com/fZe4iC3746Jm9bOcNH' },
      { nombre: 'RESTANTE APARTADO 600',  precio: '$399.00',   url: 'https://buy.stripe.com/5kA7uj5OZb6B5Fe04L' },
      { nombre: 'RESTANTE APARTADO 700',  precio: '$299.00',   url: 'https://buy.stripe.com/28o5mb91beiN8RqdTV' },
      { nombre: 'RESTANTE APARTADO 250',  precio: '$749.00',   url: 'https://www.synergyforeducation.com/offers/mgU4zE5J' },
      { nombre: 'APARTADO CLUB',          precio: '$1,000.00', url: 'https://www.synergyforeducation.com/offers/L2k7GaAe' },
      { nombre: 'APARTADO CLUB',          precio: '$1,099.00', url: 'https://www.synergyforeducation.com/offers/sSzD4m3A' },
      { nombre: 'APARTADO CLUB',          precio: '$1,350.00', url: 'https://www.synergyforeducation.com/offers/Jvv7s3ny' },
      { nombre: 'APARTADO CLUB',          precio: '$1,299.00', url: 'https://www.synergyforeducation.com/offers/i4wSPCza' },
      { nombre: 'APARTADO CLUB',          precio: '$1,199.00', url: 'https://www.synergyforeducation.com/offers/vogAoJDV' },
      { nombre: 'APARTADO CLUB',          precio: '$499.00',   url: 'https://www.synergyforeducation.com/offers/vLAoDsKD' },
      { nombre: 'APARTADO CLUB',          precio: '$600.00',   url: 'https://www.synergyforeducation.com/offers/VffXyNPT' },
      { nombre: 'APARTADO CLUB',          precio: '$899.00',   url: 'https://www.synergyforeducation.com/offers/Bv8pGzFC' },
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
      { nombre: 'LANDING CON RESUMEN DE TODO',           precio: 'Ver link', url: 'https://synergyforeducation.mx/metodos-de-pago-seed-mdl-2612-405502' },
      { nombre: 'PAGO CLUB TOTAL DE CONTADO 3 MESES',    precio: '$9,997',  url: 'https://www.synergyforeducation.com/offers/pZabs8XY/checkout' },
      { nombre: 'PAGO CLUB TOTAL 3 MESES A MESES',       precio: '$11,397', url: 'https://buy.stripe.com/fZu7sM6As9Embrs4SG7Rj2J' },
      { nombre: 'PAGO CLUB TOTAL DE CONTADO 6 MESES',    precio: '$12,997', url: 'https://www.synergyforeducation.com/offers/vMzthz2s/checkout' },
      { nombre: 'PAGO CLUB TOTAL 6 MESES A MESES',       precio: '$14,817', url: 'https://buy.stripe.com/bJeeVecYQ9Emano84S7Rj2F' },
      { nombre: 'PAGO CLUB TOTAL DE CONTADO 12 MESES',   precio: '$14,997', url: 'https://www.synergyforeducation.com/offers/SuxLQPiC/checkout' },
      { nombre: 'PAGO CLUB TOTAL 12 MESES A MESES',      precio: '$17,097', url: 'https://buy.stripe.com/dRmfZiaQI5o6fHIetg7Rj2K' },
      { nombre: 'RESTANTE CLUB DE CONTADO',              precio: '$7,997',  url: 'https://www.synergyforeducation.com/offers/LfjzEzGF' },
      { nombre: 'RESTANTE CLUB A MESES',                 precio: '$9,116',  url: 'https://buy.stripe.com/6oE6qf7X7fmRebKe3O' },
      { nombre: 'RESTANTE',                              precio: '$3,999',  url: 'https://www.synergyforeducation.com/offers/tiNNmTXi' },
      { nombre: 'APARTADO CLUB CONTADO',                 precio: '$2,000',  url: 'https://www.synergyforeducation.com/offers/7mw2rFz3' },
      { nombre: 'Restante Club Sinergético de contado',  precio: '$4,497',  url: 'https://buy.stripe.com/eVqfZigb2dUC7bc1Gu7Rj1o' },
      { nombre: 'Restante Club Sinergetico de contado',  precio: '$4,997',  url: 'https://buy.stripe.com/00w6oIbUMbMucvw70O7Ri0F' },
      { nombre: 'VIP PRESENCIALES NOV',                  precio: '$1,000' },
      { nombre: 'Restante Club Sinergetico a meses',     precio: '$5,597',  url: 'https://buy.stripe.com/aFa28s4sk3fYbrsfxk7Rh1g' },
    ],
  },
  {
    titulo: 'Renovación Club Sinergético',
    items: [
      { nombre: 'RENOVACIÓN MX LINK ANTES', precio: '$5,396.00', url: 'https://pay.hotmart.com/Y99824146R?off=ckc0y9q3&bid=1748027679564' },
      { nombre: 'RENOVACION MX 1 año',      precio: '$5,997.00', url: 'https://checkout.synergyforeducation.com/pay/pl_d5a368bddbdd56eac7c049c65fe3d6c9' },
      { nombre: 'RENOVACION LATAM 1 año',   precio: '$299.00',   url: 'https://pay.hotmart.com/D106300176V?off=ill2992e' },
      { nombre: 'RENOVACION USA 1 año',     precio: '$999.00',   url: 'https://www.synergyforeducation.com/offers/hAH7JZbL' },
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
      { nombre: 'MX 3M extras Cambia a 2k', precio: '$2,000.00', url: 'https://pay.hotmart.com/D103381825X?off=1qewqn8n&checkoutMode=10' },
      { nombre: 'MX 12M UPGRADE',           precio: '$4,000.00', url: 'https://pay.hotmart.com/D103381825X?off=sbq3ji19&checkoutMode=10' },
      { nombre: 'MX 12M UPGRADE',           precio: '$6,000.00', url: 'https://buy.stripe.com/5kQ8wQ0c4cQy2UW98W7Rk1U' },
      { nombre: 'LATAM 3M extras',          precio: '$50.00',    url: 'https://pay.hotmart.com/W10325522U?off=l7mfo7ms&checkoutMode=10' },
      { nombre: 'LATAM 12M UPGRADE',        precio: '$100.00',   url: 'https://pay.hotmart.com/E106300427A?off=c79ny8c0' },
      { nombre: 'US 3M extras $ 200',       precio: '$200.00',   url: 'https://www.synergyforeducation.com/offers/kzoXLXk3' },
      { nombre: 'US 12M UPGRADE',           precio: '$300.00',   url: 'https://www.synergyforeducation.com/offers/E9xNErzt' },
    ],
  },
]

const PRESENCIALES: Subseccion[] = [
  {
    titulo: 'Webinar LATAM Centro · Miércoles 7 pm CDMX',
    items: [
      { nombre: 'Renovación MX 1 año',    precio: '$5,997', url: 'https://checkout.synergyforeducation.com/pay/pl_d5a368bddbdd56eac7c049c65fe3d6c9' },
      { nombre: 'Renovación LATAM 1 año', precio: '$299',  url: 'https://pay.hotmart.com/D106300176V' },
      { nombre: 'Renovación USA 1 año',   precio: '$999',   url: 'https://synergyforeducation.com/offers/hAH7JZbL' },
      { nombre: 'LINK PAGO VIP',          precio: 'Ver link', url: 'https://pay.hotmart.com/G102993630L?checkoutMode=10' },
      { nombre: 'METODOS DE PAGO',        precio: 'Ver link', url: 'https://synergyforeducation.lat/metodo-de-pago-seed-js-latam-centro' },
      { nombre: 'TOTAL CS + 1 AÑO',       precio: '$499.00', url: 'https://pay.hotmart.com/L103011342R?checkoutMode=10' },
      { nombre: 'TOTAL CS + 6 MESES',     precio: '$399.00', url: 'https://pay.hotmart.com/H103011204K?checkoutMode=10&bid=1763581833605' },
      { nombre: 'TOTAL CS + 3 MESES',     precio: '$299.00', url: 'https://pay.hotmart.com/S103010970N?checkoutMode=10&bid=1763581817139' },
      { nombre: 'APARTADO JS',            precio: '$449.00', url: 'https://pay.hotmart.com/J99418304L?off=p019ko3x&checkoutMode=10' },
      { nombre: 'APARTADO JS',            precio: '$349.00', url: 'https://pay.hotmart.com/J99418304L?off=t1bcwc65&checkoutMode=10' },
      { nombre: 'PAGO CLUB TOTAL JS',     precio: '$299.00', url: 'https://pay.hotmart.com/J99414849Q?off=jxflzvvx&checkoutMode=10' },
      { nombre: 'APARTADO JS',            precio: '$249.00', url: 'https://pay.hotmart.com/J99418304L?checkoutMode=10&bid=1757695904759' },
      { nombre: 'APARTADO JS',            precio: '$200.00', url: 'https://pay.hotmart.com/J99418304L?off=068q8s6x&checkoutMode=10' },
      { nombre: 'APARTADO JS 50%',        precio: '$150.00', url: 'https://pay.hotmart.com/J99418304L?off=mryaw4ho&checkoutMode=10' },
      { nombre: 'APARTADO JS',            precio: '$100.00', url: 'https://pay.hotmart.com/J99418304L?off=7kpchuep&checkoutMode=10' },
      { nombre: 'APARTADO JS',            precio: '$50.00',  url: 'https://pay.hotmart.com/J99418304L?off=6rb6t05u&checkoutMode=10' },
      { nombre: 'APARTADO JS',            precio: '$25.00',  url: 'https://pay.hotmart.com/J99418304L?off=kvxegjrs&checkoutMode=10' },
    ],
  },
  {
    titulo: 'Webinar México JS Jorge · Jueves 8 pm CDMX',
    items: [
      { nombre: 'TOTAL CS + 1 AÑO',  precio: '$11,997.00', url: 'https://pay.hotmart.com/X102928391G?checkoutMode=10&bid=1763076772885' },
      { nombre: 'TOTAL CS + 1 AÑO',  precio: '$9,997.00',  url: 'https://pay.hotmart.com/X102928391G?off=b2hyykdv&checkoutMode=10' },
      { nombre: 'TOTAL CS + 6 MESES', precio: '$9,997.00',  url: 'https://pay.hotmart.com/H102927920X?checkoutMode=10&bid=1763076489452' },
      { nombre: 'TOTAL CS + 6 MESES', precio: '$7,997.00',  url: 'https://pay.hotmart.com/H102927920X?off=5tkt1ozb&checkoutMode=10' },
      { nombre: 'TOTAL CS + 3 MESES', precio: '$5,997.00',  url: 'https://pay.hotmart.com/H102927830R?checkoutMode=10&bid=1763076189360' },
      { nombre: 'APARTADO JS',       precio: '$8,997.00',  url: 'https://pay.hotmart.com/J99418451H?off=lxte4e8o&checkoutMode=10' },
      { nombre: 'APARTADO JS',       precio: '$6,997.00',  url: 'https://pay.hotmart.com/J99418451H?off=15tikd9h&checkoutMode=10' },
      { nombre: 'APARTADO JS',       precio: '$5,497.00',  url: 'https://pay.hotmart.com/J99418451H?checkoutMode=10' },
      { nombre: 'APARTADO JS',       precio: '$4,997.00',  url: 'https://pay.hotmart.com/J99418451H?off=pbybumtz&checkoutMode=10' },
      { nombre: 'APARTADO JS',       precio: '$4,497.00',  url: 'https://pay.hotmart.com/J99418451H?off=5sntpt8d&checkoutMode=10' },
      { nombre: 'APARTADO JS',       precio: '$3,997.00',  url: 'https://pay.hotmart.com/J99418451H?off=bj7chyev&checkoutMode=10' },
      { nombre: 'APARTADO JS',       precio: '$3,500.00',  url: 'https://pay.hotmart.com/J99418451H?off=0x8583dq&checkoutMode=10' },
      { nombre: 'APARTADO JS 50%',   precio: '$3,000.00',  url: 'https://pay.hotmart.com/J99418451H?off=3bhawz7g&checkoutMode=10' },
      { nombre: 'APARTADO JS',       precio: '$2,500.00',  url: 'https://pay.hotmart.com/J99418451H?off=p0cox4i6&checkoutMode=10' },
      { nombre: 'APARTADO JS',       precio: '$2,000.00',  url: 'https://pay.hotmart.com/J99418451H?off=ddduwy6j&checkoutMode=10' },
      { nombre: 'APARTADO JS',       precio: '$1,500.00',  url: 'https://pay.hotmart.com/J99418451H?off=vdrtl02t&checkoutMode=10' },
      { nombre: 'APARTADO JS',       precio: '$1,000.00',  url: 'https://pay.hotmart.com/J99418451H?off=7sb0r4ys&checkoutMode=10' },
      { nombre: 'APARTADO JS',       precio: '$500.00',    url: 'https://pay.hotmart.com/J99418451H?off=a6c9susk&checkoutMode=10' },
    ],
  },
  {
    titulo: 'Webinar México Manuel · Martes 8 pm CDMX',
    items: [
      { nombre: 'TOTAL CS + 1 AÑO',   precio: '$11,997.00', url: 'https://pay.hotmart.com/A102653279Q?checkoutMode=10&bid=1761691506586' },
      { nombre: 'TOTAL CS + 1 AÑO',   precio: '$9,997.00',  url: 'https://pay.hotmart.com/A102653279Q?off=c50q26u6&checkoutMode=10' },
      { nombre: 'TOTAL CS + 6 MESES', precio: '$9,997.00',  url: 'https://pay.hotmart.com/A102653195W?checkoutMode=10' },
      { nombre: 'TOTAL CS + 6 MESES', precio: '$7,997.00',  url: 'https://pay.hotmart.com/A102653195W?off=wsxlnabt&checkoutMode=10' },
      { nombre: 'TOTAL CS + 3 MESES', precio: '$5,997.00',  url: 'https://pay.hotmart.com/V99414167H?checkoutMode=10&bid=1761691259153' },
      { nombre: 'APARTADO JS',        precio: '$8,997.00',  url: 'https://pay.hotmart.com/N99414326Q?off=sgya10ld&checkoutMode=10' },
      { nombre: 'APARTADO JS',        precio: '$6,997.00',  url: 'https://pay.hotmart.com/N99414326Q?off=p8kksf5k&checkoutMode=10' },
      { nombre: 'APARTADO MDL',       precio: '$5,497.00',  url: 'https://pay.hotmart.com/N99414326Q?off=r7f11olx' },
      { nombre: 'APARTADO MDL',       precio: '$4,997.00',  url: 'https://pay.hotmart.com/N99414326Q?off=ds2occzx' },
      { nombre: 'APARTADO MDL',       precio: '$4,497.00',  url: 'https://pay.hotmart.com/N99414326Q?off=wug3ggkm' },
      { nombre: 'APARTADO MDL',       precio: '$3,997.00',  url: 'https://pay.hotmart.com/N99414326Q?off=dw6kt18b' },
      { nombre: 'APARTADO MDL',       precio: '$3,500.00',  url: 'https://pay.hotmart.com/N99414326Q?off=m5po9ixj' },
      { nombre: 'APARTADO MDL 50%',   precio: '$3,000.00',  url: 'https://pay.hotmart.com/N99414326Q?off=4xepyp3z' },
      { nombre: 'APARTADO MDL',       precio: '$2,500.00',  url: 'https://pay.hotmart.com/N99414326Q?off=f50ktwdg' },
      { nombre: 'APARTADO MDL',       precio: '$2,000.00',  url: 'https://pay.hotmart.com/N99414326Q?off=jeefe0wn' },
      { nombre: 'APARTADO MDL',       precio: '$1,500.00',  url: 'https://pay.hotmart.com/N99414326Q?off=lrn731z8' },
      { nombre: 'APARTADO MDL',       precio: '$1,000.00',  url: 'https://pay.hotmart.com/N99414326Q?off=1tu43oi9' },
      { nombre: 'APARTADO MDL',       precio: '$500.00',    url: 'https://pay.hotmart.com/N99414326Q?off=a81ua6iz' },
    ],
  },
  {
    titulo: 'Webinar USA JS · Miércoles 7/8 pm CDMX',
    items: [
      { nombre: 'METODOS DE PAGO',    precio: 'Ver link', url: 'https://synergyforeducation.us/metodo-de-pago-seed-js-usa-west' },
      { nombre: 'TOTAL CS + 1 AÑO',   precio: '$1,499.00', url: 'https://www.synergyforeducation.com/offers/jQFm9RkR' },
      { nombre: 'TOTAL CS + 6 MESES', precio: '$1,299.00', url: 'https://www.synergyforeducation.com/offers/oSE8ue2f' },
      { nombre: 'TOTAL CS + 3 MESES', precio: '$999.00',   url: 'https://www.synergyforeducation.com/offers/Yr6542WB' },
      { nombre: 'APARTADO JS',        precio: '$1,399.00', url: 'https://www.synergyforeducation.com/offers/LMLFRXkq' },
      { nombre: 'APARTADO JS',        precio: '$1,199.00', url: 'https://www.synergyforeducation.com/offers/2tY7Mxi2' },
      { nombre: 'APARTADO JS',        precio: '$1,099.00', url: 'https://www.synergyforeducation.com/offers/bgZm4ojy' },
      { nombre: 'APARTADO JS',        precio: '$899.00',   url: 'https://www.synergyforeducation.com/offers/nXLEcgd7' },
      { nombre: 'APARTADO JS',        precio: '$799.00',   url: 'https://www.synergyforeducation.com/offers/vojc66EK' },
      { nombre: 'APARTADO JS',        precio: '$699.00',   url: 'https://www.synergyforeducation.com/offers/wyG8bMVG' },
      { nombre: 'APARTADO JS',        precio: '$599.00',   url: 'https://www.synergyforeducation.com/offers/vzM5Xz2F' },
      { nombre: 'APARTADO JS',        precio: '$500.00',   url: 'https://www.synergyforeducation.com/offers/Tkkv6p2e' },
      { nombre: 'APARTADO JS',        precio: '$400.00',   url: 'https://www.synergyforeducation.com/offers/sgV2dU46' },
      { nombre: 'APARTADO JS',        precio: '$300.00',   url: 'https://www.synergyforeducation.com/offers/N2hbor9L' },
      { nombre: 'APARTADO JS',        precio: '$250.00',   url: 'https://www.synergyforeducation.com/offers/pyJUgAbc' },
      { nombre: 'APARTADO JS',        precio: '$200.00',   url: 'https://www.synergyforeducation.com/offers/CHzWmu2H' },
      { nombre: 'APARTADO JS',        precio: '$150.00',   url: 'https://www.synergyforeducation.com/offers/YsfEhB2s' },
      { nombre: 'APARTADO JS',        precio: '$100.00',   url: 'https://www.synergyforeducation.com/offers/M8u3odsh' },
      { nombre: 'APARTADO JS',        precio: '$50.00',    url: 'https://www.synergyforeducation.com/offers/T2fspUEF' },
    ],
  },
  {
    titulo: 'Europa Webinar JS · Sábado 10 am CDMX',
    items: [
      { nombre: 'LANDING OFERTA',         precio: '$499.00', url: 'https://synergyforeducation.us/oferta-seed-eur-evg-js' },
      { nombre: 'PAGO CLUB TOTAL JS EUR',  precio: '$499.00', url: 'https://pay.hotmart.com/M99950911U?off=fsbdkkcu' },
      { nombre: 'APARTADO MDL',           precio: '$449.00', url: 'https://pay.hotmart.com/M99950911U?off=fsbdkkcu' },
      { nombre: 'APARTADO MDL',           precio: '$399.00', url: 'https://pay.hotmart.com/X99954094J?off=dzhi5aku' },
      { nombre: 'APARTADO MDL',           precio: '$349.00', url: 'https://pay.hotmart.com/X99954094J?off=t45w97vr' },
      { nombre: 'APARTADO MDL',           precio: '$299.00', url: 'https://pay.hotmart.com/X99954094J?off=qu6dmes1' },
      { nombre: 'APARTADO JS 50%',        precio: '$250.00', url: 'https://pay.hotmart.com/X99954094J?off=oq42ygsq' },
      { nombre: 'APARTADO MDL',           precio: '$150.00', url: 'https://pay.hotmart.com/X99954094J?off=3nxqw8ti' },
      { nombre: 'APARTADO MDL',           precio: '$100.00', url: 'https://pay.hotmart.com/X99954094J?off=x5o326oa' },
      { nombre: 'APARTADO MDL',           precio: '$50.00',  url: 'https://pay.hotmart.com/X99954094J?off=ycflh2ao' },
    ],
  },
  {
    titulo: 'USA Webinar MDL · Jueves 6 pm CDMX',
    items: [
      { nombre: 'LANDING OFERTA',           precio: '$999.00', url: 'https://www.synergyforeducation.com/offers/4Ec94KJY' },
      { nombre: 'PAGO CLUB TOTAL JS USA',    precio: '$999.00', url: 'https://www.synergyforeducation.com/offers/REEUiC9n' },
      { nombre: 'APARTADO MDL',             precio: '$899.00', url: 'https://www.synergyforeducation.com/offers/828B42Em' },
      { nombre: 'APARTADO MDL',             precio: '$799.00', url: 'https://www.synergyforeducation.com/offers/Fpqq3FHC' },
      { nombre: 'APARTADO MDL',             precio: '$699.00', url: 'https://www.synergyforeducation.com/offers/62NLVcov' },
      { nombre: 'APARTADO MDL',             precio: '$599.00', url: 'https://www.synergyforeducation.com/offers/dfvLAAJ4' },
      { nombre: 'APARTADO JS 50%',          precio: '$500.00', url: 'https://www.synergyforeducation.com/offers/deq6wyMN' },
      { nombre: 'APARTADO MDL',             precio: '$400.00', url: 'https://www.synergyforeducation.com/offers/xKufwRzJ' },
      { nombre: 'APARTADO MDL',             precio: '$300.00', url: 'https://www.synergyforeducation.com/offers/EDzMgoHK' },
      { nombre: 'APARTADO MDL',             precio: '$250.00', url: 'https://www.synergyforeducation.com/offers/moNrRcW3' },
      { nombre: 'APARTADO MDL',             precio: '$200.00', url: 'https://www.synergyforeducation.com/offers/VoQ9zmwj' },
      { nombre: 'APARTADO MDL',             precio: '$150.00', url: 'https://www.synergyforeducation.com/offers/DzFdopPQ' },
      { nombre: 'APARTADO MDL',             precio: '$100.00', url: 'https://www.synergyforeducation.com/offers/uv45y2Fh' },
      { nombre: 'APARTADO MDL',             precio: '$50.00',  url: 'https://www.synergyforeducation.com/offers/dh5FT6Ka' },
      { nombre: 'AP. CON ACCESO JS 50%',    precio: '$499.00', url: 'https://www.synergyforeducation.com/offers/rPTtcLsn' },
      { nombre: '4 PAGOS DE 150 USD',       precio: '$150.00', url: 'https://www.synergyforeducation.com/offers/babcoTn2' },
    ],
  },
  {
    titulo: 'Checkout LATAM Centro',
    items: [
      { nombre: '299 USA', precio: '$299 USD', url: 'https://checkout.synergyforeducation.com/pay/pl_e4f952b29fb41546797f6281c447c91f' },
      { nombre: '399 USA', precio: '$399 USD', url: 'https://checkout.synergyforeducation.com/pay/pl_d94118d2504d8de41faebc7098dd23e2' },
      { nombre: '499 USA', precio: '$499 USD', url: 'https://checkout.synergyforeducation.com/pay/pl_139ed0991655dc08ed14a20be2f4daca' },
    ],
  },
  {
    titulo: 'Webinar Manuel MX Revolución IA · Martes 8 pm CDMX',
    items: [
      { nombre: 'TOTAL LEGENDAR IA',     precio: '$5,997.00', url: 'https://checkout.synergyforeducation.com/pay/pl_43aafece8aa3b645e8a4c93e6f156f3b' },
      { nombre: 'CS TOTAL LEGENDAR IA',  precio: '$3,997.00', url: 'https://checkout.synergyforeducation.com/pay/pl_43aafece8aa3b645e8a4c93e6f156f3b' },
      { nombre: 'APARTADO MDL IA 50%',   precio: '$3,000.00', url: 'https://checkout.synergyforeducation.com/pay/pl_2e1adf756bb9797429e7a5848a5dbda3' },
      { nombre: 'APARTADO MDL IA',       precio: '$2,000.00', url: 'https://checkout.synergyforeducation.com/pay/pl_e7fa50c588635ebae00133d2e9c51195' },
      { nombre: 'APARTADO MDL IA',       precio: '$1,000.00', url: 'https://checkout.synergyforeducation.com/pay/pl_dd35c5d7d56708b17602bbabb9c34cc8' },
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
      style={{ background: 'var(--th-inner)', border: `1px solid ${S.border}` }}>
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
      style={{ background: 'var(--th-inner)', border: `1px solid ${S.border}` }}>
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
      style={{ background: 'rgba(0,0,0,var(--th-overlay-alpha))', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>

      <div className="w-full max-w-lg rounded-2xl overflow-hidden flex flex-col"
        style={{ background: 'var(--th-inner)', border: '1px solid rgba(180,185,210,0.2)', boxShadow: '0 0 80px rgba(0,0,0,0.9)', maxHeight: '80vh' }}>

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
                    <div className="flex items-center gap-3 px-3 py-2.5" style={{ background: 'var(--th-inner)' }}>
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
                style={{ background: 'var(--th-inner)', border: `1px solid ${S.border}`, color: S.silverBright }} />
            </div>
            <div>
              <p className="text-[10px] tracking-widest uppercase mb-1.5" style={{ color: S.silverDim }}>Total abonos recibidos ($)</p>
              <input type="number" value={abonos} onChange={e => setAbonos(e.target.value)}
                placeholder="ej. 3000"
                className="w-full px-3 py-2.5 rounded-xl outline-none text-sm"
                style={{ background: 'var(--th-inner)', border: `1px solid ${S.border}`, color: S.silverBright }} />
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
