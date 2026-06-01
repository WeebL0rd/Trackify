# Trackify

Sistema que detecta inconsistencias entre el presupuesto aprobado de municipalidades costarricenses y las contrataciones ejecutadas, y ancla la evidencia en Stellar Testnet.

---

## El problema

Las municipalidades de Costa Rica publican su presupuesto aprobado en el SIPP (CGR), pero las contrataciones reales se registran en SICOP — dos sistemas sin conexión entre sí. Detectar si una partida fue contratada por más de lo aprobado requiere cruzar ambas fuentes manualmente, un proceso que toma hasta 10 días hábiles por municipalidad. Sin trazabilidad inmutable, no hay garantía de que el presupuesto analizado no haya sido alterado antes de la auditoría.

---

## La solución

Trackify automatiza el cruce SIPP vs SICOP en segundos, clasifica cada partida como `ok`, `límite` o `inconsistencia`, y ancla el hash SHA-256 del presupuesto aprobado en Stellar Testnet. Cualquier auditor puede verificar en el explorador público que los datos no fueron modificados desde el momento del análisis.

---

## Demo en vivo

Transacción real anclada en Stellar Testnet:

🔗 [stellar.expert/explorer/testnet/tx/c736c0ac...](https://stellar.expert/explorer/testnet/tx/c736c0ac00281047614979c86c6384c334c763ac2e37ac7a03980040523f0652)

Memo: `TRACKIFY-MCR-2025-753EC6EF`

---

## Requisitos

- Node.js 20+
- npm

---

## Instalación

```bash
git clone https://github.com/tu-usuario/trackify.git
cd trackify
npm install
cp .env.example .env
```

---

## Configuración del .env

Edita el archivo `.env` con tus credenciales:

```env
STELLAR_SECRET_KEY=SXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### Cómo obtener tu STELLAR_SECRET_KEY (gratis, 2 minutos)

1. Ve a [laboratory.stellar.org/account-creator?network=test](https://laboratory.stellar.org/account-creator?network=test)
2. Haz clic en **Generate keypair**
3. Copia el valor de **Secret key** (empieza con `S`)
4. Haz clic en **Fund account with Friendbot** → la cuenta recibe 10,000 XLM de testnet

> No compartas tu Secret key ni la subas a un repositorio público.

---

## Correr la demo completa

```bash
node scripts/runDemo.js
```

El script ejecuta cuatro pasos en orden:

| Paso | Qué hace                                                                    |
| ---- | --------------------------------------------------------------------------- |
| 1/4  | Lee `data/sipp_2025.json` y genera el hash SHA-256 del presupuesto aprobado |
| 2/4  | Ancla el hash en Stellar Testnet con un memo `TRACKIFY-MCR-2025-{HASH8}`    |
| 3/4  | Cruza SIPP vs SICOP y clasifica las 20 partidas por estado                  |
| 4/4  | Escribe `src/data/resultado_demo.json` con todo el contexto blockchain      |

Salida esperada:

```
╔══════════════════════════════════════════╗
║         TRACKIFY — Demo Runner           ║
╚══════════════════════════════════════════╝

[1/4] Cargando y hasheando presupuesto SIPP...
      → Hash SHA-256: 753ec6ef3e9d85df...
      → Total presupuestado: ₡20.106.835.697

[2/4] Anclando en Stellar Testnet...
      → Memo: TRACKIFY-MCR-2025-753EC6EF
      → Transaction hash: c736c0ac...
      → 🔗 https://stellar.expert/explorer/testnet/tx/...

[3/4] Cruzando SIPP vs SICOP...
      → 15 partidas analizadas
      → ✅  ok:             7 partidas
      → ⚠️   limite:         5 partidas
      → 🚨  inconsistencia: 3 partidas
      → Monto total en exceso: ₡620.527.531

[4/4] Guardando resultado_demo.json...
      → ✓ src/data/resultado_demo.json actualizado
      → ✓ Listo. Ejecuta: npm run dev
```

---

## Ver el dashboard

```bash
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173) en el navegador.

El dashboard muestra:

- Resumen ejecutivo con los totales y el monto en exceso
- Tabla de partidas con semáforo por estado
- Filtro para ver solo las inconsistencias
- Panel blockchain con el hash, memo y enlace al explorador de Stellar

---

## Scripts individuales

```bash
# Genera el hash SHA-256 del presupuesto y verifica que es determinístico
node scripts/hashPresupuesto.js

# Cruza SIPP vs SICOP e imprime las inconsistencias detectadas
node scripts/cruzarDatos.js

# Ancla el hash en Stellar Testnet y devuelve el Transaction ID
node scripts/anclarEnStellar.js
```

---

## Datos

| Archivo                         | Descripción                                                                      |
| ------------------------------- | -------------------------------------------------------------------------------- |
| `data/sipp_2025.json`           | Presupuesto aprobado exportado del SIPP/CGR — 20 partidas, ₡20.106.835.697 total |
| `data/sicop_simulado_2025.json` | Contrataciones SICOP con 3 inconsistencias plantadas para la demo                |

### Las 3 inconsistencias de la demo

| Partida                                   | Aprobado       | Contratado     | Exceso |
| ----------------------------------------- | -------------- | -------------- | ------ |
| SERVICIOS DE GESTIÓN Y APOYO              | ₡2.659.036.571 | ₡3.100.000.000 | +16.6% |
| HERRAMIENTAS, REPUESTOS Y ACCESORIOS      | ₡129.302.076   | ₡187.500.000   | +45.0% |
| ÚTILES, MATERIALES Y SUMINISTROS DIVERSOS | ₡267.633.822   | ₡389.000.000   | +45.3% |

---

## Stack

- **Frontend:** React 19 + Tailwind CSS + Vite
- **Scripts:** Node.js 20 — CommonJS
- **Blockchain:** Stellar Testnet via `@stellar/stellar-sdk`
- **Datos:** JSON locales, sin base de datos

---

## Contexto

Desarrollado en Costa Rica, mayo 2026, como MVP para demostrar que la transparencia presupuestaria municipal puede ser automatizada y verificable de forma inmutable.
