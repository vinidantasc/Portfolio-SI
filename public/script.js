let portfolioData = [];
let filteredData = [];
let isEditing = false;
let editingIndex = null;
const typeMap = {
    'atividade_avaliativa': 'Atividade Avaliativa',
    'forum': 'Fórum',
    'reflexao_pessoal': 'Reflexão Pessoal'
};

async function loadDataAndRender() {
    try {
        const response = await fetch('/entries');
        let data = await response.json();
        portfolioData = data.map((item, index) => ({ ...item, id: index }));
        
        updateDashboard();
        applyFiltersAndRender();
    } catch (error) {
        console.error("Erro ao buscar dados do portfólio:", error);
    }
}

async function saveEntry(entry, id = null) {
    const method = id !== null ? 'PUT' : 'POST';
    const endpoint = id !== null ? '/update' : '/save';
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
            await loadDataAndRender(); 
            cancelEdit();
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

function showSection(sectionId) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
    
    if (sectionId === 'portfolio') {
        applyFiltersAndRender();
        cancelEdit(false);
    }
    if (sectionId === 'dashboard') {
        updateDashboard();
    }
    if (sectionId === 'reflections' && !isEditing) {
        document.getElementById('entry-form').reset();
    }
}

function updateDashboard() {
    const totalActivities = portfolioData.length;
    const totalForums = portfolioData.filter(item => item.type === 'forum').length;
    const totalReflections = portfolioData.filter(item => item.type === 'reflexao_pessoal').length;
    const totalEvaluativeActivities = portfolioData.filter(item => item.type === 'atividade_avaliativa').length;
    
    const totalCompletionBasis = 5;
    const recentData = [...portfolioData].reverse();
    const completionPercent = Math.min(100, Math.round((totalEvaluativeActivities / totalCompletionBasis) * 100));

    document.getElementById('total-activities').textContent = totalActivities.toString();
    document.getElementById('total-forums').textContent = totalForums.toString();
    document.getElementById('total-reflections').textContent = totalReflections.toString();
    document.getElementById('completion-percent').textContent = `${completionPercent}%`;
}

function openModal(date, type, content) {
    const modal = document.getElementById('full-content-modal');
    document.getElementById('modal-title').textContent = typeMap[type] || 'Detalhes da Atividade';
    document.querySelector('.modal-date').textContent = `Semana: ${date}`;
    document.getElementById('modal-text').textContent = content; 
    modal.style.display = 'block';

    document.addEventListener('keydown', handleEscClose);
}

function closeModal() {
    const modal = document.getElementById('full-content-modal');
    modal.style.display = 'none';

    document.removeEventListener('keydown', handleEscClose);
}

function handleEscClose(event) {
    if (event.key === 'Escape') {
        closeModal();
    }
}

window.onclick = function(event) {
    const modal = document.getElementById('full-content-modal');
    if (event.target === modal) {
        closeModal();
    }
}

function renderPortfolio(data) {
    const portfolioList = document.getElementById('portfolio-list');
    portfolioList.innerHTML = ''; 
    const displayData = [...data].reverse();

    displayData.forEach(item => {
        const listItem = document.createElement('li');
        
        const parts = item.week.split('-');
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        
        const dateObj = new Date(year, month, day); 
        const formattedDate = dateObj.toLocaleDateString('pt-BR', { year: 'numeric', month: '2-digit', day: '2-digit' });

        listItem.addEventListener('click', (e) => {
            if (e.target.closest('.edit-button')) {
                return; 
            }
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
        const snippet = item.content.split('\n')[0];
        
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

function applyFiltersAndRender() {
    const filterType = document.getElementById('filter-type').value;
    const filterDate = document.getElementById('filter-date').value;

    filteredData = portfolioData.filter(item => {
        if (!item.content) {
            return false;
        }
        
        const matchesType = filterType === 'todos' || !filterType || item.type === filterType;
        const matchesDate = !filterDate || item.week === filterDate; 
        return matchesType && matchesDate;
    });

    renderPortfolio(filteredData);
}

function clearFilters() {
    document.getElementById('filter-type').value = 'todos';
    document.getElementById('filter-date').value = '';
    applyFiltersAndRender();
}

function startEdit(id) {
    const entryToEdit = portfolioData.find(item => item.id === id);

    if (!entryToEdit) {
        console.error('Registro não encontrado para edição:', id);
        return;
    }

    isEditing = true;
    editingIndex = id; 

    document.getElementById('week').value = entryToEdit.week;
    document.getElementById('type').value = entryToEdit.type;
    document.getElementById('content').value = entryToEdit.content;

    document.querySelector('#reflections h1').textContent = 'Editar Atividade / Reflexão';
    document.querySelector('#entry-form button[type="submit"]').textContent = 'Salvar';
    
    let submitButton = document.querySelector('#entry-form button[type="submit"]');
    let cancelButton = document.getElementById('cancel-edit-button');
    if (!cancelButton) {
        cancelButton = document.createElement('button');
        cancelButton.type = 'button';
        cancelButton.id = 'cancel-edit-button';
        cancelButton.textContent = 'Cancelar';
        cancelButton.onclick = () => cancelEdit(true);
        submitButton.parentNode.insertBefore(cancelButton, submitButton.nextSibling); 
    }

    showSection('reflections'); 
}

function cancelEdit(shouldNavigate = true) {
    isEditing = false;
    editingIndex = null;
    
    document.getElementById('entry-form').reset();
    document.querySelector('#reflections h1').textContent = 'Adicionar Reflexão / Atividade';
    document.querySelector('#entry-form button[type="submit"]').textContent = 'Adicionar';

    const cancelButton = document.getElementById('cancel-edit-button');
    if (cancelButton) {
        cancelButton.remove();
    }
    
    if (shouldNavigate) {
        showSection('portfolio');
    }
}

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
        await saveEntry(newEntry, editingIndex);
    } else {
        await saveEntry(newEntry, null);
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    await loadDataAndRender(); 

    document.getElementById('filter-type').addEventListener('change', applyFiltersAndRender);
    document.getElementById('filter-date').addEventListener('change', applyFiltersAndRender);
    document.getElementById('clear-filters-button').addEventListener('click', clearFilters);

    showSection('dashboard');
});