    const WS_URL = "ws://api-nodemysql-sqat0n-c9d485-187-77-60-115.traefik.me/pedidos";
    const API_URL = "http://api-nodemysql-sqat0n-c9d485-187-77-60-115.traefik.me/pedidos";
    const lista = document.getElementById("listaPedidos");
    const modalElement = document.getElementById("modalPedido");
    const modal = new bootstrap.Modal(modalElement);
    const btnSalvar = document.getElementById("btnSalvar");

    let pedidos = [];
    let ws;

    // Atualizar estatísticas do header
    function atualizarStats() {
            const stats = {
        novo: pedidos.filter(p => p.status === 'novo').length,
                preparando: pedidos.filter(p => p.status === 'preparando').length,
                entregue: pedidos.filter(p => p.status === 'entregue').length
            };

    document.getElementById('stats-novo').textContent = stats.novo;
    document.getElementById('stats-preparando').textContent = stats.preparando;
    document.getElementById('stats-entregue').textContent = stats.entregue;
        }

    // Carregar pedidos iniciais via REST
    async function carregarPedidos() {
            try {
                const res = await fetch(API_URL);
    pedidos = await res.json();
    lista.innerHTML = "";
                pedidos.forEach(p => addCard(p));
    atualizarStats();
            } catch (err) {
        console.error("Erro ao carregar pedidos:", err);
            }
        }

    carregarPedidos();

    // WebSocket
    function conectarWebSocket() {
        ws = new WebSocket(WS_URL);

            ws.onopen = () => console.log("✅ WebSocket conectado");
            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);

    if (data.tipo === "novo_pedido") {
        pedidos.unshift(data.pedido);
    addCard(data.pedido);
    atualizarStats();
                }

    if (data.tipo === "pedido_atualizado") {
        pedidos = pedidos.map(p => p.id === data.pedido.id ? data.pedido : p);
    atualizarCard(data.pedido);
    atualizarStats();
                }

    if (data.tipo === "pedido_deletado") {
        pedidos = pedidos.filter(p => p.id !== data.id);
    deletarCard(data.id);
    atualizarStats();
                }
            };

            ws.onclose = () => {
        console.log("❌ WebSocket desconectado. Tentando reconectar...");
    setTimeout(conectarWebSocket, 2000);
            };

            ws.onerror = () => ws.close();
        }
    conectarWebSocket();

    function addCard(p) {
            const col = document.createElement("div");
    col.className = "col-12 col-md-6 col-lg-4";

    // Primeira letra do nome para o avatar
    const inicial = p.cliente ? p.cliente.charAt(0).toUpperCase() : '?';

    col.innerHTML = `
    <div class="card-pedido" data-id="${p.id}">
        <div class="card-status-bar status-${p.status}"></div>
        <div class="card-body">
            <div class="card-header-pedido">
                <span class="pedido-id">
                    <i class="bi bi-hash"></i>${p.id}
                </span>
                <div class="dropdown">
                    <button class="btn btn-light btn-sm rounded-circle" style="width: 35px; height: 35px;" data-bs-toggle="dropdown">
                        <i class="bi bi-three-dots-vertical"></i>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end">
                        <li><a class="dropdown-item" href="#" onclick='editar(${JSON.stringify(p)})'>
                            <i class="bi bi-pencil me-2"></i>Editar
                        </a></li>
                        <li><a class="dropdown-item text-danger" href="#" onclick="deletar(${p.id})">
                            <i class="bi bi-trash me-2"></i>Excluir
                        </a></li>
                    </ul>
                </div>
            </div>

            <div class="cliente-info">
                <div class="cliente-avatar">${inicial}</div>
                <div>
                    <div class="cliente-nome">${p.cliente}</div>
                    <small class="text-muted">Cliente</small>
                </div>
            </div>

            <div class="detalhes-pedido">
                <div class="detalhe-item">
                    <i class="bi bi-basket"></i>
                    <strong>Produto:</strong>
                    <span>${p.produto}</span>
                </div>
                <div class="detalhe-item">
                    <i class="bi bi-123"></i>
                    <strong>Quantidade:</strong>
                    <span>${p.quantidade}</span>
                </div>
            </div>

            <span class="badge-status bg-${p.status}">
                <i class="bi ${p.status === 'novo' ? 'bi-star' : p.status === 'preparando' ? 'bi-fire' : 'bi-check-circle'}"></i>
                ${p.status === 'novo' ? 'Novo' : p.status === 'preparando' ? 'Preparando' : 'Entregue'}
            </span>
        </div>
    </div>
    `;

    lista.prepend(col);

    const card = col.querySelector(".card-pedido");
    card.classList.add("card-destaque");
            card.addEventListener("animationend", () => card.classList.remove("card-destaque"));
        }

    function atualizarCard(p) {
            const card = lista.querySelector(`.card-pedido[data-id='${p.id}']`);
    if (!card) {
        addCard(p);
    return;
            }

    // Atualizar barra de status
    const statusBar = card.querySelector('.card-status-bar');
    statusBar.className = `card-status-bar status-${p.status}`;

    // Atualizar avatar
    const avatar = card.querySelector('.cliente-avatar');
    avatar.textContent = p.cliente ? p.cliente.charAt(0).toUpperCase() : '?';

    // Atualizar nome
    const nomeEl = card.querySelector('.cliente-nome');
    nomeEl.textContent = p.cliente;

    // Atualizar produto
    const produtoEl = card.querySelector('.detalhe-item:nth-child(1) span');
    produtoEl.textContent = p.produto;

    // Atualizar quantidade
    const qtdEl = card.querySelector('.detalhe-item:nth-child(2) span');
    qtdEl.textContent = p.quantidade;

    // Atualizar badge de status
    const badge = card.querySelector('.badge-status');
    badge.className = `badge-status bg-${p.status}`;

    let icone, texto;
    if (p.status === 'novo') {
        icone = 'bi-star';
    texto = '🆕 Novo';
            } else if (p.status === 'preparando') {
        icone = 'bi-fire';
    texto = '👨‍🍳 Preparando';
            } else {
        icone = 'bi-check-circle';
    texto = '✅ Entregue';
            }

    badge.innerHTML = `<i class="bi ${icone}"></i> ${texto}`;

    card.classList.add("card-destaque");
            card.addEventListener("animationend", () => card.classList.remove("card-destaque"));
        }

    function deletarCard(id) {
            const card = lista.querySelector(`.card-pedido[data-id='${id}']`);
    if (card) {
        card.style.transform = 'scale(0.8)';
    card.style.opacity = '0';
    card.style.transition = 'all 0.3s';
                setTimeout(() => {
        card.parentElement.remove();
                }, 300);
            }
        }

    // CRUD
    function novoPedido() {
        limparCampos();
    document.getElementById('modalTitle').textContent = 'Novo Pedido';
    modal.show();
        }

    function editar(p) {
        document.getElementById('modalTitle').textContent = 'Editar Pedido';
    document.getElementById("pedidoId").value = p.id;
    document.getElementById("cliente").value = p.cliente;
    document.getElementById("produto").value = p.produto;
    document.getElementById("quantidade").value = p.quantidade;
    document.getElementById("status").value = p.status;
    modal.show();
        }

        btnSalvar.addEventListener("click", async () => {
        btnSalvar.disabled = true;
    btnSalvar.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Salvando...';

    const id = document.getElementById("pedidoId").value;
    const cliente = document.getElementById("cliente").value;
    const produto = document.getElementById("produto").value;
    const quantidade = document.getElementById("quantidade").value;
    const status = document.getElementById("status").value;

    if (!cliente || !produto || !quantidade) {
        alert("Por favor, preencha todos os campos!");
    btnSalvar.disabled = false;
    btnSalvar.innerHTML = '<i class="bi bi-check-lg me-2"></i>Salvar';
    return;
            }

    try {
                if (id) {
        await fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cliente, produto, quantidade, status })
        });
                } else {
        await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cliente, produto, quantidade })
        });
                }
    modal.hide();
    limparCampos();
            } catch {
        alert("Erro ao salvar pedido!");
            } finally {
        btnSalvar.disabled = false;
    btnSalvar.innerHTML = '<i class="bi bi-check-lg me-2"></i>Salvar';
            }
        });

    async function deletar(id) {
            if (!confirm("Tem certeza que deseja excluir este pedido?")) return;
    try {
        await fetch(`${API_URL}/${id}`, { method: "DELETE" });
            } catch {
        alert("Erro ao deletar pedido!");
            }
        }

    function limparCampos() {
        document.getElementById("pedidoId").value = "";
    document.getElementById("cliente").value = "";
    document.getElementById("produto").value = "";
    document.getElementById("quantidade").value = "1";
    document.getElementById("status").value = "novo";
        }

        document.addEventListener("visibilitychange", () => {
            if (!document.hidden) {
        carregarPedidos();
            }
        });
