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
        document.body.classList.add('no-scroll');
      }
    },

    closeAllModals() {
      document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('active'));
      document.body.classList.remove('no-scroll');
    },

    openSuccessModal(title, desc, actionHtml = '') {
      const modal = document.getElementById('modal-success');
      if (!modal) return;
      const h3 = modal.querySelector('h3');
      const p = modal.querySelector('p');
      if (h3 && title) h3.innerHTML = title;
      if (p && desc) p.innerHTML = desc;

      let actionContainer = modal.querySelector('.modal-success-action');
      if (!actionContainer) {
        actionContainer = document.createElement('div');
        actionContainer.className = 'modal-success-action';
        if (p) p.parentNode.insertBefore(actionContainer, p.nextSibling);
      }
      actionContainer.innerHTML = actionHtml;
      this.closeAllModals();
      this.openModal('modal-success');
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
        document.body.classList.add('no-scroll');
      }
    },

    closeDrawer() {
      const drawer = document.getElementById('spec-drawer');
      if (drawer) {
        drawer.classList.remove('active');
        document.body.classList.remove('no-scroll');
      }
    },

    openSpecDrawer() {
      this.openDrawer();
    },

    closeSpecDrawer() {
      this.closeDrawer();
    },

    initMobileMenu() {
      const burgerBtn = document.getElementById('burger-btn') || document.querySelector('.burger-btn');
      const mobileNav = document.getElementById('mobile-nav');
      if (!burgerBtn || !mobileNav) return;

      const backdrop = document.getElementById('mobile-nav-backdrop');
      const closeBtn = document.getElementById('mobile-nav-close');
      const catalogBtn = document.getElementById('mobile-nav-catalog-btn');
      const catalogBody = document.getElementById('mobile-nav-catalog-body');

      const openNav = () => {
        mobileNav.classList.add('active');
        mobileNav.setAttribute('aria-hidden', 'false');
        burgerBtn.classList.add('active');
        burgerBtn.setAttribute('aria-expanded', 'true');
        document.body.classList.add('no-scroll');
      };

      const closeNav = () => {
        mobileNav.classList.remove('active');
        mobileNav.setAttribute('aria-hidden', 'true');
        burgerBtn.classList.remove('active');
        burgerBtn.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('no-scroll');
      };

      burgerBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (mobileNav.classList.contains('active')) {
          closeNav();
        } else {
          openNav();
        }
      });

      if (closeBtn) closeBtn.addEventListener('click', closeNav);
      if (backdrop) backdrop.addEventListener('click', closeNav);

      // Аккордеон каталога в мобильном меню
      if (catalogBtn && catalogBody) {
        catalogBtn.addEventListener('click', (e) => {
          e.preventDefault();
          const isOpen = catalogBody.classList.toggle('open');
          catalogBtn.classList.toggle('open', isOpen);
          catalogBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
      }

      // Закрытие при клике на любую ссылку в меню
      mobileNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          closeNav();
        });
      });

      // Закрытие при нажатии Escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileNav.classList.contains('active')) {
          closeNav();
        }
      });
    },

    initForms() {
      const API_BASE = window.PIPEPRIME_API_BASE || (window.location.port === '3000' ? 'http://localhost:8000' : '');

      // Обработка форм заявок
      document.querySelectorAll('form[data-ajax-form]').forEach(form => {
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const submitBtn = form.querySelector('button[type="submit"]');
          const originalText = submitBtn ? submitBtn.innerHTML : '';
          
          if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = `
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite; display: inline-block; vertical-align: middle; margin-right: 6px;"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle><path d="M12 2a10 10 0 0 1 10 10"></path></svg>
              Отправка...
            `;
          }

          try {
            const fileInput = form.querySelector('#project-file-input') || form.querySelector('input[type="file"]');
            const hasFile = fileInput && fileInput.files && fileInput.files.length > 0;
            const formText = form.innerText.toLowerCase();
            const isATRForm = window.location.pathname.includes('engineering') || formText.includes('атр 2026') || formText.includes('документацию атр');

            // 1. Загрузка проектной сметы / чертежа с файлом
            if (hasFile) {
              const formData = new FormData();
              formData.append('file', fileInput.files[0]);
              const inputs = form.querySelectorAll('input:not([type="file"]), textarea, select');
              inputs.forEach(inp => {
                const ph = (inp.placeholder || '').toLowerCase();
                const val = inp.value.trim();
                if (inp.type === 'tel' || ph.includes('телефон')) formData.append('phone', val);
                else if (inp.type === 'email' || ph.includes('email')) formData.append('email', val);
                else if (ph.includes('имя') || ph.includes('контакт')) formData.append('name', val);
                else if (ph.includes('город') || ph.includes('регион')) formData.append('company', (formData.get('company') ? formData.get('company') + ', ' : '') + 'Регион: ' + val);
                else if (inp.tagName === 'TEXTAREA' || ph.includes('комментарий')) formData.append('comment', val);
                else if (ph.includes('организация') || ph.includes('компания')) formData.append('company', val);
              });
              if (!formData.get('name')) formData.append('name', 'Инженер/Заказчик');
              if (!formData.get('phone')) formData.append('phone', 'Не указан');

              const res = await fetch(`${API_BASE}/api/leads/estimate`, {
                method: 'POST',
                body: formData
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data.detail || 'Ошибка загрузки сметы');

              form.reset();
              const dropTitle = form.querySelector('.file-dropzone__title');
              if (dropTitle) dropTitle.textContent = 'Перетащите сюда файл проекта или нажмите для выбора';
              App.openSuccessModal(
                `Смета принята (№ ${data.order_number})`,
                `Файл <strong>${data.data?.filename || 'проекта'}</strong> передан дежурному инженеру PipePrime. Расчет спецификации будет подготовлен в течение 30 минут.`
              );
              App.showToast(`Смета зарегистрирована: № ${data.order_number}`);
              return;
            }

            // 2. Запрос Альбома технических решений (АТР 2026)
            if (isATRForm) {
              const formInputs = Array.from(form.querySelectorAll('input, textarea, select'));
              let name = 'Инженер';
              let phone = '';
              let email = '';
              let company = '';
              let inn = '7728168971';
              let purpose = 'Проектирование инженерных сетей';

              formInputs.forEach(inp => {
                const ph = (inp.placeholder || '').toLowerCase();
                const val = inp.value.trim();
                if (inp.type === 'tel' || ph.includes('телефон')) phone = val;
                else if (inp.type === 'email' || ph.includes('email')) email = val;
                else if (ph.includes('организация') || ph.includes('инн')) {
                  const digitsMatch = val.match(/\b\d{10,12}\b/);
                  if (digitsMatch) {
                    inn = digitsMatch[0];
                    company = val.replace(digitsMatch[0], '').replace(/[«»"]/g, '').trim() || 'Проектная организация';
                  } else {
                    company = val;
                  }
                } else if (ph.includes('контакт') || ph.includes('лицо') || ph.includes('имя')) name = val;
              });

              if (!inn || !/^\d{10,12}$/.test(inn)) {
                inn = '7728168971';
              }

              const res = await fetch(`${API_BASE}/api/atr/request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  name: name || 'Инженер-проектировщик',
                  phone: phone || '+7 (999) 000-00-00',
                  email: email || 'pto@company.ru',
                  company: company || 'Проектная организация',
                  inn: inn,
                  purpose: purpose
                })
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data.detail || 'Ошибка валидации заявки АТР');

              form.reset();
              const actionBtn = `
                <a href="${API_BASE}${data.download_url}" class="btn btn--primary" style="display: inline-flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 20px; width: 100%;" download>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  Скачать АТР 2026 (PDF, 14.8 МБ)
                </a>
              `;
              App.openSuccessModal(
                `Доступ к АТР 2026 открыт!`,
                `Заявка <strong>${data.order_number}</strong> авторизована для компании «${company || 'Партнер PipePrime'}». Временная ссылка для загрузки активна 24 часа.`,
                actionBtn
              );
              App.showToast(`Доступ к АТР 2026 подтвержден`);
              return;
            }

            // 3. Заказная спецификация из корзины (если в корзине есть позиции)
            if (SpecCart.items.length > 0 && (form.closest('#modal-quote') || form.closest('#spec-drawer'))) {
              const formInputs = Array.from(form.querySelectorAll('input, textarea, select'));
              let name = 'Заказчик';
              let phone = '';
              let email = '';
              let company = '';
              let inn = '';

              formInputs.forEach(inp => {
                const ph = (inp.placeholder || '').toLowerCase();
                const val = inp.value.trim();
                if (inp.type === 'tel' || ph.includes('телефон')) phone = val;
                else if (inp.type === 'email' || ph.includes('email')) email = val;
                else if (ph.includes('организация') || ph.includes('инн')) company = val;
                else if (ph.includes('контакт') || ph.includes('имя')) name = val;
              });

              const res = await fetch(`${API_BASE}/api/leads/specification`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  name: name || 'Заказчик',
                  phone: phone || '—',
                  email: email || null,
                  company: company || null,
                  inn: inn || null,
                  items: SpecCart.items,
                  total_weight_kg: SpecCart.getTotalWeight()
                })
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data.detail || 'Ошибка отправки спецификации');

              const count = SpecCart.getCount();
              SpecCart.clear();
              form.reset();
              App.openSuccessModal(
                `Спецификация принята (№ ${data.order_number})`,
                `В заявку включено <strong>${count} позиций</strong>. Дежурный инженер готовит оптовое коммерческое предложение с расчетом логистики.`
              );
              App.showToast(`Заказ ${data.order_number} оформлен`);
              return;
            }

            // 4. Общая форма обратного звонка / консультации
            const formInputs = Array.from(form.querySelectorAll('input, textarea, select'));
            let name = '';
            let phone = '';
            let topic = 'Консультация инженера';
            formInputs.forEach(inp => {
              const ph = (inp.placeholder || '').toLowerCase();
              const val = inp.value.trim();
              if (inp.type === 'tel' || ph.includes('телефон')) phone = val;
              else if (ph.includes('имя') || ph.includes('контакт')) name = val;
              else if (inp.tagName === 'SELECT') topic = val;
            });

            const res = await fetch(`${API_BASE}/api/leads/callback`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: name || 'Специалист',
                phone: phone || '+7 (999) 000-00-00',
                topic: topic
              })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || 'Ошибка отправки заявки');

            form.reset();
            App.openSuccessModal(
              `Заявка ${data.order_number} принята`,
              `Дежурный специалист PipePrime перезвонит вам по номеру <strong>${phone}</strong> в течение 10–15 минут.`
            );
            App.showToast(`Заявка ${data.order_number} успешно отправлена`);

          } catch (err) {
            console.error('Form submission error:', err);
            App.showToast(`Ошибка: ${err.message || 'Не удалось отправить форму'}`);
          } finally {
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.innerHTML = originalText;
            }
          }
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
