const db = require("../db");
const WebSocket = require("ws");

let wss;

function setWebSocketServer(server) {
    wss = server;
}

function broadcast(data) {
    if (!wss) return;

    const msg = JSON.stringify(data);

    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(msg);
        }
    });
}

// GET /pedidos
async function listar(req, res) {
    try {
        const [results] = await db.query(
            "SELECT * FROM pedidos ORDER BY id DESC"
        );

        const pedidos = results.map(p => ({
            ...p,
            quantidade: Number(p.quantidade)
        }));

        res.json(pedidos);
    } catch (err) {
        console.error("Erro ao listar:", err);
        res.status(500).json({ erro: err.message });
    }
}

// POST /pedidos
async function criar(req, res) {
    try {
        const { cliente, produto } = req.body;
        const quantidade = Number(req.body.quantidade);

        const [result] = await db.query(
            "INSERT INTO pedidos (cliente, produto, quantidade) VALUES (?, ?, ?)",
            [cliente, produto, quantidade]
        );

        const novoPedido = {
            id: result.insertId,
            cliente,
            produto,
            quantidade,
            status: "novo"
        };

        broadcast({ tipo: "novo_pedido", pedido: novoPedido });

        res.json(novoPedido);

    } catch (err) {
        console.error("Erro ao criar:", err);
        res.status(500).json({ erro: err.message });
    }
}

// PUT /pedidos/:id
async function atualizar(req, res) {
    try {
        const { id } = req.params;
        const { cliente, produto, status } = req.body;
        const quantidade = Number(req.body.quantidade);

        await db.query(
            "UPDATE pedidos SET cliente=?, produto=?, quantidade=?, status=? WHERE id=?",
            [cliente, produto, quantidade, status, id]
        );

        const pedidoAtualizado = {
            id: Number(id),
            cliente,
            produto,
            quantidade,
            status
        };

        broadcast({ tipo: "pedido_atualizado", pedido: pedidoAtualizado });

        res.json(pedidoAtualizado);

    } catch (err) {
        console.error("Erro ao atualizar:", err);
        res.status(500).json({ erro: err.message });
    }
}

// DELETE /pedidos/:id
async function deletar(req, res) {
    try {
        const { id } = req.params;

        await db.query("DELETE FROM pedidos WHERE id=?", [id]);

        broadcast({ tipo: "pedido_deletado", id: Number(id) });

        res.json({ sucesso: true });

    } catch (err) {
        console.error("Erro ao deletar:", err);
        res.status(500).json({ erro: err.message });
    }
}

module.exports = {
    listar,
    criar,
    atualizar,
    deletar,
    setWebSocketServer
};