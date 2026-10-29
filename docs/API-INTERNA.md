# API interna de casos (reembolsos / contracargos / disputas) — v1

Solo lectura, para scripts, asistentes y cron del equipo. No es pública.

- Base: `https://<deployment>/api/v1` (producción: `https://portalsoporte.vercel.app/api/v1`)
- Auth: `Authorization: Bearer <llave>` (una llave por consumidor: donna, comercial, cron)
- Solo `GET`. Cualquier otro método responde `405`.
- Límite: 60 solicitudes por minuto por llave (`429` + `Retry-After`).
- Errores: `{ "error": "mensaje" }` con 400, 401, 404, 405, 429, 500 o 503.

## Rutas

| Ruta | Para qué |
|---|---|
| `GET /casos` | Lista con filtros, más recientes primero |
| `GET /casos/{id}` | Detalle (agrega `notas` y costo para la empresa) |
| `GET /casos/changes?since=<ISO>` | Polling: lo modificado después de `since`, del más viejo al más nuevo |

### Filtros de `/casos`

`estatus` (`en_disputa`, `ganada`, `perdida`, `completo`, `parcial`, `sin_clasificar`),
`tipo` (`reembolso`, `contracargo`), `procesador` (ej. `Hotmart`, `Stripe LLC`),
`desde` / `hasta` (`YYYY-MM-DD`, sobre la fecha de devolución, inclusivo),
`updated_since` (ISO 8601), `email` (exacto), `email_sha256` (SHA-256 en minúsculas del
correo en minúsculas; evita mandar el correo en la URL), `id_externo` (exacto),
`limit` (1–200, por defecto 50), `cursor`.

### Orden y paginación

`/casos`: `fechas.actualizado` descendente, con el `id` como desempate (orden estable).
Cada respuesta trae `page.next_cursor`; mándalo como `cursor` para la siguiente página
(con los mismos filtros). Cuando `has_more` es `false`, terminaste.

## Ejemplos (cámbialos por tu llave y tu URL)

```bash
BASE=https://portalsoporte.vercel.app/api/v1
KEY=psk_...   # tu llave; no la pegues en chats ni repos

# Últimos 5 casos
curl -s -H "Authorization: Bearer $KEY" "$BASE/casos?limit=5"

# Disputas abiertas
curl -s -H "Authorization: Bearer $KEY" "$BASE/casos?estatus=en_disputa"

# Hotmart de septiembre
curl -s -H "Authorization: Bearer $KEY" "$BASE/casos?procesador=Hotmart&desde=2026-09-01&hasta=2026-09-30"

# Por correo sin ponerlo en la URL
H=$(printf '%s' 'alumno@ejemplo.com' | shasum -a 256 | cut -d' ' -f1)
curl -s -H "Authorization: Bearer $KEY" "$BASE/casos?email_sha256=$H"

# Detalle
curl -s -H "Authorization: Bearer $KEY" "$BASE/casos/<id>"

# Polling cada N minutos: guarda el mayor fechas.actualizado y úsalo como since
curl -s -H "Authorization: Bearer $KEY" "$BASE/casos/changes?since=2026-10-28T00:00:00Z"
```

## Respuesta (lista)

```json
{
  "data": [
    {
      "id": "kT3xQ9aZ2mLpVw81NfRc",
      "tipo": "reembolso",
      "estatus": "completo",
      "monto": 5497,
      "moneda": "MXN",
      "procesador": "Hotmart",
      "id_externo": "HP1204822601",
      "producto": "Apartado",
      "producto_detalle": "APARTADO CLUB SINERGÉTICO MX MDL",
      "alumno": { "email": "alumno@ejemplo.com", "nombre": "Nombre Apellido" },
      "acceso": "activo",
      "fechas": {
        "devolucion": "2026-09-30",
        "creado": "2026-10-15T18:02:11.000Z",
        "actualizado": "2026-10-15T18:02:11.000Z",
        "vencimiento": null
      },
      "origen": "import:reembolsos-oct2026-v1",
      "calidad": ["fecha_devolucion_aproximada"],
      "url_portal": "https://portalsoporte.vercel.app/reembolsos?caso=kT3xQ9aZ2mLpVw81NfRc"
    }
  ],
  "page": { "limit": 50, "next_cursor": "eyJ1Ijoi…", "has_more": true },
  "meta": { "generado": "2026-10-29T15:00:00.000Z", "version": "v1", "total_filtrado": 212 }
}
```

### Campos

- `tipo`: `contracargo` si el caso tiene estatus de disputa o resultado "disputa perdida"; si no, `reembolso`.
- `estatus`: el estatus de disputa que se captura en el portal (`en_disputa`, `ganada`, `perdida`) o, si no hay, el resultado (`completo`, `parcial`, `perdida`); `sin_clasificar` si no tiene ninguno.
- `fechas.actualizado`: último cambio hecho desde el portal (campo `apiUpdatedAt`). En casos históricos sin ese campo se usa la fecha de última edición o de creación; **no es la fecha real de carga**, así que para polling usa `changes` con un `since` de hoy en adelante.
- `fechas.vencimiento`: fecha límite para responder una disputa, solo si se capturó.
- `calidad`: avisos de datos incompletos: `sin_id_externo`, `fecha_devolucion_aproximada` (Hotmart sin fecha de devolución), `mes_no_coincide`.
- `url_portal`: abre la ficha del caso en el portal (requiere sesión de una persona del equipo).
- No se exponen: tarjeta, banco, teléfono.
- Límite conocido: los casos borrados no aparecen en `changes`.

## Operación (para quien administra)

- La API lee Firestore con una cuenta de servicio guardada **solo** en la variable de entorno `FIREBASE_SERVICE_ACCOUNT` de Vercel (JSON o base64). Si falta, la API responde `503`.
- En el servidor solo viven los hashes SHA-256 de las llaves (`lib/apiKeys.json` y/o variable `PORTAL_API_KEYS_SHA256="consumidor:hash,..."`). Las llaves en claro nunca se guardan en el repo.
- **Rotación** (cada 90 días o cuando alguien salga del equipo): agregar el hash de la llave nueva junto al viejo, desplegar, cambiar el consumidor a la llave nueva, confirmar en los logs, y quitar el hash viejo.
- Logs de acceso (una línea JSON por solicitud): consumidor, ruta, código y milisegundos. No incluyen la consulta ni datos de los casos.
- Nuevo hash: `printf '%s' "$LLAVE" | shasum -a 256`.
