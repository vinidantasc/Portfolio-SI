// CÓDIGO CONSOLIDADO PARA script.js

// --------------------------------------------------------------------------------
// 1. Variáveis de Estado
// --------------------------------------------------------------------------------
let portfolioData = [];
let filteredData = []; // Para armazenar os dados filtrados/exibidos

// Mapeamento de Tipos
const typeMap = {
    'atividade_avaliativa': 'Atividade Avaliativa',
    'forum': 'Fórum',
    'reflexao_pessoal': 'Reflexão Pessoal'
};

// --------------------------------------------------------------------------------
// 2. Funções Principais de Navegação e Dados
// --------------------------------------------------------------------------------

/**
 * Controla a exibição das seções do menu.
 * @param {string} sectionId - O ID da seção a ser exibida.
 */
function showSection(sectionId) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
    
    // Se for para a seção Portfólio, renderiza a lista
    if (sectionId === 'portfolio') {
        applyFiltersAndRender();
    }
    // Se for para a seção Dashboard, atualiza os dados
    if (sectionId === 'dashboard') {
        updateDashboard();
    }
}


/**
 * Atualiza os cards do Dashboard com base nos dados.
 */
function updateDashboard() {
    const totalActivities = portfolioData.length;
    const totalForums = portfolioData.filter(item => item.type === 'forum').length;
    const totalReflections = portfolioData.filter(item => item.type === 'reflexao_pessoal').length;
    const totalEvaluativeActivities = portfolioData.filter(item => item.type === 'atividade_avaliativa').length;
    
    // Simplificando o "Concluído" para o total de entradas (Exemplo)
    const totalCompletionBasis = 5; // Assumindo um total de 5 marcos/tarefas principais para 100%
    const completionPercent = Math.min(100, Math.round((totalEvaluativeActivities / totalCompletionBasis) * 100));

    document.getElementById('total-activities').textContent = totalActivities.toString();
    document.getElementById('total-forums').textContent = totalForums.toString();
    document.getElementById('total-reflections').textContent = totalReflections.toString();
    document.getElementById('completion-percent').textContent = `${completionPercent}%`;
}


// --------------------------------------------------------------------------------
// 3. Funções do Modal (Pop-up) - NOVIDADE
// --------------------------------------------------------------------------------

/**
 * Abre o modal e preenche com o conteúdo completo do item.
 * @param {string} date - A data formatada.
 * @param {string} type - O tipo de atividade (chave).
 * @param {string} content - O conteúdo completo.
 */
function openModal(date, type, content) {
    const modal = document.getElementById('full-content-modal');
    document.getElementById('modal-title').textContent = typeMap[type] || 'Detalhes da Atividade';
    document.querySelector('.modal-date').textContent = `Semana: ${date}`;
    document.getElementById('modal-text').textContent = content; // Usamos textContent para evitar injeção de HTML
    modal.style.display = 'block';

    // Adiciona listener para fechar ao pressionar ESC
    document.addEventListener('keydown', handleEscClose);
}

/**
 * Fecha o modal.
 */
function closeModal() {
    const modal = document.getElementById('full-content-modal');
    modal.style.display = 'none';

    // Remove listener
    document.removeEventListener('keydown', handleEscClose);
}

/**
 * Função para fechar o modal com a tecla ESC.
 */
function handleEscClose(event) {
    if (event.key === 'Escape') {
        closeModal();
    }
}

// Fechar o modal ao clicar fora dele
window.onclick = function(event) {
    const modal = document.getElementById('full-content-modal');
    if (event.target === modal) {
        closeModal();
    }
}


// --------------------------------------------------------------------------------
// 4. Funções de Renderização e Filtros
// --------------------------------------------------------------------------------

/**
 * Renderiza a lista de itens do portfólio.
 * @param {Array<Object>} data - Os dados a serem renderizados.
 */
