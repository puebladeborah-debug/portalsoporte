// Devoluciones nuevas del export de Kajabi subido a Documentos/reembolsos
// el 8 de septiembre de 2026 (kajabi8sep.csv).
// El export traía 4 filas; se excluyó la de "ricardo Rivas" / "PASE GENERAL
// SYNERGY ULIMITED MX 2026" (2026-08-20, $5,997 MXN, elchimegrill@gmail.com)
// porque es la MISMA transacción que ya se importó desde "stripe de
// contado.csv" (ch_3U63NuF0tn7jOn0107VF8LKX) — Kajabi es la plataforma de
// venta y Stripe el procesador de pago debajo, así que el mismo reembolso
// aparece en ambos exports. Importarla aquí también la hubiera duplicado.
// El campo 'resultado' sale de la columna Type: 'dispute' -> disputa-perdida,
// 'refund' -> completo. El monto es el valor absoluto de Amount (Kajabi
// exporta los reembolsos en negativo).
export const IMPORT_REEMBOLSOS_KAJABI_SEP_2026 = [
  {"evento":"WUSA","mes":"2026-09","plataforma":"Kajabi","fechaDevolucion":"2026-09-03","monto":799,"divisa":"USD","correo":"xochitl@eagleconsultingusa.com","producto":"Black","productoDetalle":"APARTADO BLACK ACCESS SYNERGY ULIMITED MX 2026","acceso":"activo","banco":"Otro","bancoDetalle":"","numeroTarjeta":"","numeroOperacion":"2302617405","notas":"⚠️ Verificar acceso manualmente. Importado de export directo Kajabi.","costoEmpresa":0,"costoEmpresaDivisa":"MXN","resultado":"completo"},
  {"evento":"WUSA","mes":"2026-08","plataforma":"Kajabi","fechaDevolucion":"2026-08-24","monto":250,"divisa":"USD","correo":"sainzdoc@gmail.com","producto":"Black","productoDetalle":"APARTADO BLACK ACCESS SYNERGY ULIMITED MX 2026","acceso":"activo","banco":"Otro","bancoDetalle":"","numeroTarjeta":"","numeroOperacion":"2301792989","notas":"⚠️ Verificar acceso manualmente. Importado de export directo Kajabi.","costoEmpresa":0,"costoEmpresaDivisa":"MXN","resultado":"completo"},
  {"evento":"WUSA","mes":"2026-08","plataforma":"Kajabi","fechaDevolucion":"2026-08-06","monto":1499,"divisa":"USD","correo":"maritzaportillo47@yahoo.com","producto":"Club Sinergetico","productoDetalle":"Club Sinergético | USA |  SEGUIMIENTO $1499 USD","acceso":"activo","banco":"Otro","bancoDetalle":"","numeroTarjeta":"","numeroOperacion":"2300537323","notas":"⚠️ Verificar acceso manualmente. Importado de export directo Kajabi.","costoEmpresa":0,"costoEmpresaDivisa":"MXN","resultado":"disputa-perdida"},
].map(r => ({ ...r, importId: 'reembolsos-kajabi-sep2026-v1' }))
