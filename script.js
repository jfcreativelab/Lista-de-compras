// Lista de itens
let shoppingList = [];

// Elementos DOM
const listContainer = document.getElementById('listContainer');
const itemNameInput = document.getElementById('itemName');
const itemQtyInput = document.getElementById('itemQty');
const itemPriceInput = document.getElementById('itemPrice');
const itemCategorySelect = document.getElementById('itemCategory');
const filterCategorySelect = document.getElementById('filterCategory');
const filterStatusSelect = document.getElementById('filterStatus');
const totalAmount = document.getElementById('totalAmount');
const themeBtn = document.getElementById('toggleTema');  // Note: o id no HTML para o botão de tema é "toggleTema"
const btnExportar = document.getElementById('btnExportar');
const btnGrafico = document.getElementById('btnGrafico');
const chartModal = document.getElementById('chartModal');
const closeModal = document.querySelector('.close');
const expenseChart = document.getElementById('expenseChart');

// Cores por categoria (para o gráfico)
const categoryColors = {
  hortifruti: '#4cc9f0',
  padaria: '#f8961e',
  carnes: '#f72585',
  laticinios: '#f0932b',
  bebidas: '#4361ee',
  mercearia: '#a29bfe',
  congelados: '#00cec9',
  limpeza: '#3f37c9',
  higiene: '#fd79a8',
  pets: '#55efc4',
  outros: '#6c757d'
};

// Ícones por categoria
const categoryIcons = {
  hortifruti: 'fas fa-apple-alt',
  padaria: 'fas fa-bread-slice',
  carnes: 'fas fa-drumstick-bite',
  laticinios: 'fas fa-cheese',
  bebidas: 'fas fa-wine-bottle',
  mercearia: 'fas fa-shopping-basket',
  congelados: 'fas fa-ice-cream',
  limpeza: 'fas fa-broom',
  higiene: 'fas fa-soap',
  pets: 'fas fa-paw',
  outros: 'fas fa-ellipsis-h'
};

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  loadItems();
  renderList();
  
  // Se existir, adiciona listener para o botão de comparação
  const compareBtn = document.getElementById('compareBtn');
  if(compareBtn){
    compareBtn.addEventListener('click', fetchPriceComparison);
  }
  
  // Event listeners para os campos de entrada
  itemNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addItem();
  });
  itemQtyInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addItem();
  });
  itemPriceInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addItem();
  });
  
  filterCategorySelect.addEventListener('change', renderList);
  filterStatusSelect.addEventListener('change', renderList);
  
  themeBtn.addEventListener('click', toggleTheme);
  btnExportar.addEventListener('click', exportList);
  btnGrafico.addEventListener('click', showChart);
  
  closeModal.addEventListener('click', () => {
    chartModal.style.display = 'none';
  });
  
  // Fechar modal ao clicar fora
  window.addEventListener('click', (e) => {
    if (e.target === chartModal) {
      chartModal.style.display = 'none';
    }
  });
  
  // Painel lateral de pesquisa
  const abrirPesquisaBtn = document.getElementById("abrirPesquisa");
  const painelPesquisa = document.getElementById("painelPesquisa");
  const fecharPesquisaBtn = document.getElementById("fecharPainel");
  const campoPesquisa = document.getElementById("campoPesquisa");
  const btnBuscar = document.getElementById("pesquisarBtn");

  abrirPesquisaBtn.addEventListener("click", () => {
    painelPesquisa.classList.add("ativo");
    campoPesquisa.focus();
  });
  fecharPesquisaBtn.addEventListener("click", () => {
    painelPesquisa.classList.remove("ativo");
  });
  btnBuscar.addEventListener("click", () => {
    const termo = campoPesquisa.value.trim();
    if (termo) {
      const url = `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(termo)}`;
      window.open(url, '_blank');
    }
  });
});

