// CÓDIGO CONSOLIDADO PARA script.js

// --------------------------------------------------------------------------------
// 1. Variáveis de Estado
// --------------------------------------------------------------------------------
let portfolioData = [];
let filteredData = []; // Para armazenar os dados filtrados/exibidos

// Novo: Variáveis de estado para controle de edição
let isEditing = false;
let editingIndex = null; 

// Mapeamento de Tipos
const typeMap = {
    'atividade_avaliativa': 'Atividade Avaliativa',
    'forum': 'Fórum',
    'reflexao_pessoal': 'Reflexão Pessoal'
};

// --------------------------------------------------------------------------------
// 2. Funções de Backend (Fetch)
// --------------------------------------------------------------------------------

/**
 * Carrega os dados do backend, atribui um ID (índice original) e atualiza o estado.
 */
async function loadDataAndRender() {
    try {
        const response = await fetch('/entries');
        let data = await response.json();
        
        // Atribui um 'id' (índice no array, necessário para o update no backend)
        // e armazena os dados. Inverte a ordem para os mais recentes aparecerem primeiro.
        portfolioData = data.map((item, index) => ({ ...item, id: index }));
        
        updateDashboard();
        applyFiltersAndRender();
    } catch (error) {
        console.error("Erro ao buscar dados do portfólio:", error);
        // Em um ambiente de produção, aqui seria um tratamento de erro mais robusto.
    }
}

/**
 * Salva (POST) ou Atualiza (PUT) uma entrada no servidor.
 * @param {Object} entry - A entrada de dados a ser salva/atualizada.
 * @param {number|null} id - O índice do registro a ser atualizado (null para novo).
 */
async function saveEntry(entry, id = null) {
    const method = id !== null ? 'PUT' : 'POST';
    const endpoint = id !== null ? '/update' : '/save';
    // Se for PUT, envia o índice e a nova entrada. Se for POST, envia a nova entrada.
    const body = id !== null ? JSON.stringify({ index: id, newEntry: entry }) : JSON.stringify(entry);
    
    try {
        const response = await fetch(endpoint, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: body,
        });

        const result = await response.json();

        if (result.success) {
            alert(result.message);
            // Recarrega os dados após salvar/atualizar
            await loadDataAndRender(); 
            cancelEdit(); // Limpa o estado de edição/navega
            return true;
        } else {
            alert('Erro ao salvar o registro: ' + result.message);
            return false;
        }
    } catch (error) {
        console.error('Erro de rede ao salvar/atualizar:', error);
        alert('Erro de comunicação com o servidor. Verifique se o servidor está rodando.');
        return false;
    }
}

// --------------------------------------------------------------------------------
// 3. Funções Principais de Navegação e Dashboard
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
        cancelEdit(false); // Garante que o estado de edição está limpo ao sair
    }
    // Se for para a seção Dashboard, atualiza os dados
    if (sectionId === 'dashboard') {
        updateDashboard();
    }
    // Se for para Adicionar e não estiver editando, limpa o formulário
    if (sectionId === 'reflections' && !isEditing) {
        document.getElementById('entry-form').reset();
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
    
    const totalCompletionBasis = 5; // Assumindo um total de 5 marcos/tarefas principais para 100%
    // A ordem precisa ser invertida para mostrar os mais recentes primeiro na lista
    const recentData = [...portfolioData].reverse();
    const completionPercent = Math.min(100, Math.round((totalEvaluativeActivities / totalCompletionBasis) * 100));

    document.getElementById('total-activities').textContent = totalActivities.toString();
    document.getElementById('total-forums').textContent = totalForums.toString();
    document.getElementById('total-reflections').textContent = totalReflections.toString();
    document.getElementById('completion-percent').textContent = `${completionPercent}%`;
}


// --------------------------------------------------------------------------------
// 4. Funções do Modal (Pop-up) - Visualização
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
    document.getElementById('modal-text').textContent = content; 
    modal.style.display = 'block';

    document.addEventListener('keydown', handleEscClose);
}

/**
 * Fecha o modal.
 */
