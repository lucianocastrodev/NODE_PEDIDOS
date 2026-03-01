const mysql = require("mysql2");

const pool = mysql.createPool({
    host: "187.77.60.115",
    port: 3307,
    user: "acerra",
    password: "@4b3c2d1",
    database: "bd_acerra",

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,

    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

// Teste opcional de conexão
pool.getConnection((err, connection) => {
    if (err) {
        console.error("❌ Erro ao conectar no MySQL:", err);
        return;
    }
    console.log("✅ Pool MySQL conectado com sucesso");
    connection.release();
});

module.exports = pool.promise();