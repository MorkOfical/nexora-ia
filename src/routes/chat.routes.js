import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Router } from 'express';
import database from '../db/database.js';
import { generateReply } from '../ai/ollama.js';

const router = Router();
const privateContextPath = fileURLToPath(new URL('../../CONTEXTO_MORK.md', import.meta.url));
const publicContextPath = fileURLToPath(new URL('../../docs/CONTEXTO_PROYECTO.md', import.meta.url));

function readProjectContext() {
  try {
    return readFileSync(privateContextPath, 'utf8');
  } catch {
    return readFileSync(publicContextPath, 'utf8');
  }
}

const findConversation = database.prepare(
  'SELECT id, title, created_at, updated_at FROM conversations WHERE id = ?',
);
const findMessages = database.prepare(
  'SELECT id, role, content, created_at FROM messages WHERE conversation_id = ? ORDER BY id',
);

function parseConversationId(value) {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

router.get('/conversations', (_request, response) => {
  const conversations = database.prepare(
    'SELECT id, title, created_at, updated_at FROM conversations ORDER BY updated_at DESC, id DESC',
  ).all();

  response.json({ conversations });
});

router.post('/conversations', (_request, response) => {
  const result = database.prepare(
    'INSERT INTO conversations (title) VALUES (?)',
  ).run('Nueva conversación');

  response.status(201).json({ conversation: findConversation.get(result.lastInsertRowid) });
});

router.get('/conversations/:id/messages', (request, response) => {
  const conversationId = parseConversationId(request.params.id);
  if (!conversationId) {
    return response.status(400).json({ error: 'El identificador de conversación no es válido.' });
  }

  const conversation = findConversation.get(conversationId);
  if (!conversation) {
    return response.status(404).json({ error: 'No encontré esa conversación.' });
  }

  return response.json({ messages: findMessages.all(conversationId) });
});

router.post('/conversations/:id/messages', async (request, response) => {
  const conversationId = parseConversationId(request.params.id);
  if (!conversationId) {
    return response.status(400).json({ error: 'El identificador de conversación no es válido.' });
  }

  const conversation = findConversation.get(conversationId);
  const content = typeof request.body?.content === 'string' ? request.body.content.trim() : '';

  if (!conversation) {
    return response.status(404).json({ error: 'No encontré esa conversación.' });
  }

  if (!content || content.length > 10000) {
    return response.status(400).json({ error: 'Escribe un mensaje de hasta 10 000 caracteres.' });
  }

  const previousCount = database.prepare(
    'SELECT COUNT(*) AS count FROM messages WHERE conversation_id = ?',
  ).get(conversationId).count;

  database.prepare(
    'INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)',
  ).run(conversationId, 'user', content);

  if (previousCount === 0) {
    const title = content.length > 72 ? `${content.slice(0, 69)}…` : content;
    database.prepare(
      'UPDATE conversations SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    ).run(title, conversationId);
  }

  try {
    const projectContext = readProjectContext();
    const history = findMessages.all(conversationId).map(({ role, content: messageContent }) => ({
      role,
      content: messageContent,
    }));
    const reply = await generateReply(history, projectContext);

    database.prepare(
      'INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)',
    ).run(conversationId, 'assistant', reply);
    database.prepare(
      'UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    ).run(conversationId);

    return response.status(201).json({ messages: findMessages.all(conversationId) });
  } catch {
    return response.status(503).json({
      error: 'Guardé tu mensaje, pero el modelo local no está disponible. Cuando conectemos Ollama, podrás recibir respuestas aquí.',
      messages: findMessages.all(conversationId),
    });
  }
});

export default router;

