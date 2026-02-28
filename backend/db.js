const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    port: "3307",
    user: "acerra",
    password: "@4b3c2d1",
    database: "bd_acerra"
});

db.connect((err) => {
    if (err) throw err;
    console.log("✅ Conectado ao banco de dados MySQL");
});

module.exports = db;

module.exports = db;
