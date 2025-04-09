
let shoppingList = [];
const listContainer = document.getElementById('listContainer');
const itemNameInput = document.getElementById('itemName');
const itemQtyInput = document.getElementById('itemQty');
const itemPriceInput = document.getElementById('itemPrice');
const totalAmount = document.getElementById('totalAmount');
const themeBtn = document.getElementById('themeBtn');
const exportBtn = document.getElementById('exportBtn');
document.addEventListener('DOMContentLoaded', () => {
  loadItems();
  renderList();
  
  // Event listeners
  itemNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addItem();
  });
  
  itemQtyInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addItem();
  });
  
  itemPriceInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addItem();
  });
  
  themeBtn.addEventListener('click', toggleTheme);
  exportBtn.addEventListener('click', exportList);
});
function addItem() {
  const name = itemNameInput.value.trim();
  const qty = parseInt(itemQtyInput.value);
  const price = parseFloat(itemPriceInput.value.replace(',', '.'));
  if (!name || isNaN(qty) || isNaN(price) || qty <= 0 || price <= 0) {
    alert('Por favor, preencha todos os campos corretamente!');
    return;
  }
  shoppingList.push({
    id: Date.now(),
    name: name.charAt(0).toUpperCase() + name.slice(1),
    qty,
    price
  });
  itemNameInput.value = '';
  itemQtyInput.value = '';
  itemPriceInput.value = '';
  itemNameInput.focus();
  
  saveItems();
  renderList();
}
function renderList() {
  if (shoppingList.length === 0) {
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
  
  shoppingList.forEach((item, index) => {
    const subtotal = item.qty * item.price;
    total += subtotal;
    
    html += `
      <div class="item" data-id="${item.id}">
        <div class="item-name">${index + 1}. ${item.name}</div>
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
      </div>
    `;
  });
  
  listContainer.innerHTML = html;
  totalAmount.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
}
function editItem(id) {
  const item = shoppingList.find(item => item.id === id);
  if (!item) return;
  
  const newName = prompt('Nome:', item.name);
  if (newName === null) return;
  
  const newQty = prompt('Quantidade:', item.qty);
  const newPrice = prompt('Preço:', item.price);
  
  if (newName && !isNaN(newQty) && !isNaN(newPrice)) {
    item.name = newName;
    item.qty = parseInt(newQty);
    item.price = parseFloat(newPrice.replace(',', '.'));
    saveItems();
    renderList();
  } else {
    alert('Dados inválidos!');
  }
}
function deleteItem(id) {
  if (confirm('Tem certeza que deseja remover este item?')) {
    shoppingList = shoppingList.filter(item => item.id !== id);
    saveItems();
    renderList();
  }
}
function toggleTheme() {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  themeBtn.innerHTML = `
    <i class="fas ${isDark ? 'fa-sun' : 'fa-moon'}"></i> 
    ${isDark ? 'Claro' : 'Escuro'}
  `;
  localStorage.setItem('darkMode', isDark);
}
function exportList() {
  if (shoppingList.length === 0) {
    alert('Sua lista está vazia!');
    return;
  }
  
  let text = '🛒 Lista de Compras 🛒\n\n';
  let total = 0;
  
  shoppingList.forEach((item, index) => {
    const subtotal = item.qty * item.price;
    text += `${index + 1}. ${item.name}\n`;
    text += `   Quantidade: ${item.qty} | Preço: R$ ${item.price.toFixed(2).replace('.', ',')}\n`;
    text += `   Subtotal: R$ ${subtotal.toFixed(2).replace('.', ',')}\n\n`;
    total += subtotal;
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
  
  // Feedback visual
  exportBtn.innerHTML = '<i class="fas fa-check"></i> Exportado!';
  setTimeout(() => {
    exportBtn.innerHTML = '<i class="fas fa-file-export"></i> Exportar';
  }, 2000);
}
function saveItems() {
  localStorage.setItem('shoppingList', JSON.stringify(shoppingList));
}
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