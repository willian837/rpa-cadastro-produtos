(function () {
  'use strict';

  const LOGIN_KEY = 'cadastro_produtos_logado';
  if (localStorage.getItem(LOGIN_KEY) !== 'true') {
    window.location.replace('login.html');
    return;
  }

  const STORAGE_KEY = 'cadastro_produtos_drogaria_v1';
  const form = document.getElementById('productForm');
  const tableBody = document.getElementById('productTableBody');
  const count = document.getElementById('productCount');
  const resultCount = document.getElementById('resultCount');
  const feedback = document.getElementById('feedback');
  const emptyState = document.getElementById('emptyState');
  const clearInventoryButton = document.getElementById('clearInventoryButton');
  const logoutButton = document.getElementById('logoutButton');
  const expirationInput = document.getElementById('expirationDate');

  let feedbackTimeout;
  let products = loadProducts();

  function loadProducts() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];

      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) {
        throw new Error('O conteúdo salvo não contém uma lista de produtos.');
      }

      return parsed;
    } catch (error) {
      console.error('Não foi possível carregar os medicamentos salvos.', error);
      showFeedback('Não foi possível carregar os dados salvos. Consulte o console para mais detalhes.', 'error');
      return [];
    }
  }

  function saveProducts() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
      return true;
    } catch (error) {
      console.error('Não foi possível salvar os medicamentos.', error);
      showFeedback('Não foi possível salvar. Verifique o espaço disponível no navegador.', 'error');
      return false;
    }
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, character => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[character]);
  }

  function formatCurrency(value) {
    return Number(value).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }

  function formatDate(value) {
    if (!value) return '—';
    const [year, month, day] = value.split('-');
    return `${day}/${month}/${year}`;
  }

  function getLocalDateValue(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function getExpirationStatus(value) {
    if (!value) return '';
    const expiration = new Date(`${value}T23:59:59`);
    const now = new Date();
    const daysUntilExpiration = Math.ceil((expiration - now) / 86400000);

    if (daysUntilExpiration < 0) return 'expired';
    if (daysUntilExpiration <= 90) return 'soon';
    return '';
  }

  function createProductRow(product) {
    const row = document.createElement('tr');
    const presentation = [product.strength, product.dosageForm].filter(Boolean).join(' · ');
    const expirationStatus = getExpirationStatus(product.expirationDate);
    const stockClass = Number(product.stock) <= 5 ? 'low' : '';
    const expirationClass = expirationStatus ? ` ${expirationStatus}` : '';
    const expirationLabel = expirationStatus === 'expired'
      ? 'Vencido'
      : expirationStatus === 'soon'
        ? 'Próximo'
        : '';
    row.innerHTML = `
      <td class="code-cell">${escapeHtml(product.productCode)}</td>
      <td>
        <span class="product-name" title="${escapeHtml(product.productName)}">${escapeHtml(product.productName)}</span>
        <span class="product-detail" title="${escapeHtml(product.activeIngredient)}">${escapeHtml(product.activeIngredient)}${product.manufacturer ? ` · ${escapeHtml(product.manufacturer)}` : ''}</span>
      </td>
      <td><span class="category-tag">${escapeHtml(product.category)}</span></td>
      <td>${escapeHtml(presentation || '—')}</td>
      <td>
        <span class="product-detail">${escapeHtml(product.batch || 'Sem lote')}</span>
        <span class="expiry-tag${expirationClass}">${escapeHtml(formatDate(product.expirationDate))}${expirationLabel ? ` · ${expirationLabel}` : ''}</span>
      </td>
      <td><span class="stock-tag ${stockClass}">${escapeHtml(product.stock)}</span></td>
      <td class="price-column">${formatCurrency(product.price)}</td>
      <td>
        <button class="delete-button" type="button" data-delete-id="${escapeHtml(product.id)}" aria-label="Excluir ${escapeHtml(product.productName)}" title="Excluir medicamento">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 7h16m-10 4v6m4-6v6M5 7l1 14h12l1-14M9 7V4h6v3"></path>
          </svg>
        </button>
      </td>
    `;
    return row;
  }

  function renderProducts() {
    tableBody.replaceChildren(...products.map(createProductRow));
    count.textContent = products.length;
    resultCount.textContent = `${products.length} ${products.length === 1 ? 'produto' : 'produtos'}`;
    emptyState.hidden = products.length !== 0;
  }

  function showFeedback(message, type) {
    window.clearTimeout(feedbackTimeout);
    feedback.textContent = message;
    feedback.className = `feedback show ${type}`;
    feedbackTimeout = window.setTimeout(() => {
      feedback.className = 'feedback';
      feedback.textContent = '';
    }, 4500);
  }

  function collectProduct() {
    const data = new FormData(form);
    return {
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      productCode: String(data.get('productCode')).trim(),
      productName: String(data.get('productName')).trim(),
      activeIngredient: String(data.get('activeIngredient')).trim(),
      category: String(data.get('category')),
      dosageForm: String(data.get('dosageForm')),
      strength: String(data.get('strength') || '').trim(),
      manufacturer: String(data.get('manufacturer') || '').trim(),
      barcode: String(data.get('barcode') || '').trim(),
      batch: String(data.get('batch') || '').trim(),
      expirationDate: String(data.get('expirationDate')),
      stock: Number(data.get('stock')),
      price: Number(data.get('price')),
      createdAt: new Date().toISOString()
    };
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const product = collectProduct();
    if (products.some(item => item.productCode.toLocaleLowerCase('pt-BR') === product.productCode.toLocaleLowerCase('pt-BR'))) {
      showFeedback('Já existe um medicamento com esse código interno.', 'error');
      document.getElementById('productCode').focus();
      return;
    }

    products.unshift(product);
    if (!saveProducts()) {
      products.shift();
      return;
    }

    form.reset();
    renderProducts();
    showFeedback(`Medicamento "${product.productName}" cadastrado com sucesso.`, 'success');
    document.getElementById('productCode').focus();
  }

  function deleteProduct(id) {
    const index = products.findIndex(product => product.id === id);
    if (index < 0) return;

    const [removed] = products.splice(index, 1);
    if (!saveProducts()) {
      products.splice(index, 0, removed);
      renderProducts();
      return;
    }

    renderProducts();
    showFeedback(`Medicamento "${removed.productName}" removido.`, 'success');
  }

  function clearInventory() {
    if (products.length === 0) return;
    if (!window.confirm('Deseja remover todos os medicamentos cadastrados?')) return;

    const previousProducts = products;
    products = [];
    if (!saveProducts()) {
      products = previousProducts;
      renderProducts();
      return;
    }

    renderProducts();
    showFeedback('Inventário limpo com sucesso.', 'success');
  }

  function init() {
    expirationInput.min = getLocalDateValue(new Date());
    form.addEventListener('submit', handleSubmit);
    clearInventoryButton.addEventListener('click', clearInventory);
    logoutButton.addEventListener('click', () => {
      localStorage.removeItem(LOGIN_KEY);
      window.location.replace('login.html');
    });
    tableBody.addEventListener('click', event => {
      const button = event.target.closest('[data-delete-id]');
      if (button) deleteProduct(button.dataset.deleteId);
    });
    form.addEventListener('reset', () => {
      window.setTimeout(() => {
        expirationInput.min = getLocalDateValue(new Date());
      });
    });

    renderProducts();
    window.RPAProdutos = {
      adicionar(productData) {
        const product = {
          ...productData,
          id: productData.id || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          createdAt: productData.createdAt || new Date().toISOString()
        };
        if (!product.productCode || !product.productName) {
          throw new Error('Código interno e nome do medicamento são obrigatórios.');
        }
        if (products.some(item => item.productCode.toLocaleLowerCase('pt-BR') === String(product.productCode).trim().toLocaleLowerCase('pt-BR'))) {
          throw new Error('Já existe um medicamento com esse código interno.');
        }
        products.unshift(product);
        if (!saveProducts()) {
          products.shift();
          throw new Error('Não foi possível salvar o medicamento no navegador.');
        }
        renderProducts();
        return { ...product };
      },
      obter: () => products.map(product => ({ ...product })),
      total: () => products.length,
      limpar: clearInventory
    };
  }

  init();
})();
