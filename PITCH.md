# Trackify — Pitch 2 minutos

---

## El problema (20 seg)

En Costa Rica, el presupuesto público aprobado vive en un sistema llamado SIPP.
Las contrataciones reales viven en otro sistema llamado SICOP.
**Nadie los conecta.**

Detectar si una institución gastó más de lo que tenía aprobado toma hasta 10 días hábiles de trabajo manual — y eso asumiendo que nadie alteró los datos antes de que llegue el auditor.

---

## La pregunta clave (10 seg)

> ¿Cómo sabemos que el presupuesto que estamos auditando hoy
> es el mismo que fue aprobado hace seis meses?

Con los sistemas actuales: **no podemos saberlo.**

---

## La solución (30 seg)

Trackify ancla el presupuesto aprobado directamente en **Stellar**, una red blockchain pública.

Cada vez que una institución registra una contratación, esa operación queda grabada en la cadena como una transacción irreversible con marca de tiempo.

El resultado: un registro público, verificable por cualquier ciudadano, que nadie puede editar ni borrar — ni el funcionario, ni el auditor, ni nosotros mismos.

---

## Por qué Stellar (25 seg)

Stellar no es Bitcoin. No es una red de especulación financiera.

Es una red diseñada específicamente para **mover valor de forma rápida, barata y transparente** — exactamente lo que necesita la gestión pública.

Tres razones concretas:

- **Costo:** Una transacción cuesta menos de un centavo de dólar.
- **Velocidad:** Confirmación en 5 segundos.
- **Contratos inteligentes:** Con Soroban, podemos programar reglas directamente en la cadena — como "esta partida tiene un límite de ₡48 millones".

---

## Lo que construimos (20 seg)

Un contrato inteligente que vive en Stellar Testnet con el presupuesto de la Asamblea Legislativa cargado.

Cada licitación que entra al sistema se convierte en una transacción on-chain.
El dashboard lee ese contrato en tiempo real y muestra cuánto se ha ejecutado en cada partida, con un semáforo: verde, amarillo o rojo.

**No hay base de datos central. No hay intermediario. No hay forma de manipular el historial.**

---

## Por qué importa (15 seg)

Costa Rica gasta **₡12 billones al año** en presupuesto público.
Hoy, la única forma de fiscalizarlo es confiar en que los datos son correctos.

Trackify transforma esa confianza ciega en **verificación matemática**.

---

## El estado actual

- Contrato desplegado en Stellar Testnet ✓
- Presupuesto de Asamblea Legislativa cargado (₡449 millones, 8 partidas) ✓
- API de ingesta validando y firmando transacciones ✓
- Dashboard en tiempo real ✓
- Próximo paso: integración con datos reales de SICOP vía API de Hacienda

---

> *"No pedimos que confíen en nosotros.
> Pedimos que verifiquen."*
