const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");
const path = require("path");

const pedidosRoutes = require("./routes/pedidos");
const controller = require("./controllers/pedidosController");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// ===============================
// 🔧 CORS
// ===============================
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"]
}));

// ===============================
// 📁 Arquivos estáticos
// ===============================

// Servir arquivos estáticos da pasta public (na raiz)
app.use(express.static(path.join(__dirname, "public")));

// ===============================
// JSON + Rotas
// ===============================
app.use(express.json());
app.use("/pedidos", pedidosRoutes);

// ===============================
// Configurar WebSocket no controller
// ===============================
controller.setWebSocketServer(wss);

// ===============================
// WebSocket conexão
// ===============================
wss.on("connection", (ws) => {
    console.log("Cliente WebSocket conectado");
    ws.send(JSON.stringify({ tipo: "conectado" }));

    ws.on("close", () => {
        console.log("Cliente WebSocket desconectado");
    });
});

// ===============================
// Iniciar servidor
// ===============================
const PORT = 3000;
server.listen(PORT, () => console.log(`Servidor Node rodando na porta ${PORT} 🚀`));