function renderPortfolio(data) {
    const portfolioList = document.getElementById('portfolio-list');
    portfolioList.innerHTML = ''; 

    data.forEach(item => {
        const listItem = document.createElement('li');
        
        // Atribui o evento de clique para abrir o modal
        listItem.addEventListener('click', () => {
            const formattedDate = new Date(item.week).toLocaleDateString('pt-BR', { year: 'numeric', month: '2-digit', day: '2-digit' });
            openModal(formattedDate, item.type, item.content);
        });

        let iconClass;
        switch (item.type) {
            case 'atividade_avaliativa':
                iconClass = 'fas fa-tasks';
                break;
            case 'forum':
                iconClass = 'fas fa-comments';
                break;
            case 'reflexao_pessoal':
                iconClass = 'fas fa-book-open';
                break;
            default:
                iconClass = 'fas fa-clipboard';
        }

        const dateObj = new Date(item.week);
        const formattedDate = dateObj.toLocaleDateString('pt-BR', { year: 'numeric', month: '2-digit', day: '2-digit' });
        const typeDisplay = typeMap[item.type] || item.type;
        
        // Pega o primeiro parágrafo/linha para o snippet
        const snippet = item.content.split('\n')[0];
        
        listItem.innerHTML = `
            <div class="card-header">
                <div style="display: flex; align-items: center;">
                    <i class="${iconClass} icon"></i>
                    <span class="type-name">${typeDisplay}</span>
                </div>
                <span class="date">${formattedDate}</span>
            </div>
            <div class="card-content">
                <p>${snippet}</p> 
            </div>
        `;

        portfolioList.appendChild(listItem);
    });
}

/**
 * Aplica os filtros e chama a função de renderização.
 */
function applyFiltersAndRender() {
    const filterType = document.getElementById('filter-type').value;
    const filterDate = document.getElementById('filter-date').value;

    filteredData = portfolioData.filter(item => {
        const matchesType = filterType === 'todos' || item.type === filterType;
        const matchesDate = !filterDate || item.week === filterDate; 
        return matchesType && matchesDate;
    });

    renderPortfolio(filteredData);
}

// --------------------------------------------------------------------------------
// 5. Manipulação de Formulário (Adicionar)
// --------------------------------------------------------------------------------

document.getElementById('entry-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const week = document.getElementById('week').value;
    const type = document.getElementById('type').value;
    const content = document.getElementById('content').value;

    const newEntry = {
        week: week,
        type: type,
        content: content
    };

    // Adiciona o novo item ao início do array (mais recente)
    portfolioData.unshift(newEntry);

    // Salvaria no servidor aqui (simulado)
    applyFiltersAndRender();
    updateDashboard(); // Atualiza o dashboard com o novo item
    
    // Navega para o Portfólio após adicionar
    showSection('portfolio');
    
    // Limpa o formulário
    e.target.reset(); 
    document.getElementById('week').focus();
});


