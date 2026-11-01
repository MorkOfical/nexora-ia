# Nexora IA

Nexora IA es un proyecto personal en desarrollo para aprender inteligencia artificial, bases de datos y desarrollo full stack construyendo una asistente local.

## Tecnologías

- Node.js y Express para la API.
- SQLite para persistir conversaciones y mensajes.
- Ollama para conectar un modelo de lenguaje local.
- HTML, CSS y JavaScript para la interfaz.

## Ejecutar localmente

1. Instala Node.js y Ollama.
2. Descarga un modelo en Ollama (por defecto `qwen3:1.7b`).
3. Ejecuta `npm install` y luego `npm run dev`.
4. Abre `http://127.0.0.1:3000`.

Se puede cambiar el modelo con las variables `OLLAMA_HOST` y `OLLAMA_MODEL`. La aplicación escucha en loopback y guarda el historial en SQLite local.

## Aprender con el proyecto

La bitácora de hitos y prácticas está en `docs/BITACORA_APRENDIZAJE.md`. El contexto público de arquitectura está en `docs/CONTEXTO_PROYECTO.md`.

- [Anthropic Courses](https://anthropic.skilljar.com/)
- [MDN Learn Web Development](https://developer.mozilla.org/en-US/docs/Learn_web_development)
- [SQLBolt](https://sqlbolt.com/)
- [SQLite Quickstart](https://www.sqlite.org/quickstart.html)

## Privacidad

La carpeta `data/`, los mensajes guardados, archivos de entorno, contexto personal (`CONTEXTO_MORK.md`) y estado local (`ESTADO_PROYECTO.md`) no forman parte del repositorio. Copia `.env.example` si se agrega configuración local; nunca guardes credenciales en Git.
