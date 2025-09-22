// Navegação entre seções
function showSection(sectionId) {
  document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));
  document.getElementById(sectionId).classList.add('active');
}

// Adicionar novo registro
document.getElementById('entry-form').addEventListener('submit', async function(e){
  e.preventDefault();
  const week = document.getElementById('week').value;
  const type = document.getElementById('type').value;
  const content = document.getElementById('content').value;

  const newEntry = { week, type, content };

  // Enviar para backend
  await fetch('/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newEntry)
  });

  document.getElementById('entry-form').reset();
  updatePortfolio();
});

// Atualizar portfólio e dashboard
async function updatePortfolio(filters = {}) {
  const { type = 'todos', date = '' } = filters;
  const list = document.getElementById('portfolio-list');
  list.innerHTML = '';

  const response = await fetch('/entries');
  let entries = await response.json();

  if (type !== 'todos') {
    entries = entries.filter(e => e.type === type);
  }

  if (date) {
    entries = entries.filter(e => e.week === date);
  }

  // Ordenar as entradas por data para encontrar a mais recente
  entries.sort((a, b) => new Date(b.week) - new Date(a.week));

  // Criar um mapeamento para os nomes amigáveis
  const typeMapping = {
    'atividade_avaliativa': 'Atividade Avaliativa',
    'forum': 'Fórum',
    'reflexao_pessoal': 'Reflexão Pessoal'
  };

  entries.forEach(entry => {
    const li = document.createElement('li');
    let typeName;
    let icon;

    switch (entry.type) {
        case 'atividade_avaliativa':
            typeName = 'Atividade Avaliativa';
            icon = '📄';
            break;
        case 'forum':
            typeName = 'Fórum';
            icon = '💬';
            break;
        case 'reflexao_pessoal':
            typeName = 'Reflexão Pessoal';
            icon = '✍️';
            break;
        default:
            typeName = entry.type;
            icon = '❓';
    }

    li.innerHTML = `<div class="card-header"><span class="icon">${icon}</span><span class="type-name">${typeName}</span><span class="date">${entry.week}</span></div><div class="card-content"><p>${entry.content}</p></div>`;
    list.appendChild(li);
  });

  // Atualizar dashboard com base em todas as entradas (sem filtro)
  const allEntries = await (await fetch('/entries')).json();
  const totalActivities = allEntries.filter(e => e.type === 'atividade_avaliativa').length;
  const totalForums = allEntries.filter(e => e.type === 'forum').length;
  const totalReflections = allEntries.filter(e => e.type === 'reflexao_pessoal').length;
  const totalEntries = allEntries.length;

  document.getElementById('total-activities').textContent = totalActivities;
  document.getElementById('total-forums').textContent = totalForums;
  document.getElementById('total-reflections').textContent = totalReflections;
  
  // A porcentagem de conclusão é baseada no total de todas as entradas
  document.getElementById('completion-percent').textContent = totalEntries === 0 ? '0%' : Math.round((totalEntries / 20) * 100) + '%';
}

// Lógica de filtragem
document.getElementById('filter-type').addEventListener('change', function() {
  const typeFilter = document.getElementById('filter-type').value;
  const dateFilter = document.getElementById('filter-date').value;
  updatePortfolio({ type: typeFilter, date: dateFilter });
});

document.getElementById('filter-date').addEventListener('change', function() {
  const typeFilter = document.getElementById('filter-type').value;
  const dateFilter = document.getElementById('filter-date').value;
  updatePortfolio({ type: typeFilter, date: dateFilter });
});

// Inicializa
updatePortfolio();