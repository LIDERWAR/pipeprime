/**
 * PipePrime - Interactive Engineering Solutions & BOM Engine
 * Рендеринг параметрических чертежей (SVG), интерактивный расчет ведомостей материалов (BOM),
 * синхронизация с корзиной спецификаций (SpecCart) и генерация технической документации.
 */

(function() {
  'use strict';

  const SolutionsEngine = {
    activeStates: {},

    init() {
      if (!window.SOLUTIONS_DATA) return;

      // Находим все контейнеры решений на странице
      const containers = document.querySelectorAll('[data-solution-id]');
      containers.forEach(el => {
        const id = el.getAttribute('data-solution-id');
        const sol = window.SOLUTIONS_DATA[id];
        if (sol) {
          this.activeStates[id] = {
            diameter: sol.defaultDiameter || 110,
            sdr: sol.defaultSdr || 7.4
          };
          this.renderSolution(el, sol);
        }
      });
    },

    setDiameter(solutionId, diam) {
      if (!this.activeStates[solutionId]) return;
      this.activeStates[solutionId].diameter = parseInt(diam);
      const container = document.querySelector(`[data-solution-id="${solutionId}"]`);
      const sol = window.SOLUTIONS_DATA[solutionId];
      if (container && sol) {
        this.renderSolution(container, sol);
      }
    },

    renderSolution(container, sol) {
      const state = this.activeStates[sol.id] || { diameter: sol.defaultDiameter, sdr: sol.defaultSdr };
      const bomItems = sol.getBOM(state.diameter, state.sdr);

      // Генерация SVG чертежа в зависимости от узла
      const svgGraphic = this.generateBlueprintSVG(sol.id, state.diameter);

      // Формирование кнопок диаметров
      const diamButtonsHtml = sol.supportedDiameters.map(d => `
        <button type="button" class="diam-btn ${d === state.diameter ? 'active' : ''}" 
                onclick="SolutionsEngine.setDiameter('${sol.id}', ${d})">
          d${d}
        </button>
      `).join('');

      // Формирование строк BOM таблицы
      const bomRowsHtml = bomItems.map(item => `
        <tr>
          <td class="bom-pos">${item.pos}</td>
          <td>
            <div class="bom-name">${item.name}</div>
            <div class="bom-spec">${item.spec}</div>
            <span class="bom-article">Арт: ${item.article}</span>
          </td>
          <td class="bom-qty">${item.qty} ${item.unit}</td>
          <td style="font-family: var(--font-mono); font-weight: 600; white-space: nowrap;">
            ${(item.priceEst * item.qty).toLocaleString('ru-RU')} ₽
          </td>
          <td style="text-align: right;">
            <button type="button" class="bom-action-btn" onclick="SolutionsEngine.addItemToSpec('${sol.id}', ${item.pos})">
              + В смету
            </button>
          </td>
        </tr>
      `).join('');

      // Расчет общей стоимости комплекта
      const totalKitPrice = bomItems.reduce((sum, item) => sum + (item.priceEst * item.qty), 0);

      // Сноски
      const notesHtml = sol.designNotes.map(n => `<li>${n}</li>`).join('');

      container.innerHTML = `
        <div class="solution-view">
          <!-- Шапка узла -->
          <div class="solution-header">
            <div>
              <div class="solution-code">${sol.code} // АТР 2026</div>
              <h2 class="solution-title">${sol.title}</h2>
              <div class="solution-meta">
                <div class="solution-meta-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                  <span>Документация: <strong>${sol.atrPages}</strong></span>
                </div>
                <div class="solution-meta-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
                  <span>Стандарт: <strong>${sol.normative}</strong></span>
                </div>
              </div>
            </div>
          </div>

          <!-- Инженерный визуальный блок (Реальное фото объекта + CAD Схема) -->
          <div class="solution-visuals-grid">
            <!-- 1. Профессиональное фото реального узла -->
            <div class="solution-photo-card">
              <div class="photo-overlay-badges">
                <span class="photo-field-badge">${sol.fieldBadge || 'ТИПОВОЙ ОБЪЕКТ'}</span>
                <span class="photo-standard-badge">${sol.atrPages || 'АТР 2026'}</span>
              </div>
              <div class="solution-photo-wrapper">
                <picture>
                  <source srcset="${sol.image || 'assets/images/sol_steel_flange.webp'}" type="image/webp">
                  <img src="${sol.imageJpg || sol.image || 'assets/images/sol_steel_flange.jpg'}" 
                       alt="${sol.imageAlt || sol.title}" 
                       class="solution-photo-img" 
                       loading="lazy">
                </picture>
              </div>
              <div class="solution-photo-caption">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                <span>${sol.photoCaption || sol.description}</span>
              </div>
            </div>

            <!-- 2. Чертежная область (Интерактивная CAD Схема АТР) -->
            <div class="blueprint-card">
              <div class="blueprint-badge">СХЕМА АТР 2026: М 1:10 // dn ${state.diameter} мм</div>
              <div class="blueprint-svg-container">
                ${svgGraphic}
              </div>
            </div>
          </div>

          <!-- Панель управления диаметром и быстрого заказа комплекта -->
          <div class="param-controls-bar">
            <div class="param-group">
              <span class="param-label">Рабочий диаметр магистрали (dn):</span>
              <div class="diam-selector-group">
                ${diamButtonsHtml}
              </div>
            </div>
            <div>
              <button type="button" class="bulk-add-kit-btn" onclick="SolutionsEngine.addFullKitToSpec('${sol.id}')">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M12 11v6"></path><path d="M9 14h6"></path></svg>
                <span>Добавить весь комплект в смету (${bomItems.length} поз. • ${totalKitPrice.toLocaleString('ru-RU')} ₽)</span>
              </button>
            </div>
          </div>

          <!-- Интерактивная спецификация материалов (BOM) -->
          <div class="bom-table-wrapper">
            <table class="bom-table">
              <thead>
                <tr>
                  <th style="width: 50px;">Поз.</th>
                  <th>Наименование комплектующего / Стандарт</th>
                  <th>Кол-во</th>
                  <th>Ориент. цена</th>
                  <th style="text-align: right;">Действие</th>
                </tr>
              </thead>
              <tbody>
                ${bomRowsHtml}
              </tbody>
            </table>
          </div>

          <!-- Инженерные сноски и регламент монтажа -->
          <div class="solution-footer-notes">
            <div class="solution-notes-title">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              <span>Технические требования монтажа по АТР 2026</span>
            </div>
            <ul class="solution-notes-list">
              ${notesHtml}
            </ul>
          </div>
        </div>
      `;
    },

    addItemToSpec(solutionId, pos) {
      const sol = window.SOLUTIONS_DATA[solutionId];
      if (!sol) return;
      const state = this.activeStates[solutionId] || { diameter: sol.defaultDiameter, sdr: sol.defaultSdr };
      const bomItems = sol.getBOM(state.diameter, state.sdr);
      const item = bomItems.find(i => i.pos === pos);
      if (!item) return;

      if (window.SpecCart) {
        window.SpecCart.addItem({
          id: item.article,
          name: item.name,
          article: item.article,
          diameter: state.diameter,
          sdr: state.sdr,
          form: item.unit,
          weightM: 0,
          price: item.priceEst
        }, item.qty);
      }
    },

    addFullKitToSpec(solutionId) {
      const sol = window.SOLUTIONS_DATA[solutionId];
      if (!sol) return;
      const state = this.activeStates[solutionId] || { diameter: sol.defaultDiameter, sdr: sol.defaultSdr };
      const bomItems = sol.getBOM(state.diameter, state.sdr);

      if (window.SpecCart) {
        bomItems.forEach(item => {
          window.SpecCart.addItem({
            id: item.article,
            name: item.name,
            article: item.article,
            diameter: state.diameter,
            sdr: state.sdr,
            form: item.unit,
            weightM: 0,
            price: item.priceEst
          }, item.qty);
        });

        if (window.App && typeof window.App.showToast === 'function') {
          window.App.showToast(`Комплект «${sol.shortTitle} d${state.diameter}» добавлен в спецификацию (${bomItems.length} поз.)`);
        }
        if (window.App && typeof window.App.openDrawer === 'function') {
          setTimeout(() => window.App.openDrawer(), 300);
        }
      }
    },

    // Векторные параметрические чертежи узлов (SVG)
    generateBlueprintSVG(solutionId, diam) {
      const d = diam || 110;

      switch(solutionId) {
        case "steel-flanged":
          return `
            <svg class="blueprint-svg" viewBox="0 0 800 240" fill="none" xmlns="http://www.w3.org/2000/svg">
              <!-- Осевая линия -->
              <line x1="20" y1="120" x2="780" y2="120" stroke="#f97316" stroke-dasharray="12 4 3 4" stroke-width="1.2" opacity="0.8"/>
              
              <!-- 1. Труба PE-RT и изоляция ППУ -->
              <rect x="30" y="85" width="220" height="70" fill="#1e293b" stroke="#64748b" stroke-width="1.5"/>
              <rect x="30" y="70" width="180" height="15" fill="#334155" stroke="#475569" stroke-width="1"/>
              <rect x="30" y="155" width="180" height="15" fill="#334155" stroke="#475569" stroke-width="1"/>
              <text x="70" y="125" fill="#94a3b8" font-family="monospace" font-size="12">Труба PE-RT d${d}</text>
              <text x="50" y="62" fill="#64748b" font-family="monospace" font-size="11">ППУ-изоляция</text>

              <!-- Концевой предохранитель (поз. 5) -->
              <path d="M 210,65 L 230,85 L 230,155 L 210,175 Z" fill="#475569" stroke="#94a3b8" stroke-width="1.2"/>
              <circle cx="220" cy="55" r="9" fill="#f97316"/>
              <text x="217" y="59" fill="#fff" font-family="monospace" font-weight="bold" font-size="11">5</text>
              <line x1="220" y1="65" x2="220" y2="80" stroke="#f97316" stroke-width="1.2"/>

              <!-- 2. Литая буртовая втулка под фланец (поз. 1) -->
              <path d="M 240,85 L 340,85 L 340,55 L 360,55 L 360,185 L 340,185 L 340,155 L 240,155 Z" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/>
              <circle cx="300" cy="35" r="9" fill="#f97316"/>
              <text x="297" y="39" fill="#fff" font-family="monospace" font-weight="bold" font-size="11">1</text>
              <line x1="300" y1="45" x2="300" y2="85" stroke="#f97316" stroke-width="1.2"/>

              <!-- 3. Свободный стальной фланец (поз. 2) -->
              <rect x="315" y="40" width="25" height="160" fill="#334155" stroke="#94a3b8" stroke-width="1.5"/>
              <circle cx="328" cy="20" r="9" fill="#f97316"/>
              <text x="325" y="24" fill="#fff" font-family="monospace" font-weight="bold" font-size="11">2</text>

              <!-- 4. Прокладка EPDM (поз. 3) -->
              <rect x="360" y="55" width="8" height="130" fill="#10b981" stroke="#059669" stroke-width="1"/>
              <circle cx="364" cy="215" r="9" fill="#f97316"/>
              <text x="361" y="219" fill="#fff" font-family="monospace" font-weight="bold" font-size="11">3</text>
              <line x1="364" y1="205" x2="364" y2="190" stroke="#f97316" stroke-width="1.2"/>

              <!-- 5. Ответный фланец стальной арматуры / задвижки -->
              <rect x="368" y="40" width="25" height="160" fill="#475569" stroke="#94a3b8" stroke-width="1.5"/>
              
              <!-- Болтовые стяжки (поз. 4) -->
              <rect x="305" y="45" width="98" height="12" fill="#cbd5e1" stroke="#0f172a" stroke-width="1"/>
              <rect x="305" y="183" width="98" height="12" fill="#cbd5e1" stroke="#0f172a" stroke-width="1"/>
              <circle cx="430" cy="40" r="9" fill="#f97316"/>
              <text x="427" y="44" fill="#fff" font-family="monospace" font-weight="bold" font-size="11">4</text>
              <line x1="420" y1="45" x2="400" y2="50" stroke="#f97316" stroke-width="1.2"/>

              <!-- Корпус стальной задвижки / арматуры -->
              <path d="M 393,75 L 560,75 L 600,105 L 600,135 L 560,165 L 393,165 Z" fill="#1e293b" stroke="#94a3b8" stroke-width="1.5"/>
              <rect x="460" y="20" width="30" height="55" fill="#334155" stroke="#94a3b8" stroke-width="1.2"/>
              <circle cx="475" cy="15" r="22" fill="none" stroke="#f97316" stroke-width="3"/>
              <text x="425" y="125" fill="#cbd5e1" font-family="monospace" font-size="12">Стальная задвижка</text>

              <!-- Размерные стрелки -->
              <line x1="240" y1="220" x2="360" y2="220" stroke="#64748b" stroke-width="1"/>
              <line x1="240" y1="215" x2="240" y2="225" stroke="#64748b" stroke-width="1"/>
              <line x1="360" y1="215" x2="360" y2="225" stroke="#64748b" stroke-width="1"/>
              <text x="270" y="235" fill="#64748b" font-family="monospace" font-size="10">Узел бурта L</text>
            </svg>
          `;

        case "steel-nsps":
          return `
            <svg class="blueprint-svg" viewBox="0 0 800 240" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="20" y1="120" x2="780" y2="120" stroke="#f97316" stroke-dasharray="12 4 3 4" stroke-width="1.2" opacity="0.8"/>
              
              <!-- Труба PE-RT -->
              <rect x="30" y="85" width="220" height="70" fill="#1e293b" stroke="#38bdf8" stroke-width="1.8"/>
              <text x="70" y="125" fill="#38bdf8" font-family="monospace" font-size="12">Труба PE-RT d${d}</text>

              <!-- Электросварная муфта (поз. 2) -->
              <rect x="180" y="75" width="140" height="90" fill="#0f172a" stroke="#f97316" stroke-width="1.8"/>
              <rect x="210" y="70" width="10" height="8" fill="#f97316"/>
              <rect x="280" y="70" width="10" height="8" fill="#f97316"/>
              <circle cx="250" cy="45" r="9" fill="#f97316"/>
              <text x="247" y="49" fill="#fff" font-family="monospace" font-weight="bold" font-size="11">2</text>
              <line x1="250" y1="55" x2="250" y2="75" stroke="#f97316" stroke-width="1.2"/>

              <!-- Переход НСПС (поз. 1) -->
              <!-- Полиэтиленовый хвостовик НСПС -->
              <rect x="250" y="85" width="130" height="70" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
              
              <!-- Зона механической опрессовки патрубка -->
              <rect x="380" y="80" width="60" height="80" fill="#475569" stroke="#e2e8f0" stroke-width="2"/>
              <circle cx="410" cy="45" r="9" fill="#f97316"/>
              <text x="407" y="49" fill="#fff" font-family="monospace" font-weight="bold" font-size="11">1</text>
              <line x1="410" y1="55" x2="410" y2="80" stroke="#f97316" stroke-width="1.2"/>
              <text x="365" y="185" fill="#e2e8f0" font-family="monospace" font-size="11">Муфта опрессовки</text>

              <!-- Стальной хвостовик НСПС -->
              <rect x="440" y="85" width="160" height="70" fill="#334155" stroke="#94a3b8" stroke-width="1.8"/>
              <text x="465" y="125" fill="#cbd5e1" font-family="monospace" font-size="12">Сталь 20</text>

              <!-- Термоусаживаемая манжета стыка ВУС (поз. 3) -->
              <rect x="560" y="78" width="80" height="84" fill="#0f172a" stroke="#10b981" stroke-width="1.8"/>
              <circle cx="600" cy="45" r="9" fill="#f97316"/>
              <text x="597" y="49" fill="#fff" font-family="monospace" font-weight="bold" font-size="11">3</text>
              <line x1="600" y1="55" x2="600" y2="78" stroke="#f97316" stroke-width="1.2"/>

              <!-- Стальная магистраль -->
              <rect x="620" y="85" width="150" height="70" fill="#1e293b" stroke="#64748b" stroke-width="1.5"/>
              <text x="640" y="125" fill="#94a3b8" font-family="monospace" font-size="12">Стальная сеть</text>
            </svg>
          `;

        case "fixed-anchor-monolith":
          return `
            <svg class="blueprint-svg" viewBox="0 0 800 240" fill="none" xmlns="http://www.w3.org/2000/svg">
              <!-- Линия грунта -->
              <line x1="20" y1="35" x2="780" y2="35" stroke="#854d0e" stroke-dasharray="6 4" stroke-width="1.5"/>
              <text x="30" y="28" fill="#a16207" font-family="monospace" font-size="11">Уровень естественной поверхности грунта</text>

              <!-- Песчаная подушка траншеи -->
              <rect x="50" y="180" width="700" height="45" fill="#451a03" opacity="0.3" stroke="#78350f" stroke-width="1"/>
              <text x="70" y="205" fill="#d97706" font-family="monospace" font-size="10">Песчаная подушка h=150 мм</text>

              <!-- Монолитный железобетонный блок B25 (поз. 4) -->
              <rect x="250" y="50" width="280" height="150" fill="#1e293b" stroke="#cbd5e1" stroke-width="2"/>
              <circle cx="510" cy="65" r="9" fill="#f97316"/>
              <text x="507" y="69" fill="#fff" font-family="monospace" font-weight="bold" font-size="11">4</text>
              
              <!-- Арматурная сетка (поз. 3) -->
              <rect x="265" y="65" width="250" height="120" stroke="#f59e0b" stroke-dasharray="8 8" stroke-width="1.2" fill="none"/>
              <circle cx="280" cy="60" r="9" fill="#f97316"/>
              <text x="277" y="64" fill="#fff" font-family="monospace" font-weight="bold" font-size="11">3</text>
              <line x1="280" y1="70" x2="280" y2="85" stroke="#f97316" stroke-width="1.2"/>

              <!-- Напорная труба PE-RT через блок -->
              <rect x="40" y="105" width="720" height="40" fill="#0f172a" stroke="#38bdf8" stroke-width="1.8"/>
              <line x1="20" y1="125" x2="780" y2="125" stroke="#f97316" stroke-dasharray="10 4" stroke-width="1"/>

              <!-- Стальной упорный фланец НОП (поз. 1) -->
              <rect x="380" y="75" width="20" height="100" fill="#f97316" stroke="#fff" stroke-width="1.5"/>
              <circle cx="390" cy="55" r="9" fill="#f97316"/>
              <text x="387" y="59" fill="#fff" font-family="monospace" font-weight="bold" font-size="11">1</text>
              <line x1="390" y1="65" x2="390" y2="75" stroke="#fff" stroke-width="1.2"/>
              <text x="340" y="195" fill="#f97316" font-family="monospace" font-size="11">Упорное кольцо НО</text>

              <!-- Комплекты КЗС на выходах из блока (поз. 2) -->
              <rect x="235" y="98" width="30" height="54" fill="#334155" stroke="#10b981" stroke-width="1.5"/>
              <rect x="515" y="98" width="30" height="54" fill="#334155" stroke="#10b981" stroke-width="1.5"/>
              <circle cx="225" cy="90" r="9" fill="#f97316"/>
              <text x="222" y="94" fill="#fff" font-family="monospace" font-weight="bold" font-size="11">2</text>

              <text x="80" y="130" fill="#38bdf8" font-family="monospace" font-size="12">Труба d${d}</text>
              <text x="640" y="130" fill="#38bdf8" font-family="monospace" font-size="12">Труба d${d}</text>
            </svg>
          `;

        case "aboveground-rack-oc":
          return `
            <svg class="blueprint-svg" viewBox="0 0 800 240" fill="none" xmlns="http://www.w3.org/2000/svg">
              <!-- Траверса эстакады -->
              <rect x="40" y="180" width="720" height="20" fill="#334155" stroke="#64748b" stroke-width="1.5"/>
              <text x="50" y="218" fill="#94a3b8" font-family="monospace" font-size="11">Опорная балка траверсы эстакады</text>

              <!-- Несущий стальной швеллер (поз. 2) -->
              <path d="M 60,178 L 740,178 L 740,145 L 725,145 L 725,168 L 75,168 L 75,145 L 60,145 Z" fill="#475569" stroke="#e2e8f0" stroke-width="1.8"/>
              <circle cx="120" cy="195" r="9" fill="#f97316"/>
              <text x="117" y="199" fill="#fff" font-family="monospace" font-weight="bold" font-size="11">2</text>
              <text x="280" y="162" fill="#cbd5e1" font-family="monospace" font-size="12">Несущий стальной швеллер (защита от провисания)</text>

              <!-- Труба в ППУ-ОЦ (поз. 1) -->
              <rect x="60" y="70" width="680" height="75" fill="#1e293b" stroke="#cbd5e1" stroke-width="2"/>
              <line x1="50" y1="107" x2="750" y2="107" stroke="#f97316" stroke-dasharray="10 4" stroke-width="1.2"/>
              <text x="180" y="102" fill="#e2e8f0" font-family="monospace" font-size="13">Труба PE-RT в спирально-навивной оцинкованной оболочке ППУ-ОЦ d${d}</text>
              <circle cx="150" cy="50" r="9" fill="#f97316"/>
              <text x="147" y="54" fill="#fff" font-family="monospace" font-weight="bold" font-size="11">1</text>

              <!-- U-образные хомуты крепления (поз. 3) -->
              <!-- Хомут 1 -->
              <path d="M 220,185 L 220,65 A 45,45 0 0,1 270,65 L 270,185" stroke="#f59e0b" stroke-width="3" fill="none"/>
              <rect x="215" y="180" width="10" height="8" fill="#cbd5e1"/>
              <rect x="265" y="180" width="10" height="8" fill="#cbd5e1"/>
              <circle cx="245" cy="35" r="9" fill="#f97316"/>
              <text x="242" y="39" fill="#fff" font-family="monospace" font-weight="bold" font-size="11">3</text>

              <!-- Хомут 2 -->
              <path d="M 520,185 L 520,65 A 45,45 0 0,1 570,65 L 570,185" stroke="#f59e0b" stroke-width="3" fill="none"/>
              <rect x="515" y="180" width="10" height="8" fill="#cbd5e1"/>
              <rect x="565" y="180" width="10" height="8" fill="#cbd5e1"/>

              <!-- Кожух оцинкованный стыковой КЗС-ОЦ (поз. 4) -->
              <rect x="360" y="65" width="70" height="85" fill="#334155" stroke="#10b981" stroke-width="1.5" stroke-dasharray="4 2"/>
              <circle cx="395" cy="45" r="9" fill="#f97316"/>
              <text x="392" y="49" fill="#fff" font-family="monospace" font-weight="bold" font-size="11">4</text>
              <text x="365" y="130" fill="#10b981" font-family="monospace" font-size="10">КЗС-ОЦ</text>
            </svg>
          `;

        case "casing-trenchless":
          return `
            <svg class="blueprint-svg" viewBox="0 0 800 240" fill="none" xmlns="http://www.w3.org/2000/svg">
              <!-- Дорожное полотно -->
              <rect x="40" y="15" width="720" height="25" fill="#334155" stroke="#475569" stroke-width="1"/>
              <line x1="40" y1="27" x2="760" y2="27" stroke="#fbbf24" stroke-dasharray="14 10" stroke-width="2"/>
              <text x="320" y="24" fill="#e2e8f0" font-family="monospace" font-size="11">Автомагистраль / Ж/Д полотно</text>

              <!-- Защитный футляр (поз. 1) -->
              <rect x="120" y="70" width="560" height="130" fill="#1e293b" stroke="#94a3b8" stroke-width="2.5"/>
              <text x="140" y="95" fill="#94a3b8" font-family="monospace" font-size="12">Стальной футляр Dнаруж</text>
              <circle cx="150" cy="55" r="9" fill="#f97316"/>
              <text x="147" y="59" fill="#fff" font-family="monospace" font-weight="bold" font-size="11">1</text>

              <!-- Рабочая труба PE-RT в ППУ -->
              <rect x="40" y="105" width="720" height="60" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/>
              <text x="50" y="140" fill="#38bdf8" font-family="monospace" font-size="12">PE-RT ППУ d${d}</text>

              <!-- Опорно-направляющие кольца ОНК (поз. 2) -->
              <rect x="230" y="75" width="20" height="120" fill="#f59e0b" stroke="#fff" stroke-width="1.2"/>
              <rect x="390" y="75" width="20" height="120" fill="#f59e0b" stroke="#fff" stroke-width="1.2"/>
              <rect x="550" y="75" width="20" height="120" fill="#f59e0b" stroke="#fff" stroke-width="1.2"/>
              <circle cx="400" cy="55" r="9" fill="#f97316"/>
              <text x="397" y="59" fill="#fff" font-family="monospace" font-weight="bold" font-size="11">2</text>
              <line x1="400" y1="65" x2="400" y2="75" stroke="#f97316" stroke-width="1.2"/>
              <text x="380" y="215" fill="#f59e0b" font-family="monospace" font-size="11">Кольца ОНК</text>

              <!-- Торцевые герметизирующие манжеты ТУМ (поз. 3) -->
              <path d="M 120,70 L 100,105 L 100,165 L 120,200 Z" fill="#10b981" stroke="#059669" stroke-width="1.5"/>
              <path d="M 680,70 L 700,105 L 700,165 L 680,200 Z" fill="#10b981" stroke="#059669" stroke-width="1.5"/>
              <circle cx="105" cy="55" r="9" fill="#f97316"/>
              <text x="102" y="59" fill="#fff" font-family="monospace" font-weight="bold" font-size="11">3</text>
              <text x="80" y="220" fill="#10b981" font-family="monospace" font-size="10">Манжета ТУМ</text>
            </svg>
          `;

        case "heat-chamber-node":
          return `
            <svg class="blueprint-svg" viewBox="0 0 800 240" fill="none" xmlns="http://www.w3.org/2000/svg">
              <!-- Стены ж/б камеры -->
              <rect x="140" y="20" width="520" height="200" fill="#0f172a" stroke="#cbd5e1" stroke-width="2.5"/>
              <text x="160" y="45" fill="#64748b" font-family="monospace" font-size="12">Контур железобетонной камеры (план)</text>

              <!-- Трубопровод подачи Т1 -->
              <line x1="40" y1="80" x2="760" y2="80" stroke="#ef4444" stroke-width="6"/>
              <text x="50" y="70" fill="#ef4444" font-family="monospace" font-size="11">Т1 Подача d${d}</text>
              
              <!-- Задвижка фланцевая Т1 (поз. 1, 2, 3) -->
              <rect x="360" y="60" width="80" height="40" fill="#1e293b" stroke="#f97316" stroke-width="2"/>
              <circle cx="400" cy="80" r="14" fill="#334155" stroke="#ef4444" stroke-width="2"/>
              <circle cx="400" cy="40" r="9" fill="#f97316"/>
              <text x="397" y="44" fill="#fff" font-family="monospace" font-weight="bold" font-size="11">1</text>

              <!-- Спускник Т1 (поз. 4, 5) -->
              <line x1="470" y1="80" x2="470" y2="105" stroke="#ef4444" stroke-width="3"/>
              <circle cx="470" cy="105" r="7" fill="#f59e0b"/>
              <circle cx="485" cy="115" r="9" fill="#f97316"/>
              <text x="482" y="119" fill="#fff" font-family="monospace" font-weight="bold" font-size="11">5</text>

              <!-- Трубопровод обратки Т2 -->
              <line x1="40" y1="160" x2="760" y2="160" stroke="#3b82f6" stroke-width="6"/>
              <text x="50" y="180" fill="#3b82f6" font-family="monospace" font-size="11">Т2 Обратка d${d}</text>

              <!-- Задвижка фланцевая Т2 -->
              <rect x="360" y="140" width="80" height="40" fill="#1e293b" stroke="#f97316" stroke-width="2"/>
              <circle cx="400" cy="160" r="14" fill="#334155" stroke="#3b82f6" stroke-width="2"/>

              <!-- Спускник Т2 -->
              <line x1="470" y1="160" x2="470" y2="135" stroke="#3b82f6" stroke-width="3"/>
              <circle cx="470" cy="135" r="7" fill="#f59e0b"/>

              <!-- Манжеты стенового ввода в стены камеры (поз. 6) -->
              <rect x="130" y="65" width="20" height="30" fill="#10b981"/>
              <rect x="650" y="65" width="20" height="30" fill="#10b981"/>
              <rect x="130" y="145" width="20" height="30" fill="#10b981"/>
              <rect x="650" y="145" width="20" height="30" fill="#10b981"/>
              <circle cx="120" cy="50" r="9" fill="#f97316"/>
              <text x="117" y="54" fill="#fff" font-family="monospace" font-weight="bold" font-size="11">6</text>
            </svg>
          `;

        case "snow-melting-field":
          return `
            <svg class="blueprint-svg" viewBox="0 0 800 240" fill="none" xmlns="http://www.w3.org/2000/svg">
              <!-- Граница футбольного поля 105х68 м -->
              <rect x="80" y="30" width="640" height="180" fill="#064e3b" stroke="#10b981" stroke-width="2"/>
              <line x1="400" y1="30" x2="400" y2="210" stroke="#10b981" stroke-width="1.5"/>
              <circle cx="400" cy="120" r="40" stroke="#10b981" stroke-width="1.5" fill="none"/>
              <text x="100" y="55" fill="#a7f3d0" font-family="monospace" font-size="12">Поле 105 х 68 м (Стандарт FIFA / РФС)</text>

              <!-- Подающий коллектор (поз. 2) -->
              <rect x="60" y="25" width="14" height="190" fill="#ef4444" stroke="#fff" stroke-width="1"/>
              <circle cx="50" cy="40" r="9" fill="#f97316"/>
              <text x="47" y="44" fill="#fff" font-family="monospace" font-weight="bold" font-size="11">2</text>
              <text x="40" y="125" fill="#ef4444" font-family="monospace" font-size="11" transform="rotate(-90 40 125)">Коллектор Т1</text>

              <!-- Обратный коллектор (поз. 3) -->
              <rect x="726" y="25" width="14" height="190" fill="#3b82f6" stroke="#fff" stroke-width="1"/>
              <circle cx="750" cy="40" r="9" fill="#f97316"/>
              <text x="747" y="44" fill="#fff" font-family="monospace" font-weight="bold" font-size="11">3</text>
              <text x="765" y="125" fill="#3b82f6" font-family="monospace" font-size="11" transform="rotate(90 765 125)">Коллектор Т2</text>

              <!-- Схема петель PE-RT 20х2.0 (поз. 1, 5) -->
              <path d="
                M 74,70 L 726,70 
                M 74,85 L 726,85 
                M 74,100 L 726,100 
                M 74,115 L 726,115 
                M 74,130 L 726,130 
                M 74,145 L 726,145 
                M 74,160 L 726,160 
                M 74,175 L 726,175
              " stroke="#fbbf24" stroke-width="1.8" stroke-dasharray="6 3"/>
              
              <circle cx="280" cy="115" r="9" fill="#f97316"/>
              <text x="277" y="119" fill="#fff" font-family="monospace" font-weight="bold" font-size="11">1</text>
              <text x="295" y="118" fill="#fbbf24" font-family="monospace" font-size="11">Трубы PE-RT 20х2.0 (шаг 150 мм)</text>

              <!-- Направляющие планки (поз. 5) -->
              <line x1="240" y1="60" x2="240" y2="185" stroke="#f59e0b" stroke-width="2"/>
              <line x1="560" y1="60" x2="560" y2="185" stroke="#f59e0b" stroke-width="2"/>
              <circle cx="560" cy="195" r="9" fill="#f97316"/>
              <text x="557" y="199" fill="#fff" font-family="monospace" font-weight="bold" font-size="11">5</text>
              <text x="490" y="215" fill="#f59e0b" font-family="monospace" font-size="10">Шины фиксации шага</text>
            </svg>
          `;

        default:
          return `<div style="padding: 40px; text-align: center; color: var(--text-muted);">Чертеж формируется</div>`;
      }
    }
  };

  window.SolutionsEngine = SolutionsEngine;

  document.addEventListener('DOMContentLoaded', () => {
    SolutionsEngine.init();
  });
})();
