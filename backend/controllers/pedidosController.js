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
function listar(req, res) {
    db.query("SELECT * FROM pedidos ORDER BY id DESC", (err, results) => {
        if (err) return res.status(500).json({ erro: err.message });

        // força quantidade como number
        const pedidos = results.map(p => ({
            ...p,
            quantidade: Number(p.quantidade)
        }));

        res.json(pedidos);
    });
}

// POST /pedidos
function criar(req, res) {
    const { cliente, produto } = req.body;
    const quantidade = Number(req.body.quantidade);

    db.query(
        "INSERT INTO pedidos (cliente, produto, quantidade) VALUES (?, ?, ?)",
        [cliente, produto, quantidade],
        (err, result) => {
            if (err) return res.status(500).json({ erro: err.message });

            const novoPedido = {
                id: result.insertId,
                cliente,
                produto,
                quantidade: Number(quantidade),
                status: "novo"
            };

            broadcast({ tipo: "novo_pedido", pedido: novoPedido });

            res.json(novoPedido);
        }
    );
}

// PUT /pedidos/:id
function atualizar(req, res) {
    const { id } = req.params;
    const { cliente, produto, status } = req.body;
    const quantidade = Number(req.body.quantidade);

    db.query(
        "UPDATE pedidos SET cliente=?, produto=?, quantidade=?, status=? WHERE id=?",
        [cliente, produto, quantidade, status, id],
        (err) => {
            if (err) return res.status(500).json({ erro: err.message });

            const pedidoAtualizado = {
                id: Number(id),
                cliente,
                produto,
                quantidade: Number(quantidade),
                status
            };

            broadcast({ tipo: "pedido_atualizado", pedido: pedidoAtualizado });

            res.json(pedidoAtualizado);
        }
    );
}

// DELETE /pedidos/:id
function deletar(req, res) {
    const { id } = req.params;

    db.query("DELETE FROM pedidos WHERE id=?", [id], (err) => {
        if (err) return res.status(500).json({ erro: err.message });

        broadcast({ tipo: "pedido_deletado", id: Number(id) });

        res.json({ sucesso: true });
    });
}

module.exports = { listar, criar, atualizar, deletar, setWebSocketServer };