// --------------------------------------------------------------------------------
// 6. Inicialização (Carregamento de Dados e Eventos)
// --------------------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    // Carregamento de dados inicial (usando o conteúdo de portfolio.json fornecido)
    const initialData = [
        {
            "week": "2025-09-16",
            "type": "atividade_avaliativa",
            "content": "Nessa semana, fomos submetidos a um questionário com 5 questões básicas para responder apenas com o nosso conhecimento prévio. As questões versavam sobre o que é dado, informação, conhecimento, gestão da informação e sistemas da informação. Minha experiência pessoal foi perceber que mesmo nunca ter estudado na literatura esses conceitos, já tinha uma noção superficial das ideias ali expostas. Porém posteriormente tive a oportunidade de realizar uma pesquisa científica sobre os temas e consolidar o conhecimento preenchendo as lacunas.\n\nOutra atividade interessando foi realizada em sala de aula, onde uma situação problema envolvendo resolver um problema de organização de estoque em uma loja de roupas brancas. Essa atividade mostrou que cada grupo adotou uma estratégia diferente para solucionar o mesmo problema e ao final ao compartilhar as idéias conseguimos visualizar o problema por outras perspectiva"
        },
        {
            "week": "2025-09-16",
            "type": "forum",
            "content": "A discussão destacou que, no processo decisório organizacional, raramente é possível contar com todas as informações necessárias. Muitas vezes há escassez de dados relevantes, excesso de informações que dificultam a análise ou ainda prazos curtos que obrigam os gestores a decidir rapidamente. Além disso, as informações estão em constante mudança, o que torna difícil manter uma base sempre atualizada e completa. A capacidade dos gestores em interpretar e selecionar o que é realmente importante também influencia diretamente na qualidade das escolhas.\n\nQuanto ao trabalho em equipe, foi ressaltado que ele contribui significativamente para a tomada de decisão. A diversidade de perspectivas, experiências e conhecimentos amplia a análise dos problemas, gera alternativas mais criativas e reduz a chance de erros. O trabalho colaborativo também fortalece a aprendizagem coletiva, melhora a comunicação, a confiança e o engajamento, criando um ambiente em que as decisões são mais bem fundamentadas.\n\nEm resumo, as organizações não conseguem eliminar completamente as incertezas, mas podem reduzi-las por meio de uma boa gestão da informação e, principalmente, pelo fortalecimento do trabalho em equipe, que potencializa a qualidade e a efetividade das decisões."
        },
        {
            "week": "2025-09-16",
            "type": "reflexao_pessoal",
            "content": "Essa foi a primeira semana de aula então houve dificuldade em acompanhar a nova rotina de estudos. Mesmo assim considero muito produtivo os novos conteúdos assimilados. Pude exercer a capacidade de construir um argumento baseado em estudos prévios, além de interagir com os demais colegas sobre os temas expostos"
        },
        {
            "week": "2025-09-30",
            "type": "forum",
            "content": "Nessa semana, a discussão do fórum consistiu na transição do pensamento reducionista para o sistêmico e complexo (expansionismo), impulsionada pela interdependência global pós-guerra e pela Era da Informação, o que tornou as teorias clássicas de administração insuficientes para lidar com organizações vistas agora como sistemas abertos e dinâmicos. Essa mudança paradigmática, que exige considerar a interação entre fatores internos e externos, a subjetividade e a transdisciplinaridade, reflete-se na prática pela evolução do Marketing (1.0 ao 3.0), que passou do foco no produto para o cliente e, finalmente, para os valores e responsabilidade social. Nesse cenário complexo, a informação e o conhecimento tornam-se recursos estratégicos vitais, com o sucesso da Tecnologia da Informação dependendo de sua aplicação estratégica para resolver problemas, reforçando a necessidade de uma gestão que equilibre o valor econômico com o impacto social em um sistema global interconectado."
        },
        {
            "week": "2025-09-30",
            "type": "atividade_avaliativa",
            "content": "O que são Sistemas de Informações? - são conjuntos estruturados de componentes—que incluem pessoas, processos e tecnologia—organizados para coletar, processar, armazenar e distribuir dados e informações em uma organização. Em sua essência, um SI atua como um sistema de trabalho que transforma dados brutos em conhecimento útil para apoiar o funcionamento de toda a empresa. Embora a visão tecnológica se concentre em hardware e software, a perspectiva mais abrangente, a sociotécnica, reconhece que o sistema é uma integração vital entre a tecnologia, os fatores humanos e os processos de negócio. Assim, os SI vão além da mera Tecnologia da Informação (TI), sendo fundamentais para a coordenação, o controle, a análise e, principalmente, a tomada de decisão em todos os níveis organizacionais, desde as operações rotineiras até as estratégias de longo prazo.\n\nQuais as contribuições desses sistemas de informações para as organizações? - Aumentam a eficiência operacional ao automatizar tarefas, reduzir erros e liberar colaboradores para focar em atividades de maior valor agregado. Por meio da integração e análise de dados, os SI melhoram a qualidade da tomada de decisões, otimizando processos e permitindo o uso de indicadores de desempenho para um aprimoramento contínuo. Estrategicamente, esses sistemas promovem a vantagem competitiva ao possibilitar que a organização desenvolva a capacidade de transformar rapidamente dados em conhecimento e se adapte com agilidade a ambientes de mercado dinâmicos. Em suma, a adoção estratégica de SI é um motor de transformação organizacional, resultando em melhor comunicação, maior transparência e contribuições significativas para o sucesso financeiro e não financeiro da empresa."
        }
    ];
    portfolioData = initialData;

    // 2. Inicialização do Dashboard
    updateDashboard();

    // 3. Configuração dos filtros
    document.getElementById('filter-type').addEventListener('change', applyFiltersAndRender);
    document.getElementById('filter-date').addEventListener('change', applyFiltersAndRender);

    // 4. Inicia mostrando o Dashboard (chamará updateDashboard, que já foi chamada acima)
    showSection('dashboard');
});