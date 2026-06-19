# Trackify v2

Sistema de trazabilidad del gasto público de Costa Rica anclado en Stellar Testnet mediante contratos inteligentes Soroban.

---

## El problema

Las instituciones públicas costarricenses publican su presupuesto aprobado en el SIPP (CGR) y registran sus contrataciones en SICOP — dos sistemas sin conexión entre sí. Detectar si una partida fue contratada por encima de lo aprobado requiere cruzar ambas fuentes manualmente, sin garantía de que los datos no hayan sido alterados antes de la auditoría.

---

## La solución

Trackify v2 ancla el presupuesto aprobado directamente en un contrato Soroban (Stellar Testnet) y acumula cada contratación como una transacción on-chain. El estado es público, inmutable y verificable en tiempo real desde cualquier explorador de Stellar.

**Institución piloto:** Municipalidad de Cartago — categoría SERVICIOS, presupuesto 2026.

---

## Arquitectura

```
generador/ ──→ ingesta/ ──→ Soroban Contract ──→ frontend/
  (goteo de      (API Express   (Stellar Testnet)   (dashboard React)
  licitaciones)  + validación)                      pollea cada 5s
```

| Componente | Descripción |
|------------|-------------|
| `contrato/` | Contrato Soroban en Rust — almacena presupuesto y ejecutado por partida |
| `ingesta/`  | API Express que valida y firma transacciones hacia el contrato |
| `generador/`| Genera licitaciones simuladas y las envía a la ingesta en goteo |
| `src/`      | Dashboard React que lee el contrato vía RPC (solo lectura, sin firma) |

---

## Contrato Soroban

**Contract ID:** `CCL7QSQ3FBG5FIUHNHZB37ZHDRTV4XN6AS5LQMSKZHA24D2JZQOZ4CHP`

Tres funciones:

```rust
init(partidas: Map<String, i128>)                              // carga presupuesto aprobado — solo una vez
registrar(licitacion, partida, monto, razon)                   // acumula ejecutado y emite evento
get_estado() → Estado { presupuesto, ejecutado }               // consulta de solo lectura
```

Verificar en Stellar Expert:
`https://stellar.expert/explorer/testnet/contract/CCL7QSQ3FBG5FIUHNHZB37ZHDRTV4XN6AS5LQMSKZHA24D2JZQOZ4CHP`

---

## Requisitos

| Herramienta | Versión mínima |
|-------------|----------------|
| Node.js     | 18+            |
| Rust + Cargo | 1.80+         |
| stellar-cli | 26.x           |
| wasm32v1-none target | — |

Instalar el target WASM si no está:
```bash
rustup target add wasm32v1-none
```

---

## Variables de entorno

**`.env`** (raíz — frontend):
```env
STELLAR_SECRET_KEY=S...
VITE_CONTRACT_ID=CCL7QSQ3FBG5FIUHNHZB37ZHDRTV4XN6AS5LQMSKZHA24D2JZQOZ4CHP
VITE_RPC_URL=https://soroban-testnet.stellar.org
VITE_STELLAR_SIM_ACCOUNT=GDQWE3D5D7QMV5SLOJTI5HB23E6Y2D2MBT6CLE5TDKIOW65TKNJT6DYF
```

**`ingesta/.env`**:
```env
PORT=3001
STELLAR_SECRET_KEY=S...
CONTRACT_ID=CCL7QSQ3FBG5FIUHNHZB37ZHDRTV4XN6AS5LQMSKZHA24D2JZQOZ4CHP
STELLAR_RPC_URL=https://soroban-testnet.stellar.org
```

---

## Instalación

```bash
git clone https://github.com/WeebL0rd/Trackify.git
cd trackify

# Frontend
npm install
cp .env.example .env

# Ingesta
cd ingesta && npm install && cp .env.example .env && cd ..

# Generador
cd generador && npm install && cd ..
```

---

## Correr el sistema completo

Se necesitan **3 terminales** abiertas simultáneamente:

**Terminal 1 — Ingesta** (API que firma transacciones en Stellar):
```bash
cd ingesta
npm run dev
# → [ingesta] servidor escuchando en http://localhost:3001
```

**Terminal 2 — Generador** (goteo de licitaciones simuladas cada 4 segundos):
```bash
cd generador
npm run dev
# → [OK ] 2026LN-000001-MCAR  1.04.02  ₡8.500.000  → a1b2c3...
```

**Terminal 3 — Frontend** (dashboard en tiempo real):
```bash
npm run dev
# → http://localhost:5173
```

El dashboard hace polling al contrato cada 5 segundos. A medida que el generador envía licitaciones a través de la ingesta, el monto ejecutado sube en tiempo real.

---

## Semáforo de ejecución

| Estado | Condición | Color |
|--------|-----------|-------|
| Normal | < 80% del presupuesto consumido | Azul |
| En límite | ≥ 80% consumido | Ámbar |
| Exceso | > 100% — inconsistencia detectada | Rojo |

---

## Reiniciar el presupuesto ejecutado

Desde el dashboard, el botón **↺ Reiniciar** en el header despliega un contrato nuevo con el presupuesto SIPP en cero y actualiza todos los componentes automáticamente (~30 segundos).

Desde la terminal:
```bash
# En la raíz del proyecto (requiere ingesta corriendo)
curl -X POST http://localhost:3001/reset
```

---

## Compilar el contrato

`contrato/target/` está en `.gitignore` — el WASM no se versiona, hay que compilarlo localmente:

```bash
cd contrato
stellar contract build
# → Wasm: target/wasm32v1-none/release/trackify_contrato.wasm
```

---

## Verificación SEP-58

El contrato tiene metadatos SEP-58 embebidos en el WASM, lo que permite verificar que
el código desplegado corresponde exactamente al código fuente en el repositorio.

```bash
curl -X POST https://stellar-contract-verification.fly.dev/verify \
  -H "Content-Type: application/json" \
  -d '{"contract_id": "CCL7QSQ3FBG5FIUHNHZB37ZHDRTV4XN6AS5LQMSKZHA24D2JZQOZ4CHP"}'
```

WASM hash on-chain: `687a8db6fceed75df43876b0a09714f5bf758ec869982b49cd512009f90f903e`
SHA del código fuente: `ccad8beb264c9018a4fdd7ab94a4790116f41e94`

---

## Partidas presupuestarias (SIPP 2026)

| Código | Descripción | Aprobado (₡) |
|--------|-------------|--------------|
| 1.04.01 | Alquileres y Cánones | 48,500,000 |
| 1.04.02 | Servicios Básicos | 112,000,000 |
| 1.04.03 | Servicios Comerciales y Financieros | 87,300,000 |
| 1.04.04 | Servicios de Gestión y Apoyo | 63,200,000 |
| 1.04.05 | Gastos de Viaje y Transporte | 34,800,000 |
| 1.04.06 | Seguros y Reaseguros | 55,000,000 |
| 1.05.01 | Capacitación y Protocolo | 29,400,000 |
| 1.05.02 | Mantenimiento y Reparación | 18,900,000 |
| **Total** | | **₡449,100,000** |

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Smart contract | Rust · soroban-sdk 21.x · Stellar Testnet |
| Backend | Node.js 18 · Express · TypeScript · stellar-sdk 15.x |
| Frontend | React 19 · Vite · Tailwind CSS · stellar-sdk 15.x |
| Toolchain | stellar-cli 26.x · Cargo 1.96 · wasm32v1-none |

---

## Contexto

Desarrollado en Costa Rica, junio 2026, como MVP para demostrar que la trazabilidad del gasto público institucional puede ser automatizada, verificable e inmutable usando tecnología blockchain accesible.
