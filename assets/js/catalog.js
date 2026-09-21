/**
 * PipePrime - Catalog Controller
 * Фильтрация, поиск, сортировка и модальный просмотр продукции
 */

(function() {
  'use strict';

  const CatalogController = {
    allProducts: [],
    filteredProducts: [],
    currentCategory: 'all',
    currentDiameter: 'all',
    currentSDR: 'all',
    searchQuery: '',

    init() {
      if (!window.PIPEBOUND_DATA) return;
      this.allProducts = window.PIPEBOUND_DATA.getProducts();
      this.filteredProducts = [...this.allProducts];

      // Проверяем URL-параметры (например, ?category=uninsulated_bars)
      const urlParams = new URLSearchParams(window.location.search);
      const catParam = urlParams.get('category');
      if (catParam) {
        this.currentCategory = catParam;
      }

      this.bindEvents();
      this.renderFilters();
      this.renderProducts();
    },

    bindEvents() {
      // Поиск
      const searchInput = document.getElementById('catalog-search-input');
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          this.searchQuery = e.target.value.toLowerCase().trim();
          this.applyFilters();
        });
      }

      // Сброс фильтров
      const resetBtn = document.getElementById('catalog-reset-filters');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          this.currentCategory = 'all';
          this.currentDiameter = 'all';
          this.currentSDR = 'all';
          this.searchQuery = '';
          if (searchInput) searchInput.value = '';
          this.updateActiveFilterUI();
          this.applyFilters();
        });
      }
    },

    renderFilters() {
      // Рендер категорий
      const catContainer = document.getElementById('filter-categories');
      if (catContainer && window.PIPEBOUND_DATA.categories) {
        let html = `
          <button class="filter-chip ${this.currentCategory === 'all' ? 'active' : ''}" data-category="all">
            Все позиции (${this.allProducts.length})
          </button>
        `;
        window.PIPEBOUND_DATA.categories.forEach(c => {
          const count = this.allProducts.filter(p => p.categoryId === c.id).length;
          html += `
            <button class="filter-chip ${this.currentCategory === c.id ? 'active' : ''}" data-category="${c.id}">
              ${c.shortName} (${count})
            </button>
          `;
        });
        catContainer.innerHTML = html;

        catContainer.querySelectorAll('.filter-chip').forEach(btn => {
          btn.addEventListener('click', () => {
            catContainer.querySelectorAll('.filter-chip').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            this.currentCategory = btn.getAttribute('data-category');
            this.applyFilters();
          });
        });
      }

      // Рендер фильтра диаметров
      const diamSelect = document.getElementById('filter-diameter');
      if (diamSelect) {
        diamSelect.addEventListener('change', (e) => {
          this.currentDiameter = e.target.value;
          this.applyFilters();
        });
      }

      // Рендер фильтра SDR
      const sdrSelect = document.getElementById('filter-sdr');
      if (sdrSelect) {
        sdrSelect.addEventListener('change', (e) => {
          this.currentSDR = e.target.value;
          this.applyFilters();
        });
      }
    },

    updateActiveFilterUI() {
      document.querySelectorAll('#filter-categories .filter-chip').forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-category') === this.currentCategory);
      });
      const dSel = document.getElementById('filter-diameter');
      if (dSel) dSel.value = this.currentDiameter;
      const sSel = document.getElementById('filter-sdr');
      if (sSel) sSel.value = this.currentSDR;
    },

    applyFilters() {
      this.filteredProducts = this.allProducts.filter(item => {
        // Фильтр по категории
        if (this.currentCategory !== 'all' && item.categoryId !== this.currentCategory) {
          return false;
        }
        // Фильтр по диаметру
        if (this.currentDiameter !== 'all') {
          if (item.diameter !== parseInt(this.currentDiameter)) {
            return false;
          }
        }
        // Фильтр по SDR
        if (this.currentSDR !== 'all') {
          if (typeof item.sdr === 'number' && item.sdr !== parseFloat(this.currentSDR)) {
            return false;
          }
        }
        // Поиск по названию или артикулу
        if (this.searchQuery) {
          const text = `${item.name} ${item.article} ${item.categoryName} d${item.diameter}`.toLowerCase();
          if (!text.includes(this.searchQuery)) {
            return false;
          }
        }
        return true;
      });

      this.renderProducts();
    },

    renderProducts() {
      const grid = document.getElementById('catalog-products-grid');
      const countEl = document.getElementById('catalog-results-count');

      if (countEl) {
        countEl.textContent = `Найдено: ${this.filteredProducts.length} позиций`;
      }

      if (!grid) return;

      if (this.filteredProducts.length === 0) {
        grid.innerHTML = `
          <div class="catalog-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <h3>По выбранным параметрам ничего не найдено</h3>
            <p>Попробуйте сбросить фильтры или ввести другой диаметр / наименование.</p>
            <button class="btn btn--outline btn--sm" onclick="CatalogController.resetAll()">Сбросить фильтры</button>
          </div>
        `;
        return;
      }

      grid.innerHTML = this.filteredProducts.map(p => `
        <div class="product-card" data-product-id="${p.id}">
          <div class="product-card__header">
            <span class="product-card__article">${p.article}</span>
            ${p.sdr ? `<span class="badge-tag">SDR ${p.sdr}</span>` : ''}
          </div>
          <div class="product-card__image-box" onclick="CatalogController.openQuickView('${p.id}')">
            <img src="${p.image}" alt="${p.name}" loading="lazy">
          </div>
          <div class="product-card__content">
            <h4 class="product-card__title" onclick="CatalogController.openQuickView('${p.id}')">${p.name}</h4>
            
            <div class="product-card__specs">
              ${p.diameter ? `<div class="spec-row"><span>Диаметр:</span><strong>d${p.diameter} мм</strong></div>` : ''}
              ${p.casingD ? `<div class="spec-row"><span>Оболочка:</span><strong>D${p.casingD} мм</strong></div>` : ''}
              ${p.wall ? `<div class="spec-row"><span>Стенка:</span><strong>${p.wall} мм</strong></div>` : ''}
              ${p.pressure ? `<div class="spec-row"><span>Давление:</span><strong>${p.pressure}</strong></div>` : ''}
              ${p.weightM ? `<div class="spec-row"><span>Вес 1 м:</span><strong>${p.weightM} кг</strong></div>` : ''}
            </div>

            <div class="product-card__footer">
              <button class="btn btn--primary btn--sm" onclick="CatalogController.addToCart('${p.id}')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                В спецификацию
              </button>
              <button class="btn btn--outline btn--sm" onclick="CatalogController.openQuickView('${p.id}')" title="Характеристики">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
              </button>
            </div>
          </div>
        </div>
      `).join('');
    },

    addToCart(id) {
      const product = this.allProducts.find(p => p.id === id);
      if (product && window.SpecCart) {
        window.SpecCart.addItem(product, 1);
      }
    },

    openQuickView(id) {
      const p = this.allProducts.find(item => item.id === id);
      if (!p) return;

      const modal = document.getElementById('modal-quickview');
      const body = document.getElementById('modal-quickview-body');
      if (!modal || !body) return;

      body.innerHTML = `
        <div class="quickview-grid">
          <div class="quickview-image">
            <img src="${p.image}" alt="${p.name}">
            <div class="quickview-blueprint">
              <img src="assets/images/pipe_cross_section.png" alt="Чертеж сечения трубы" style="max-height: 120px; object-fit: contain;">
              <span>Чертеж сечения по АТР 2026</span>
            </div>
          </div>
          <div class="quickview-info">
            <span class="badge-tag" style="margin-bottom: 8px;">${p.categoryName}</span>
            <h3 style="margin-bottom: 6px;">${p.name}</h3>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 16px;">Артикул: ${p.article} | Стандарт: ${p.standard || 'ГОСТ'}</p>
            
            <div class="quickview-table">
              <div class="q-row"><span>Наружный диаметр (d):</span><strong>${p.diameter || '—'} мм</strong></div>
              ${p.casingD ? `<div class="q-row"><span>Диаметр оболочки (D):</span><strong>${p.casingD} мм</strong></div>` : ''}
              ${p.sdr ? `<div class="q-row"><span>SDR:</span><strong>${p.sdr}</strong></div>` : ''}
              ${p.wall ? `<div class="q-row"><span>Толщина стенки (e):</span><strong>${p.wall} мм</strong></div>` : ''}
              ${p.innerD ? `<div class="q-row"><span>Внутренний диаметр:</span><strong>${p.innerD} мм</strong></div>` : ''}
              ${p.pressure ? `<div class="q-row"><span>Рабочее давление:</span><strong>${p.pressure}</strong></div>` : ''}
              ${p.temp ? `<div class="q-row"><span>Температурный режим:</span><strong>${p.temp}</strong></div>` : ''}
              ${p.weightM ? `<div class="q-row"><span>Масса 1 метра:</span><strong>${p.weightM} кг</strong></div>` : ''}
              ${p.weightBar ? `<div class="q-row"><span>Масса 1 хлыста (12 м):</span><strong>${p.weightBar} кг</strong></div>` : ''}
              ${p.form ? `<div class="q-row"><span>Форма поставки:</span><strong>${p.form}</strong></div>` : ''}
              ${p.insulation ? `<div class="q-row"><span>Изоляция:</span><strong>${p.insulation}</strong></div>` : ''}
            </div>

            <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 16px 0;"><strong>Область применения:</strong> ${p.application || 'Тепловые сети и ГВС'}</p>

            <div style="display: flex; gap: 12px; margin-top: 20px;">
              <button class="btn btn--primary" onclick="CatalogController.addToCart('${p.id}'); App.closeAllModals();">
                Добавить в спецификацию
              </button>
              <button class="btn btn--outline" onclick="App.closeAllModals(); App.openModal('modal-quote');">
                Запросить оптовую цену
              </button>
            </div>
          </div>
        </div>
      `;

      window.App.openModal('modal-quickview');
    },

    resetAll() {
      this.currentCategory = 'all';
      this.currentDiameter = 'all';
      this.currentSDR = 'all';
      this.searchQuery = '';
      const s = document.getElementById('catalog-search-input');
      if (s) s.value = '';
      this.updateActiveFilterUI();
      this.applyFilters();
    }
  };

  window.CatalogController = CatalogController;

  document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('catalog-products-grid')) {
      CatalogController.init();
    }
  });
})();
