# Portfólio de Gestão de Sistemas de Informação

Este projeto é o trabalho final da disciplina de **Gestão de Sistemas de Informação**. O objetivo é duplo: atuar como um portfólio funcional para registrar as tarefas e entregas do semestre e, simultaneamente, servir como uma implementação prática dos conceitos teóricos de Sistemas de Informação estudados.

A aplicação foi projetada para espelhar a estrutura hierárquica dos sistemas de informação (a **"pirâmide de SI"**). Nela, o aluno atua como o "gerente" e as "tarefas do semestre" são tratadas como as "operações" da organização.

O sistema implementa dois níveis fundamentais dessa pirâmide:

*   **Nível Operacional:** Através de um Sistema de Processamento de Transações (SPT).
*   **Nível Tático:** Através de um Sistema de Informações Gerenciais (SIG).

Abaixo, detalhamos como cada um desses conceitos foi aplicado no projeto.

---

## 1. Nível Operacional: O Sistema de Processamento de Transações (SPT)

O SPT forma a base da pirâmide. Sua função é executar e registrar as transações rotineiras e diárias necessárias para conduzir o negócio. Ele **"monitora, coleta, armazena, processa e distribui os dados"** e serve como a principal fonte de dados para os sistemas de nível superior.

Em nosso projeto, o SPT é implementado da seguinte forma:

### Coleta de Dados (Entrada)
O formulário na página principal (`index.html`) é a interface de **"Entrada e alimentação de dados"**. Cada vez que uma nova tarefa é criada, editada ou excluída, uma **"transação"** está sendo registrada.

### Processamento e Armazenamento
O backend (Node.js/Express em `server.js`) recebe os dados da transação. Ele processa a solicitação (seja `POST`, `PUT` ou `DELETE`) e armazena os **"dados brutos"** no arquivo `data/portfolio.json`, que funciona como nosso banco de dados operacional.

### Saída Operacional
A lista de tarefas na página principal é a saída direta do SPT. Ela funciona como um **"Relatório operacional"** básico, listando todas as transações (tarefas) que foram registradas no sistema.

---

## 2. Nível Tático: O Sistema de Informações Gerenciais (SIG)

O SIG atende ao nível tático-gerencial. Sua função é **"dar suporte ao nível tático-gerencial da empresa gerando relatórios"**. Para isso, o SIG **"filtra e analisa dados em banco de dados dos SPT"** e os apresenta de forma consolidada e estruturada, transformando dados brutos em informação relevante para os gerentes.

Em nosso projeto, o SIG é implementado na página **"Dashboard"**:

### Transformação (Dados -> Informação)
O motor do SIG é a função `loadDashboardData()` no arquivo `script.js`. Ela consome os dados brutos do SPT (via `fetch('/api/tarefas')`) e aplica **"rotinas simples como resumos e comparações"** para gerar informação valiosa, como "Total de Tarefas", "Tarefas Concluídas" e "Taxa de Conclusão".

### Relatórios Gerenciais (Saída)
O dashboard apresenta essa informação em **"formatos fixos e padronizados"**, utilizando a **"orientação tanto textual quanto gráfica"** que é característica de um SIG.

*   **Indicadores-Chave:** Os cartões (Total, Concluídas, Taxa de Conclusão) fornecem um resumo gerencial rápido.
*   **Gráficos de Acompanhamento:** Os gráficos ("Tarefas por Mês" e "Distribuição de Status") são relatórios visuais que permitem ao "gerente" (o aluno) **"controlar, organizar e planejar melhor"** seu desempenho e progresso no semestre.

---

## Conclusão Conceitual

Este projeto demonstra com sucesso a relação de dependência entre os sistemas: o **SPT** coleta os dados operacionais do dia-a-dia (as tarefas) e o **SIG** consome, processa e resume esses dados para transformá-los em informação tática (os gráficos e estatísticas do dashboard), permitindo o acompanhamento e a tomada de decisão em nível gerencial.
