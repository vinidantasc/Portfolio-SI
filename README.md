# Portfólio de Gestão de Sistemas de Informação

Este projeto é o trabalho final da disciplina de **Gestão de Sistemas de Informação** do **Mestrado Profissional em Ciência da Informação - UFRN**. O objetivo é atuar como um portfólio funcional para registrar as tarefas e entregas do semestre, além de servir como uma implementação prática dos conceitos estudados durante o semestre.

O sistema implementa dois níveis fundamentais da pirâmide de SI:

*   **Nível Operacional:** Através de um Sistema de Processamento de Transações (SPT).
*   **Nível Tático:** Através de um Sistema de Informações Gerenciais (SIG).

Abaixo está o detalhamento de como cada um desses conceitos foi aplicado no projeto.

---

## 1. Nível Operacional: O Sistema de Processamento de Transações (SPT)

O SPT forma a base da pirâmide. Sua função é executar e registrar as transações rotineiras e diárias necessárias para conduzir o negócio. Ele **"monitora, coleta, armazena, processa e distribui os dados"** e serve como a principal fonte de dados para os sistemas de nível superior.

Nesse projeto, o SPT é implementado da seguinte forma:

### Coleta de Dados (Entrada)
O formulário na página principal (`index.html`) é a interface de **"Entrada e alimentação de dados"**. Cada vez que uma nova tarefa é criada, editada ou excluída, uma **"transação"** está sendo registrada.

### Processamento e Armazenamento
O backend (Node.js/Express em `server.js`) recebe os dados da transação. Ele processa a solicitação (seja `POST`, `PUT` ou `DELETE`) e armazena os **"dados brutos"** no arquivo `data/portfolio.json`, que simula um banco de dados operacional.

### Saída Operacional
A lista de tarefas na página **Portfólio** é a saída direta do SPT. Ela funciona como um **"Relatório operacional"** básico, listando todas as transações que foram registradas no sistema.

---

## 2. Nível Tático: O Sistema de Informações Gerenciais (SIG)

O SIG atende ao nível tático-gerencial. Sua função é **"dar suporte ao nível tático-gerencial da empresa gerando relatórios"**. Para isso, o SIG **"filtra e analisa dados em banco de dados dos SPT"** e os apresenta de forma consolidada e estruturada, transformando dados brutos em informação relevante para os gerentes.

Nesse projeto, o SIG é implementado na página **"Dashboard"**:

### Transformação (Dados -> Informação)
O motor do SIG é a função `loadDashboardData()` no arquivo `script.js`. Ela consome os dados brutos do SPT (via `fetch('/api/tarefas')`) e aplica **"rotinas simples como resumos e comparações"** para gerar informação valiosa, como "Total de Tarefas", "Tarefas Concluídas" e "Taxa de Conclusão".

### Relatórios Gerenciais (Saída)
O dashboard apresenta essa informação em **"formatos fixos e padronizados"**, utilizando a **"orientação tanto textual quanto gráfica"** que é característica de um SIG.

*   **Indicadores-Chave:** Os cartões (Total, Concluídas, Taxa de Conclusão) fornecem um resumo gerencial rápido.

---

# Como Rodar o Projeto Localmente

Para executar esta aplicação você precisará ter o **Node.js** (que inclui o `npm`) instalado.

Siga os passos abaixo:

## 1. Clonar o Repositório

Abra seu terminal ou prompt de comando e use o seguinte comando para clonar o projeto:

```bash
git clone https://github.com/vinidantasc/Portfolio-SI.git
```

## 2. Navegar até o Diretório

Entre na pasta do projeto que você acabou de clonar:

```bash
cd nome-do-repositorio
```

## 3. Instalar as Dependências

O projeto utiliza o Express.js e outras bibliotecas. Use o `npm` para instalar todas as dependências listadas no arquivo `package.json`:

```bash
npm install
```

## 4. Iniciar o Servidor

Com as dependências instaladas, inicie o servidor local:

```bash
node server.js
```

## 5. Acessar a Aplicação

Após iniciar o servidor, você verá uma mensagem no terminal indicando que ele está rodando. Por padrão, a aplicação estará disponível no seu navegador no seguinte endereço:

[http://localhost:3000](http://localhost:3000)

Agora você pode navegar pela aplicação, adicionar, editar e excluir tarefas na página principal e visualizar os gráficos de desempenho no Dashboard.