// Adicionar item
function addItem() {
  const name = itemNameInput.value.trim();
  const qty = parseInt(itemQtyInput.value);
  const price = parseFloat(itemPriceInput.value.replace(',', '.'));
  const category = itemCategorySelect.value;
  
  if (!name || isNaN(qty) || isNaN(price) || qty <= 0 || price <= 0) {
    alert('Por favor, preencha todos os campos corretamente!');
    return;
  }
  
  shoppingList.push({
    id: Date.now(),
    name: name.charAt(0).toUpperCase() + name.slice(1),
    qty,
    price,
    category,
    comprado: false,
    emPromocao: false,
    precoOriginal: price
  });
  
  itemNameInput.value = '';
  itemQtyInput.value = '';
  itemPriceInput.value = '';
  itemNameInput.focus();
  
  saveItems();
  renderList();
}

// Renderizar lista
function renderList() {
  const categoryFilter = filterCategorySelect.value;
  const statusFilter = filterStatusSelect.value;
  
  let filteredList = shoppingList.filter(item => {
    const categoryMatch = (categoryFilter === 'todos' || item.category === categoryFilter);
    const statusMatch = (statusFilter === 'todos' || 
                          (statusFilter === 'comprados' && item.comprado) || 
                          (statusFilter === 'pendentes' && !item.comprado));
    return categoryMatch && statusMatch;
  });
  
  if (filteredList.length === 0) {
    listContainer.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-shopping-basket" style="font-size: 3rem; opacity: 0.3; margin-bottom: 1rem;"></i>
        <p>Sua lista está vazia</p>
        <p style="font-size: 0.9rem; margin-top: 0.5rem;">Adicione itens para começar</p>
      </div>
    `;
    totalAmount.textContent = 'R$ 0,00';
    return;
  }
  
  let html = '';
  let total = 0;
  
  filteredList.forEach((item, index) => {
    const subtotal = item.qty * item.price;
    total += subtotal;
    
    html += `
      <div class="item-card ${item.comprado ? 'comprado' : ''}" data-id="${item.id}">
        <input type="checkbox" class="item-checkbox" ${item.comprado ? 'checked' : ''} onchange="toggleComprado(${item.id}, this.checked)">
        <div class="item-category category-${item.category}">
          <i class="${categoryIcons[item.category] || 'fas fa-shopping-basket'}"></i>
        </div>
        <div class="item-name">${item.name}</div>
        <div class="item-qty">${item.qty}x</div>
        <div class="item-price">R$ ${item.price.toFixed(2).replace('.', ',')}</div>
        <div class="item-actions">
          <button class="btn-action btn-edit" onclick="editItem(${item.id})">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn-action btn-delete" onclick="deleteItem(${item.id})">
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>
        ${item.emPromocao ? '<span class="promo-badge">PROMO</span>' : ''}
      </div>
    `;
  });
  
  listContainer.innerHTML = html;
  totalAmount.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
}

// Alternar status "comprado"
function toggleComprado(id, comprado) {
  const item = shoppingList.find(item => item.id === id);
  if (item) {
    item.comprado = comprado;
    saveItems();
    renderList();
  }
}

// Editar item
function editItem(id) {
  const item = shoppingList.find(item => item.id === id);
  if (!item) return;
  
  const newName = prompt('Nome:', item.name);
  if (newName === null) return;
  
  const newQty = prompt('Quantidade:', item.qty);
  const newPrice = prompt('Preço:', item.price);
  const newCategory = prompt('Categoria (hortifruti, padaria, carnes, bebidas, limpeza, outros):', item.category);
  
  if (newName && !isNaN(newQty) && !isNaN(newPrice) && newCategory) {
    item.name = newName;
    item.qty = parseInt(newQty);
    item.price = parseFloat(newPrice.replace(',', '.'));
    item.category = newCategory.toLowerCase();
    saveItems();
    renderList();
  } else {
    alert('Dados inválidos!');
  }
}

// Deletar item
function deleteItem(id) {
  if (confirm('Tem certeza que deseja remover este item?')) {
    shoppingList = shoppingList.filter(item => item.id !== id);
    saveItems();
    renderList();
  }
}

// Mostrar gráfico
function showChart() {
  if (shoppingList.length === 0) {
    alert('Sua lista está vazia!');
    return;
  }
  
  // Calcular totais por categoria
  const categories = {};
  shoppingList.forEach(item => {
    if (!categories[item.category]) {
      categories[item.category] = 0;
    }
    categories[item.category] += item.qty * item.price;
  });
  
  const labels = Object.keys(categories);
  const data = Object.values(categories);
  const backgroundColors = labels.map(cat => categoryColors[cat] || '#6c757d');
  
  // Se já existe um gráfico, atualiza
  if (window.expenseChartInstance) {
    window.expenseChartInstance.data.labels = labels;
    window.expenseChartInstance.data.datasets[0].data = data;
    window.expenseChartInstance.data.datasets[0].backgroundColor = backgroundColors;
    window.expenseChartInstance.update();
  } else {
    const ctx = expenseChart.getContext('2d');
    window.expenseChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Total por Categoria (R$)',
          data: data,
          backgroundColor: backgroundColors
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `R$ ${context.raw.toFixed(2).replace('.', ',')}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return `R$ ${value.toFixed(2).replace('.', ',')}`;
              }
            }
          }
        }
      }
    });
  }
  
  chartModal.style.display = 'block';
}

