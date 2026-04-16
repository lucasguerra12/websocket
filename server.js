const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const path = require("path");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = 8887;

app.use(express.static(path.join(__dirname, "public")));

let chatHistory = "";

const connections = new Set();

wss.on("connection", (ws) => {
  connections.add(ws);
  console.log(`[+] Cliente conectado. Total: ${connections.size}`);


  ws.send(chatHistory);

  ws.on("message", (raw) => {
    const message = raw.toString();
    const parts = message.split(",");


    if (parts.length < 3) return;

    const [userName, mensagem, hora] = parts;

    chatHistory += `
      <div class="msgBody">
        <p class="username">${escapeHtml(userName)} diz:</p>
        <p class="message">
          ${escapeHtml(mensagem)}
          <span class="time">${escapeHtml(hora)}</span>
        </p>
      </div>`;

    console.log(`[MSG] ${userName} (${hora}): ${mensagem}`);

    for (const client of connections) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(chatHistory);
      }
    }
  });

  ws.on("close", () => {
    connections.delete(ws);
    console.log(`[-] Cliente desconectado. Total: ${connections.size}`);
  });

  ws.on("error", (err) => {
    console.error("[ERRO]", err.message);
    connections.delete(ws);
  });
});

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

server.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
});