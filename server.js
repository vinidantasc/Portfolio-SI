const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const open = require('open');
const app = express();
const PORT = 3000;
const isPkg = typeof process.pkg !== 'undefined';

const basePath = __dirname;
const dataDir = path.join(basePath, "data");
const dataFile = path.join(dataDir, "portfolio.json");

app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, "public")));

app.post("/save", (req, res) => {
  if (isPkg) {
    return res.status(403).json({ 
      success: false, 
      message: "Não é possível salvar dados no modo de aplicação empacotada (somente-leitura)." 
    });
  }

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
  if (isPkg) {
    return res.status(403).json({ 
      success: false, 
      message: "Não é possível atualizar dados no modo de aplicação empacotada (somente-leitura)." 
    });
  }
  
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
    console.log("Arquivo de dados não encontrado em:", dataFile);
    res.json([]);
  }
});

app.listen(PORT, () => {
  if (isPkg) {
    console.log("==================================================================================================");
    console.log("ATENÇÃO: A aplicação está rodando em MODO SOMENTE-LEITURA.");
    console.log("");
    console.log("Este projeto é o trabalho final da disciplina de Gestão de Sistemas de Informação");
    console.log("do Mestrado Profissional em Ciência da Informação (UFRN).");
    console.log("");
    console.log("Ele demonstra dois níveis de Sistemas de Informação:");
    console.log(" 1. O Nível Tático (SIG), que é o 'Dashboard'.");
    console.log(" 2. O Nível Operacional (SPT), que é o formulário 'Adicionar'.");
    console.log("");
    console.log("Neste modo, apenas o SIG (Dashboard) está funcional para visualização.");
    console.log("O SPT está desabilitado, pois esta versão");
    console.log("não permite a escrita de novos dados no 'banco de dados'.");
    console.log("");
    console.log("Para utilizar a versão completa siga as instruções 'Como Rodar o Projeto Localmente' no repositório:");
    console.log("https://github.com/vinidantasc/Portfolio-SI");
    console.log("==================================================================================================");
  }

  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log('Abrindo a aplicacao no seu navegador...');
  open(`http://localhost:${PORT}`);
});