// Exportar lista
function exportList() {
  if (shoppingList.length === 0) {
    alert('Sua lista está vazia!');
    return;
  }
  
  let text = '🛒 Lista de Compras 🛒\n\n';
  let total = 0;
  
  // Agrupar por categoria
  const itemsByCategory = {};
  shoppingList.forEach(item => {
    if (!itemsByCategory[item.category]) {
      itemsByCategory[item.category] = [];
    }
    itemsByCategory[item.category].push(item);
  });
  
  Object.keys(itemsByCategory).forEach(category => {
    text += `=== ${category.toUpperCase()} ===\n`;
    
    itemsByCategory[category].forEach((item, index) => {
      const subtotal = item.qty * item.price;
      total += subtotal;
      
      text += `${index + 1}. ${item.name} ${item.comprado ? '[✓]' : ''}\n`;
      text += `   Quantidade: ${item.qty}x | Preço: R$ ${item.price.toFixed(2).replace('.', ',')}\n`;
      text += `   Subtotal: R$ ${subtotal.toFixed(2).replace('.', ',')}\n\n`;
    });
  });
  
  text += `💰 TOTAL: R$ ${total.toFixed(2).replace('.', ',')}\n`;
  text += `\n📅 Gerado em: ${new Date().toLocaleDateString()} às ${new Date().toLocaleTimeString()}\n`;
  
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `lista_compras_${new Date().toISOString().slice(0, 10)}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  // Atualizar botão de exportar (usar btnExportar)
  btnExportar.innerHTML = '<i class="fas fa-check"></i> Exportado!';
  setTimeout(() => {
    btnExportar.innerHTML = '<i class="fas fa-file-export"></i> Exportar';
  }, 2000);
}

// Alternar tema claro/escuro
function toggleTheme() {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  themeBtn.innerHTML = `<i class="fas ${isDark ? 'fa-sun' : 'fa-moon'}"></i> ${isDark ? 'Claro' : 'Escuro'}`;
  localStorage.setItem('darkMode', isDark);
}

// Salvar itens no localStorage
function saveItems() {
  localStorage.setItem('shoppingList', JSON.stringify(shoppingList));
}

// Carregar itens do localStorage
function loadItems() {
  const savedList = localStorage.getItem('shoppingList');
  if (savedList) {
    shoppingList = JSON.parse(savedList);
  }
  
  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
    themeBtn.innerHTML = '<i class="fas fa-sun"></i> Claro';
  }
}
