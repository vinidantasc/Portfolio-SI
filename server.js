const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const open = require('open');
const app = express();
const PORT = 3000;
const isPkg = typeof process.pkg !== 'undefined';
const basePath = isPkg ? path.dirname(process.execPath) : __dirname;
const dataDir = path.join(basePath, "data");
const dataFile = path.join(dataDir, "portfolio.json");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

app.use(bodyParser.json());
app.use(express.static("public"));
app.post("/save", (req, res) => {
  const newEntry = req.body;
  let entries = [];

  if (fs.existsSync(dataFile)) {
    const data = fs.readFileSync(dataFile, "utf8");
    entries = JSON.parse(data);
  }

  entries.push(newEntry);

  fs.writeFileSync(dataFile, JSON.stringify(entries, null, 2), "utf8");

  console.log("Novo registro salvo em:", dataFile);
  res.json({ success: true, message: "Registro salvo com sucesso!" });
});

app.put("/update", (req, res) => {
  const { index, newEntry } = req.body;
  let entries = [];

  if (fs.existsSync(dataFile)) {
    const data = fs.readFileSync(dataFile, "utf8");
    entries = JSON.parse(data);
  }

  if (index !== undefined && index >= 0 && index < entries.length) {
    entries[index] = newEntry;

    fs.writeFileSync(dataFile, JSON.stringify(entries, null, 2), "utf8");

    console.log("Registro atualizado no índice:", index, "em:", dataFile);
    res.json({ success: true, message: "Registro atualizado com sucesso!" });
  } else {
    res.status(400).json({ success: false, message: "Índice de registro inválido." });
  }
});

app.get("/entries", (req, res) => {
  if (fs.existsSync(dataFile)) {
    const data = fs.readFileSync(dataFile, "utf8");
    res.json(JSON.parse(data));
  } else {
    res.json([]);
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log('Abrindo a aplicacao no seu navegador...');
  open(`http://localhost:${PORT}`);
});