function closeModal() {
    const modal = document.getElementById('full-content-modal');
    modal.style.display = 'none';

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
// 5. Funções de Renderização e Filtros
// --------------------------------------------------------------------------------

/**
 * Renderiza a lista de itens do portfólio.
 * @param {Array<Object>} data - Os dados a serem renderizados.
 */
function renderPortfolio(data) {
    const portfolioList = document.getElementById('portfolio-list');
    portfolioList.innerHTML = ''; 

    // Reverte a lista de dados filtrados para exibir os mais recentes primeiro
    const displayData = [...data].reverse();

    displayData.forEach(item => {
        const listItem = document.createElement('li');
        
        // >>> INÍCIO DA CORREÇÃO DE BUG DE DATA <<<
        // O formato 'YYYY-MM-DD' é interpretado como UTC por padrão, o que causa
        // o desvio de -1 dia em fusos horários negativos (ex: UTC-3).
        // Solução: Analisar a string e construir o objeto Date usando o fuso horário local.
        const parts = item.week.split('-');
        const year = parseInt(parts[0], 10);
        // O mês em JavaScript é 0-indexado (0 para Jan, 8 para Set, etc.)
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        
        // Cria um objeto Date no fuso horário local (evita o recuo de dia)
        const dateObj = new Date(year, month, day); 
        
        // Formatação final da data
        const formattedDate = dateObj.toLocaleDateString('pt-BR', { year: 'numeric', month: '2-digit', day: '2-digit' });
        // >>> FIM DA CORREÇÃO DE BUG DE DATA <<<

        // Atribui o evento de clique para abrir o modal (visualização)
        listItem.addEventListener('click', (e) => {
            // Impede a abertura do modal de visualização se o botão de edição for clicado
            if (e.target.closest('.edit-button')) {
                return; 
            }
            // Usa a data formatada já corrigida
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

        const typeDisplay = typeMap[item.type] || item.type;
        
        // Pega o primeiro parágrafo/linha para o snippet
        const snippet = item.content.split('\n')[0];
        
        // Estrutura do card com o botão de edição
        listItem.innerHTML = `
            <div class="card-header">
                <div style="display: flex; align-items: center;">
                    <i class="${iconClass} icon"></i>
                    <span class="type-name">${typeDisplay}</span>
                </div>
                <div class="card-actions">
                    <button class="edit-button" title="Editar" onclick="startEdit(${item.id}); event.stopPropagation();">
                        <i class="fas fa-edit"></i>
                    </button>
                    <span class="date">${formattedDate}</span>
                </div>
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
// 6. Funções de Edição
// --------------------------------------------------------------------------------

/**
 * Inicia o processo de edição: carrega os dados no formulário e altera o estado do UI.
 * @param {number} id - O ID (índice original no array de dados) do item a ser editado.
 */
function startEdit(id) {
    const entryToEdit = portfolioData.find(item => item.id === id);

    if (!entryToEdit) {
        console.error('Registro não encontrado para edição:', id);
        return;
    }

    // 1. Define o estado de edição
    isEditing = true;
    editingIndex = id; 

    // 2. Preenche o formulário
    document.getElementById('week').value = entryToEdit.week;
    document.getElementById('type').value = entryToEdit.type;
    document.getElementById('content').value = entryToEdit.content;

    // 3. Atualiza o UI da seção "Adicionar" para refletir o estado de edição
    document.querySelector('#reflections h1').textContent = 'Editar Atividade / Reflexão';
    document.querySelector('#entry-form button[type="submit"]').textContent = 'Salvar';
    
    // Adiciona o botão Cancelar (se ainda não existir)
    let submitButton = document.querySelector('#entry-form button[type="submit"]');
    let cancelButton = document.getElementById('cancel-edit-button');
    if (!cancelButton) {
        cancelButton = document.createElement('button');
        cancelButton.type = 'button';
        cancelButton.id = 'cancel-edit-button';
        cancelButton.textContent = 'Cancelar';
        cancelButton.onclick = () => cancelEdit(true);
        // Insere depois do botão de submit
        submitButton.parentNode.insertBefore(cancelButton, submitButton.nextSibling); 
    }

    // 4. Navega para a seção de edição/adicionar
    showSection('reflections'); 
}

/**
 * Limpa o estado de edição e reseta o formulário/UI.
 * @param {boolean} shouldNavigate - Se deve navegar para a seção de Portfólio.
 */
function cancelEdit(shouldNavigate = true) {
    isEditing = false;
    editingIndex = null;
    
    // Reseta o formulário e o estado do UI
    document.getElementById('entry-form').reset();
    document.querySelector('#reflections h1').textContent = 'Adicionar Reflexão / Atividade';
    document.querySelector('#entry-form button[type="submit"]').textContent = 'Adicionar';

    // Remove o botão de cancelar
    const cancelButton = document.getElementById('cancel-edit-button');
    if (cancelButton) {
        cancelButton.remove();
    }
    
    // Volta para o Portfólio (opcional)
    if (shouldNavigate) {
        showSection('portfolio');
    }
}


// --------------------------------------------------------------------------------
// 7. Manipulação de Formulário (Adicionar/Editar)
// --------------------------------------------------------------------------------

document.getElementById('entry-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const week = document.getElementById('week').value;
    const type = document.getElementById('type').value;
    const content = document.getElementById('content').value;

    const newEntry = {
        week: week,
        type: type,
        content: content
    };

    if (isEditing) {
        // Lógica de Edição (PUT)
        await saveEntry(newEntry, editingIndex);
    } else {
        // Lógica de Adição (POST)
        await saveEntry(newEntry, null);
    }
});


// --------------------------------------------------------------------------------
// 8. Inicialização (Carregamento de Dados e Eventos)
// --------------------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Carregamento de dados inicial
    await loadDataAndRender(); 

    // 2. Configuração dos filtros
    document.getElementById('filter-type').addEventListener('change', applyFiltersAndRender);
    document.getElementById('filter-date').addEventListener('change', applyFiltersAndRender);

    // 3. Inicia mostrando o Dashboard
    showSection('dashboard');
});