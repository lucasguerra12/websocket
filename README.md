# 💬 Chat em Tempo Real com WebSocket

> Projeto acadêmico — Fatec SJC  
> Implementação de um chat em tempo real utilizando WebSocket com Node.js, Express e a biblioteca `ws`.

---

## Sobre o Projeto

O objetivo é demonstrar na prática o funcionamento do protocolo **WebSocket**, que permite comunicação bidirecional e persistente entre cliente e servidor, sem a necessidade de recarregar a página ou realizar polling HTTP.

A aplicação permite que múltiplos usuários troquem mensagens em tempo real em um único canal de chat, com histórico acumulado de sessão e interface inspirada no WhatsApp Web.

---

## Tecnologias Utilizadas

| Tecnologia | Versão | Função |
|---|---|---|
| [Node.js](https://nodejs.org/) | 18+ | Runtime JavaScript no servidor |
| [Express](https://expressjs.com/) | ^4.x | Servidor HTTP e entrega de arquivos estáticos |
| [ws](https://github.com/websockets/ws) | ^8.x | Servidor WebSocket nativo para Node.js |
| HTML5 / CSS3 / JS | — | Interface do cliente no navegador |
| WebSocket API (nativa) | — | Conexão WebSocket no lado do cliente |

---

## Arquitetura

```
┌─────────────────────────────────────────────────┐
│                   CLIENTE (Browser)             │
│                                                 │
│   index.html  ──►  WebSocket API nativa         │
│                         │                       │
│                    ws://localhost:8887           │
└─────────────────────────┼───────────────────────┘
                          │  (WebSocket Upgrade via HTTP)
                          ▼
┌─────────────────────────────────────────────────┐
│               SERVIDOR (Node.js)                │
│                                                 │
│  Express ──► serve /public/index.html           │
│                                                 │
│  WebSocket Server (ws)                          │
│    ├── on connection  → adiciona ao Set         │
│    ├── on message     → atualiza histórico      │
│    │                  → broadcast para todos    │
│    └── on close       → remove do Set          │
└─────────────────────────────────────────────────┘
```

O servidor mantém **uma única conexão persistente por cliente** (ao contrário do HTTP, que fecha a conexão após cada resposta). Quando uma mensagem chega, ela é anexada ao histórico HTML e transmitida em **broadcast** para todos os clientes conectados simultaneamente.

---

## Pré-requisitos

- [Node.js](https://nodejs.org/) v18 ou superior
- npm (já incluso com o Node.js)

Para verificar se você tem o Node instalado:

```bash
node -v
npm -v
```

---

## Instalação e Execução

### 1. Clone o repositório

```bash
git clone https://github.com/lucasguerra12/websocket.git
cd websocket
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Inicie o servidor

```bash
node server.js
```

Você verá no terminal:

```
✅ Servidor rodando em http://localhost:8887
```

### 4. Acesse o chat

Abra o navegador em `http://localhost:8887`

> 💡 **Dica:** Para simular múltiplos usuários, abra a mesma URL em abas ou navegadores diferentes.

---

## Estrutura de Pastas

```
chat-websocket/
│
├── server.js           # Lógica do servidor WebSocket + Express
│
├── public/
│   └── index.html      # Interface do chat (HTML + CSS + JS client-side)
│
├── package.json        # Dependências e metadados do projeto
├── package-lock.json   # Lock de versões exatas das dependências
└── README.md           # Este arquivo
```

---

## Como Funciona

### Lado do Servidor (`server.js`)

1. O **Express** sobe um servidor HTTP e serve a pasta `/public` como arquivos estáticos.
2. O **servidor WebSocket (`ws`)** é anexado ao mesmo servidor HTTP — assim ambos rodam na mesma porta (8887).
3. Quando um cliente conecta (`on connection`):
   - Ele é adicionado a um `Set` de conexões ativas.
   - O histórico atual de mensagens é enviado imediatamente para ele, para que veja as mensagens anteriores.
4. Quando uma mensagem chega (`on message`):
   - O payload CSV (`usuario,mensagem,hora`) é parseado.
   - O conteúdo é sanitizado com `escapeHtml()` para prevenir XSS.
   - Um bloco HTML da mensagem é concatenado ao `chatHistory`.
   - O histórico atualizado é enviado em **broadcast** para todos os clientes com `readyState === OPEN`.
5. Quando um cliente desconecta (`on close`), ele é removido do `Set`.

### Lado do Cliente (`public/index.html`)

1. Ao carregar a página, o JavaScript cria uma instância de `WebSocket` apontando para `ws://localhost:8887`.
2. O evento `onopen` habilita o botão de enviar e atualiza o indicador de status para verde.
3. O evento `onmessage` recebe o HTML do histórico completo e o renderiza no `#chatbox`.
4. Ao clicar em "Enviar" (ou pressionar Enter), a mensagem é serializada como `"usuario,mensagem,HH:MM"` e enviada via `ws.send()`.

---

## Protocolo de Mensagens

A comunicação entre cliente e servidor usa um formato **CSV simples** de texto puro:

### Cliente → Servidor

```
lucas,Olá pessoal!,14:35
```

| Campo | Descrição |
|---|---|
| `lucas` | Nome de usuário |
| `Olá pessoal!` | Conteúdo da mensagem |
| `14:35` | Horário local do envio (gerado no cliente) |

### Servidor → Cliente (broadcast)

O servidor retorna o **HTML completo acumulado** do chat, que é injetado diretamente no `innerHTML` do `#chatbox`:

```html
<div class="msgBody">
  <p class="username">lucas diz:</p>
  <p class="message">
    Olá pessoal!
    <span class="time">14:35</span>
  </p>
</div>
```

> ⚠️ **Nota:** A abordagem de acumular e reenviar todo o histórico HTML é intencional para manter fidelidade à lógica original do projeto Python. Em produção, o ideal seria enviar apenas a mensagem nova (delta) e o cliente adicionaria ao DOM.

---


## Funcionalidades

- [x] Comunicação em tempo real via WebSocket
- [x] Broadcast de mensagens para todos os clientes conectados
- [x] Histórico de mensagens mantido durante a sessão do servidor
- [x] Indicador visual de conexão (online/offline)
- [x] Username salvo no `localStorage` entre sessões
- [x] Sanitização básica contra XSS
- [x] Envio de mensagem com a tecla Enter
- [x] Interface responsiva inspirada no WhatsApp Web

---

## 👨‍💻 Autores

Desenvolvido como projeto acadêmico.  
**Fatec São José dos Campos — Curso DSM**