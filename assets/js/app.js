/**
 * PipePrime - Core Application Logic
 * Управление корзиной спецификаций, модальными окнами, формами и навигацией
 */

(function() {
  'use strict';

  // Состояние спецификации (корзины)
  const SpecCart = {
    items: [],

    init() {
      try {
        const saved = localStorage.getItem('pipeprime_spec_cart');
        if (saved) {
          this.items = JSON.parse(saved);
        }
      } catch (e) {
        this.items = [];
      }
      this.updateUI();
    },

    save() {
      try {
        localStorage.setItem('pipeprime_spec_cart', JSON.stringify(this.items));
      } catch (e) {}
      this.updateUI();
    },

    addItem(product, qty = 1) {
      const existing = this.items.find(i => i.id === product.id);
      if (existing) {
        existing.qty += qty;
      } else {
        this.items.push({
          id: product.id,
          name: product.name,
          article: product.article,
          diameter: product.diameter,
          sdr: product.sdr,
          form: product.form || 'Шт.',
          weightM: product.weightM || 0,
          qty: qty
        });
      }
      this.save();
      App.showToast(`«${product.name}» добавлен в спецификацию`);
    },

    removeItem(id) {
      this.items = this.items.filter(i => i.id !== id);
      this.save();
    },

    updateQty(id, qty) {
      const item = this.items.find(i => i.id === id);
      if (item) {
        item.qty = Math.max(1, parseInt(qty) || 1);
        this.save();
      }
    },

    clear() {
      this.items = [];
      this.save();
    },

    getCount() {
      return this.items.reduce((sum, i) => sum + i.qty, 0);
    },

    getTotalWeight() {
      return this.items.reduce((sum, i) => {
        const len = i.form && i.form.includes('12 м') ? 12 : 1;
        return sum + (i.weightM * len * i.qty);
      }, 0);
    },

    updateUI() {
      const badges = document.querySelectorAll('.spec-cart-count');
      const count = this.getCount();
      badges.forEach(b => {
        b.textContent = count;
        b.style.display = count > 0 ? 'inline-flex' : 'none';
      });

      const drawerList = document.getElementById('drawer-spec-list');
      const emptyMsg = document.getElementById('drawer-spec-empty');
      const footer = document.getElementById('drawer-spec-footer');
      const weightEl = document.getElementById('drawer-spec-weight');

      if (drawerList) {
        if (this.items.length === 0) {
          drawerList.innerHTML = '';
          if (emptyMsg) emptyMsg.style.display = 'block';
          if (footer) footer.style.display = 'none';
        } else {
          if (emptyMsg) emptyMsg.style.display = 'none';
          if (footer) footer.style.display = 'block';

          drawerList.innerHTML = this.items.map(item => `
            <div class="cart-item" data-id="${item.id}">
              <div class="cart-item__info">
                <div class="cart-item__title">${item.name}</div>
                <div class="cart-item__meta">Арт: ${item.article} | ${item.form}</div>
              </div>
              <div class="cart-item__actions">
                <input type="number" class="qty-input" min="1" value="${item.qty}" onchange="SpecCart.updateQty('${item.id}', this.value)">
                <button class="cart-item__remove" onclick="SpecCart.removeItem('${item.id}')" title="Удалить">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
            </div>
          `).join('');

          if (weightEl) {
            const w = this.getTotalWeight();
            weightEl.textContent = w > 1000 ? `${(w / 1000).toFixed(2)} т` : `${w.toFixed(1)} кг`;
          }
        }
      }
    }
  };

  // Главный контроллер интерфейса
  const App = {
    init() {
      this.initHeaderScroll();
      this.initModals();
      this.initDrawer();
      this.initForms();
      this.initMobileMenu();
      this.initHeroSlider();
      SpecCart.init();
    },

    initHeroSlider() {
      const slider = document.getElementById('hero-slider');
      if (!slider) return;

      const slides = Array.from(slider.querySelectorAll('.hero-slide'));
      const dots = Array.from(slider.querySelectorAll('.hero-dot'));
      const currentEl = document.getElementById('hero-slider-current');
      const totalEl = document.getElementById('hero-slider-total');
      const prevBtn = document.getElementById('hero-prev');
      const nextBtn = document.getElementById('hero-next');

      if (slides.length === 0) return;

      let currentIndex = 0;
      let timer = null;
      const total = slides.length;

      if (totalEl) {
        totalEl.textContent = String(total).padStart(2, '0');
      }

      function goTo(idx) {
        currentIndex = (idx + total) % total;
        slides.forEach((slide, i) => {
          slide.classList.toggle('active', i === currentIndex);
        });
        dots.forEach((dot, i) => {
          dot.classList.toggle('active', i === currentIndex);
        });
        if (currentEl) {
          currentEl.textContent = String(currentIndex + 1).padStart(2, '0');
        }
      }

      function next() {
        goTo(currentIndex + 1);
      }

      function prev() {
        goTo(currentIndex - 1);
      }

      function startAutoplay() {
        stopAutoplay();
        timer = setInterval(next, 5000);
      }

      function stopAutoplay() {
        if (timer) {
          clearInterval(timer);
          timer = null;
        }
      }

      function resetAutoplay() {
        stopAutoplay();
        startAutoplay();
      }

      if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
          e.preventDefault();
          prev();
          resetAutoplay();
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
          e.preventDefault();
          next();
          resetAutoplay();
        });
      }

      dots.forEach((dot, i) => {
        dot.addEventListener('click', () => {
          goTo(i);
          resetAutoplay();
        });
      });

      // Пауза при наведении мыши
      slider.addEventListener('mouseenter', stopAutoplay);
      slider.addEventListener('mouseleave', startAutoplay);

      // Свайпы на мобильных устройствах
      let touchStartX = 0;
      let touchEndX = 0;
      slider.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });

      slider.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        if (touchStartX - touchEndX > 45) {
          next();
          resetAutoplay();
        } else if (touchEndX - touchStartX > 45) {
          prev();
          resetAutoplay();
        }
      }, { passive: true });

      // Запуск
      goTo(0);
      startAutoplay();
    },

    initHeaderScroll() {
      const header = document.querySelector('.header');
      if (!header) return;

      window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      }, { passive: true });
    },

    initModals() {
      // Кнопки открытия модальных окон
      document.querySelectorAll('[data-open-modal]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const modalId = btn.getAttribute('data-open-modal');
          this.openModal(modalId);
        });
      });

      // Закрытие модальных окон
      document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
        backdrop.addEventListener('click', (e) => {
          if (e.target === backdrop || e.target.closest('.modal-close')) {
            this.closeAllModals();
          }
        });
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.closeAllModals();
          this.closeDrawer();
        }
      });
    },

    openModal(id) {
      const modal = document.getElementById(id);
      if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    },

    closeAllModals() {
      document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('active'));
      document.body.style.overflow = '';
    },

    initDrawer() {
      const drawerBackdrop = document.getElementById('spec-drawer');
      const openBtns = document.querySelectorAll('.open-spec-drawer');
      const closeBtn = document.getElementById('close-spec-drawer');

      openBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          this.openDrawer();
        });
      });

      if (closeBtn) {
        closeBtn.addEventListener('click', () => this.closeDrawer());
      }

      if (drawerBackdrop) {
        drawerBackdrop.addEventListener('click', (e) => {
          if (e.target === drawerBackdrop) {
            this.closeDrawer();
          }
        });
      }
    },

    openDrawer() {
      const drawer = document.getElementById('spec-drawer');
      if (drawer) {
        SpecCart.updateUI();
        drawer.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    },

    closeDrawer() {
      const drawer = document.getElementById('spec-drawer');
      if (drawer) {
        drawer.classList.remove('active');
        document.body.style.overflow = '';
      }
    },

    initMobileMenu() {
      const burgerBtn = document.querySelector('.burger-btn');
      const mobileNav = document.getElementById('mobile-nav');
      if (burgerBtn && mobileNav) {
        burgerBtn.addEventListener('click', () => {
          mobileNav.classList.toggle('active');
        });
      }
    },

    initForms() {
      // Обработка форм заявок
      document.querySelectorAll('form[data-ajax-form]').forEach(form => {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          const submitBtn = form.querySelector('button[type="submit"]');
          const originalText = submitBtn ? submitBtn.innerHTML : '';
          
          if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Отправка...';
          }

          setTimeout(() => {
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.innerHTML = originalText;
            }
            form.reset();
            App.closeAllModals();
            App.closeDrawer();
            App.openModal('modal-success');
          }, 600);
        });
      });

      // Drag and drop для файлов смет
      const dropzone = document.querySelector('.file-dropzone');
      const fileInput = document.getElementById('project-file-input');

      if (dropzone && fileInput) {
        dropzone.addEventListener('click', () => fileInput.click());

        ['dragenter', 'dragover'].forEach(eventName => {
          dropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            dropzone.classList.add('dragover');
          });
        });

        ['dragleave', 'drop'].forEach(eventName => {
          dropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            dropzone.classList.remove('dragover');
          });
        });

        dropzone.addEventListener('drop', (e) => {
          if (e.dataTransfer.files.length > 0) {
            fileInput.files = e.dataTransfer.files;
            this.handleFileSelected(fileInput.files[0]);
          }
        });

        fileInput.addEventListener('change', () => {
          if (fileInput.files.length > 0) {
            this.handleFileSelected(fileInput.files[0]);
          }
        });
      }
    },

    handleFileSelected(file) {
      const label = document.querySelector('.file-dropzone__title');
      if (label) {
        label.innerHTML = `Выбран файл: <strong>${file.name}</strong> (${(file.size / 1024 / 1024).toFixed(2)} МБ)`;
      }
      this.showToast(`Файл «${file.name}» прикреплен к заявке`);
    },

    showToast(message) {
      let container = document.querySelector('.toast-container');
      if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
      }

      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
        <span>${message}</span>
      `;

      container.appendChild(toast);
      requestAnimationFrame(() => toast.classList.add('show'));

      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
      }, 3500);
    }
  };

  window.SpecCart = SpecCart;
  window.App = App;

  document.addEventListener('DOMContentLoaded', () => App.init());
})();
