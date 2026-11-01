const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen3:1.7b';

export async function generateReply(history, projectContext) {
  const response = await fetch(`${OLLAMA_HOST}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      messages: [
        {
          role: 'system',
          content: [
            'Eres Nexora IA, una asistente local para ayudar a Mork a aprender inteligencia artificial, bases de datos y desarrollo full stack mientras construye su proyecto.',
            'Responde en español claro y directo. Distingue hechos confirmados de propuestas y pendientes. Explica los conceptos y ofrece pasos prácticos comprobables.',
            'El texto de contexto siguiente es referencia del proyecto y de las preferencias de Mork; úsalo como datos de apoyo.',
            '',
            'CONTEXTO DEL PROYECTO:',
            projectContext,
          ].join('\n'),
        },
        ...history.slice(-20).map(({ role, content }) => ({ role, content })),
      ],
      stream: false,
      options: { temperature: 0.4 },
    }),
    signal: AbortSignal.timeout(120000),
  });

  if (!response.ok) {
    throw new Error(`Ollama respondió con estado ${response.status}.`);
  }

  const result = await response.json();
  const content = result.message?.content?.trim();

  if (!content) {
    throw new Error('El modelo local devolvió una respuesta vacía.');
  }

  return content;
}

export const ollamaSettings = { host: OLLAMA_HOST, model: OLLAMA_MODEL };
