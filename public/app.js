const conversationList = document.querySelector('#conversation-list');
const conversationCount = document.querySelector('#conversation-count');
const messagesElement = document.querySelector('#messages');
const emptyState = document.querySelector('#empty-state');
const composer = document.querySelector('#composer');
const input = document.querySelector('#message-input');
const sendButton = document.querySelector('#send-button');
const notice = document.querySelector('#notice');
const modelStatus = document.querySelector('#model-status');
const modelDescription = document.querySelector('#model-description');

let activeConversationId = null;
let isSending = false;

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  const payload = await response.json();
  return { response, payload };
}

function showNotice(message) {
  notice.textContent = message;
  notice.hidden = false;
}

function clearNotice() {
  notice.hidden = true;
  notice.textContent = '';
}

function renderMessages(messages) {
  messagesElement.replaceChildren();
  emptyState.hidden = messages.length > 0;
  messagesElement.append(emptyState);

  for (const message of messages) {
    const row = document.createElement('article');
    row.className = `message ${message.role}`;

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.setAttribute('aria-hidden', 'true');
    avatar.textContent = message.role === 'assistant' ? 'M' : 'Tú';

    const content = document.createElement('div');
    content.className = 'message-content';
    content.textContent = message.content;

    if (message.role === 'user') {
      row.append(content, avatar);
    } else {
      row.append(avatar, content);
    }
    messagesElement.append(row);
  }

  messagesElement.scrollTop = messagesElement.scrollHeight;
}

function renderConversationButtons(conversations) {
  conversationList.replaceChildren();
  conversationCount.textContent = String(conversations.length);

  for (const conversation of conversations) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `conversation-item${conversation.id === activeConversationId ? ' active' : ''}`;
    button.textContent = conversation.title;
    button.title = conversation.title;
    button.addEventListener('click', () => openConversation(conversation.id));
    conversationList.append(button);
  }
}

async function loadConversations() {
  const { response, payload } = await requestJson('/api/conversations');
  if (!response.ok) throw new Error(payload.error || 'No pude cargar las conversaciones.');
  renderConversationButtons(payload.conversations);
}

async function openConversation(id) {
  clearNotice();
  activeConversationId = id;
  const { response, payload } = await requestJson(`/api/conversations/${id}/messages`);
  if (!response.ok) {
    showNotice(payload.error || 'No pude abrir la conversación.');
    return;
  }
  renderMessages(payload.messages);
  await loadConversations();
}

async function createConversation() {
  const { response, payload } = await requestJson('/api/conversations', { method: 'POST' });
  if (!response.ok) throw new Error(payload.error || 'No pude crear una conversación.');
  activeConversationId = payload.conversation.id;
  renderMessages([]);
  await loadConversations();
  input.focus();
}

async function checkModelStatus() {
  try {
    const { response, payload } = await requestJson('/api/health');
    if (!response.ok) throw new Error('Estado no disponible.');

    const modelReady = payload.ollamaAvailable && payload.modelInstalled;
    modelStatus.classList.toggle('offline', !modelReady);

    if (modelReady) {
      modelStatus.querySelector('span:last-child').textContent = `Modelo listo · ${payload.model}`;
      modelDescription.textContent = `${payload.model} está disponible en esta computadora.`;
    } else if (payload.ollamaAvailable) {
      modelStatus.querySelector('span:last-child').textContent = `Falta descargar ${payload.model}`;
      modelDescription.textContent = `Ollama responde; falta descargar ${payload.model}.`;
    } else {
      modelStatus.querySelector('span:last-child').textContent = 'Ollama no conectado';
      modelDescription.textContent = `La aplicación está preparada para ${payload.model}; falta iniciar Ollama.`;
    }
  } catch {
    modelStatus.classList.add('offline');
    modelStatus.querySelector('span:last-child').textContent = 'Estado local no disponible';
  }
}

composer.addEventListener('submit', async (event) => {
  event.preventDefault();
  const content = input.value.trim();
  if (!content || isSending) return;

  isSending = true;
  sendButton.disabled = true;
  clearNotice();

  try {
    if (!activeConversationId) await createConversation();

    const { response, payload } = await requestJson(
      `/api/conversations/${activeConversationId}/messages`,
      { method: 'POST', body: JSON.stringify({ content }) },
    );

    if (payload.messages) {
      renderMessages(payload.messages);
      input.value = '';
    }
    if (!response.ok) showNotice(payload.error || 'No pude enviar el mensaje.');
    await loadConversations();
  } catch (error) {
    showNotice(error.message || 'Ocurrió un error al guardar el mensaje.');
  } finally {
    isSending = false;
    sendButton.disabled = false;
    input.focus();
  }
});

document.querySelector('#new-chat-button').addEventListener('click', async () => {
  try {
    await createConversation();
    clearNotice();
  } catch (error) {
    showNotice(error.message || 'No pude crear una conversación.');
  }
});

document.querySelectorAll('.suggestion').forEach((button) => {
  button.addEventListener('click', () => {
    input.value = button.textContent;
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
  });
});

async function start() {
  try {
    await loadConversations();
    await checkModelStatus();
  } catch (error) {
    showNotice(error.message || 'No pude iniciar Nexora IA.');
  }
}

start();
