const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;

// Pasta de dados e nome do arquivo único
const dataDir = path.join(__dirname, "data");
const dataFile = path.join(dataDir, "portfolio.json");

// Garante que a pasta de dados existe
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// Middleware
app.use(bodyParser.json());
app.use(express.static("public"));

// Rota para salvar um novo registro
app.post("/save", (req, res) => {
  const newEntry = req.body;
  let entries = [];

  // Tenta ler o arquivo existente
  if (fs.existsSync(dataFile)) {
    const data = fs.readFileSync(dataFile, "utf8");
    entries = JSON.parse(data);
  }

  // Adiciona a nova entrada ao array
  entries.push(newEntry);

  // Salva o array completo de volta no arquivo
  fs.writeFileSync(dataFile, JSON.stringify(entries, null, 2), "utf8");

  console.log("Novo registro salvo em:", dataFile);
  res.json({ success: true, message: "Registro salvo com sucesso!" });
});

// Rota para listar todos os registros
app.get("/entries", (req, res) => {
  if (fs.existsSync(dataFile)) {
    const data = fs.readFileSync(dataFile, "utf8");
    res.json(JSON.parse(data));
  } else {
    // Retorna um array vazio se o arquivo não existir
    res.json([]);
  }
});

// Inicia servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});