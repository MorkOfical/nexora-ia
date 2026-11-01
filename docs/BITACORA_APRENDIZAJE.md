# Bitácora de aprendizaje

Registra cada hito para que el trabajo se convierta en evidencia clara y comprobable.

## Hito 0 — Entorno de desarrollo

- Node.js ejecuta JavaScript fuera del navegador.
- npm administra paquetes y registra dependencias en `package.json` y `package-lock.json`.
- Git conserva versiones locales del proyecto; todavía no hay conexión a GitHub.
- Evidencia: versiones de Node/npm, manifiesto de dependencias y estructura inicial de la aplicación.

### Práctica breve

1. Explica con tus palabras la diferencia entre Node.js y npm.
2. Señala qué función cumplen `package.json` y `package-lock.json`.
3. Identifica qué carpetas contienen interfaz, API, base de datos y conexión con IA.

## Hito 1 — IA local conectada (preparación)

- **Fecha y objetivo:** 1 de noviembre de 2026; preparar un modelo que se ejecute en esta computadora.
- **Concepto aprendido:** la aplicación web guarda su propio historial en SQLite y envía la conversación a un modelo local a través de la API de Ollama.
- **Qué construimos:** instalamos Ollama 0.40.13 y descargamos `qwen3:1.7b` (1.4 GB); el adaptador de IA ya está en `src/ai/ollama.js`.
- **Cómo comprobé que quedó instalado:** `ollama --version` informó 0.40.13 y `ollama list` mostró `qwen3:1.7b`.
- **Comprobación realizada:** el servidor inició en `http://127.0.0.1:3000` y la interfaz detecta `qwen3:1.7b` como listo.
- **Práctica pendiente:** enviar un mensaje y observar cómo quedan el mensaje y la respuesta en SQLite.
- **Evidencia o cambio Git:** instalación local; todavía no hay commit.

### Práctica guiada siguiente

1. Sigue un mensaje desde el formulario de `public/app.js` hasta la ruta de `src/routes/chat.routes.js`.
2. Ubica dónde se guarda el mensaje y qué columnas tiene la tabla en `src/db/schema.sql`.
3. En la app abierta, compara el mensaje y la respuesta del modelo con las filas de SQLite.

## Plantilla para cada hito

- **Fecha y objetivo:**
- **Concepto aprendido:**
- **Qué construimos:**
- **Cómo comprobé que funciona:**
- **Problema y solución:**
- **Evidencia o cambio Git:**


