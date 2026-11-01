import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import chatRoutes from './routes/chat.routes.js';
import { ollamaSettings } from './ai/ollama.js';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(currentDirectory, '..');
const app = express();
const port = Number(process.env.PORT || 3000);

app.use(express.json({ limit: '32kb' }));
app.use(express.static(path.join(projectRoot, 'public')));

app.get('/api/health', async (_request, response) => {
  let ollamaAvailable = false;
  let modelInstalled = false;

  try {
    const result = await fetch(`${ollamaSettings.host}/api/tags`, {
      signal: AbortSignal.timeout(1500),
    });
    ollamaAvailable = result.ok;

    if (ollamaAvailable) {
      const payload = await result.json();
      const expectedModel = ollamaSettings.model.toLowerCase();
      modelInstalled = payload.models?.some((model) =>
        [model.name, model.model].some((name) => name?.toLowerCase() === expectedModel),
      ) || false;
    }
  } catch {
    ollamaAvailable = false;
    modelInstalled = false;
  }

  response.json({
    status: 'ok',
    modelProvider: 'Ollama local',
    model: ollamaSettings.model,
    ollamaAvailable,
    modelInstalled,
  });
});

app.use('/api', chatRoutes);

app.use('/api', (_request, response) => {
  response.status(404).json({ error: 'No encontré esa ruta.' });
});

app.listen(port, '127.0.0.1', () => {
  console.log(`Nexora IA disponible en http://127.0.0.1:${port}`);
});
