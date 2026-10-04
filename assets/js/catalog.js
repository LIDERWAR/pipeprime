/**
 * PipePrime - Interactive Product Configurator Controller
 * Управление едиными интерактивными карточками продукции по стандарту АТР 2026.
 * Одна карточка с изображением на товарную группу с настраиваемыми параметрами
 * для заказа: диаметр (d25–630), SDR (7.4, 9, 11), тип фитинга, количество и живой расчет.
 */

(function() {
  'use strict';

  const CatalogController = {
    currentCategory: 'all',
    searchQuery: '',
    cardStates: {}, // Хранилище текущих выбранных параметров для каждой карточки

    init() {
      if (!window.PIPEBOUND_DATA) return;

      // Читаем параметр URL (например: catalog.html?category=insulated_ppu_pe)
      const urlParams = new URLSearchParams(window.location.search);
      const catParam = urlParams.get('category');
      if (catParam && this.getFamilies().some(f => f.id === catParam)) {
        this.currentCategory = catParam;
      }

      this.initDefaultStates();
      this.bindSearchAndReset();
      this.renderCategoryChips();
      this.renderConfigurators();
    },

    // Определение 10 ключевых продуктовых семейств
    getFamilies() {
      return [
        {
          id: "uninsulated_bars",
          name: "Трубы PE-RT тип II неизолированные (хлысты 12 м)",
          shortName: "Трубы неизолированные (хлысты)",
          badge: "ГОСТ 32415-2013 • Хлысты 12 м",
          image: "assets/images/prod_pert_pipe.jpg?v=16",
          desc: "Напорные трубы из термостойкого полиэтилена PE-RT тип II в прямых отрезках по 12 метров для систем отопления и ГВС. Рабочая температура до +95°С (аварийная пиковая +110°С). Соединение сваркой встык или электросварными муфтами.",
          type: "pipe_bars",
          diameters: [25, 32, 40, 50, 63, 75, 90, 110, 125, 140, 160, 180, 200, 225, 250, 280, 315, 355, 400, 450, 500, 560, 630],
          sdrs: [7.4, 9, 11],
          defaultD: 110,
          defaultSdr: 7.4,
          unitName: "хлыст (12 м)",
          lenPerUnit: 12,
          defaultQty: 10
        },
        {
          id: "uninsulated_coils",
          name: "Трубы PE-RT тип II неизолированные (в бухтах 100–500 м)",
          shortName: "Трубы неизолированные (бухты)",
          badge: "Бесшовный монтаж • Бухты",
          image: "assets/images/prod_pert_coil.jpg?v=16",
          desc: "Гибкие напорные трубы цельными строительными длинами до 500 метров для бестраншейной прокладки методом ГНБ и реконструкции изношенных сетей с минимальным числом стыков.",
          type: "pipe_coils",
          diameters: [25, 32, 40, 50, 63, 75, 90, 110],
          sdrs: [7.4, 9, 11],
          coilLengths: [100, 200, 300, 500],
          defaultD: 63,
          defaultSdr: 7.4,
          defaultCoilLen: 200,
          unitName: "бухта",
          defaultQty: 2
        },
        {
          id: "insulated_ppu_pe",
          name: "Трубы PE-RT тип II предизолированные в ППУ/ПЭ (подземные)",
          shortName: "Трубы в ППУ/ПЭ (подземные)",
          badge: "ГОСТ Р 56730-2015 • ОДК",
          image: "assets/images/prod_ppu_pe.jpg?v=16",
          desc: "Трубы в жестком пенополиуретане с защитной полиэтиленовой оболочкой для бесканальной укладки прямо в грунт. Оснащены встроенными медными проводниками оперативного дистанционного контроля (ОДК).",
          type: "pipe_ppu_pe",
          diameters: [25, 32, 40, 50, 63, 75, 90, 110, 125, 140, 160, 180, 200, 225, 250, 280, 315, 355, 400, 450, 500, 560, 630],
          sdrs: [7.4, 9, 11],
          defaultD: 110,
          defaultSdr: 7.4,
          unitName: "хлыст (12 м)",
          lenPerUnit: 12,
          defaultQty: 10
        },
        {
          id: "insulated_ppu_oc",
          name: "Трубы PE-RT тип II предизолированные в ППУ/ОЦ (надземные)",
          shortName: "Трубы в ППУ/ОЦ (надземные)",
          badge: "Оцинкованная сталь • Эстакады",
          image: "assets/images/prod_ppu_oc.jpg?v=16",
          desc: "Трубы с ППУ изоляцией в защитной спирально-навивной оцинкованной стальной оболочке для надземной прокладки по эстакадам, мостам и в проходных каналах.",
          type: "pipe_ppu_oc",
          diameters: [25, 32, 40, 50, 63, 75, 90, 110, 125, 140, 160, 180, 200, 225, 250, 280, 315, 355, 400, 450, 500, 560, 630],
          sdrs: [7.4, 9, 11],
          defaultD: 110,
          defaultSdr: 7.4,
          unitName: "хлыст (12 м)",
          lenPerUnit: 12,
          defaultQty: 10
        },
        {
          id: "insulated_flexible",
          name: "Трубы PE-RT тип II гибкие в гофрированной оболочке ППУ/ПЭ",
          shortName: "Гибкие трубы в гофре (бухты)",
          badge: "Бухты 100–300 м • Без стыков",
          image: "assets/images/prod_flexible_coil.jpg?v=16",
          desc: "Гибкие предизолированные трубопроводы в гофрированном полиэтиленовом кожухе высокой стойкости. Огибают любые подземные коммуникации в плотной застройке без стыков и компенсаторов.",
          type: "pipe_flexible",
          variants: [
            { d: 25, casing: 90, name: "25 / 90 мм" },
            { d: 32, casing: 90, name: "32 / 90 мм" },
            { d: 40, casing: 110, name: "40 / 110 мм" },
            { d: 50, casing: 110, name: "50 / 110 мм" },
            { d: 63, casing: 125, name: "63 / 125 мм" },
            { d: 75, casing: 140, name: "75 / 140 мм" },
            { d: 90, casing: 160, name: "90 / 160 мм" },
            { d: 110, casing: 180, name: "110 / 180 мм" }
          ],
          sdrs: [7.4, 9, 11],
          coilLengths: [100, 150, 200, 300],
          defaultVariantIdx: 3, // 50/110
          defaultSdr: 7.4,
          defaultCoilLen: 150,
          unitName: "бухта",
          defaultQty: 1
        },
        {
          id: "fittings_electro",
          name: "Фитинги PE-RT тип II электросварные с закладными нагревателями",
          shortName: "Фитинги электросварные",
          badge: "SDR 7.4 / SDR 11 • PN16",
          image: "assets/images/prod_fitting_electro.jpg?v=16",
          desc: "Фасонные детали с встроенной спиралью для сварки муфтовыми сварочными аппаратами по штрих-коду. 100% герметичность стыка и высокая скорость монтажа в траншее.",
          type: "fittings_electro",
          subTypes: [
            { id: "coupling", name: "Муфта электросварная", prefix: "PP-EF-COUPLING" },
            { id: "elbow90", name: "Отвод 90° электросварной", prefix: "PP-EF-ELBOW90" },
            { id: "elbow45", name: "Отвод 45° электросварной", prefix: "PP-EF-ELBOW45" },
            { id: "tee", name: "Тройник равнопроходной электросварной", prefix: "PP-EF-TEE" },
            { id: "reducer", name: "Переход концентрический электросварной", prefix: "PP-EF-RED" },
            { id: "saddle", name: "Седелка с ответвлением", prefix: "PP-EF-SADDLE" }
          ],
          diameters: [25, 32, 40, 50, 63, 75, 90, 110, 125, 140, 160, 180, 200, 225, 250, 280, 315, 355, 400],
          sdrs: [7.4, 11],
          defaultSubType: "coupling",
          defaultD: 110,
          defaultSdr: 7.4,
          unitName: "шт.",
          defaultQty: 4
        },
        {
          id: "fittings_spigot",
          name: "Фитинги PE-RT тип II литые (спигот) под сварку встык",
          shortName: "Литые фитинги (спигот)",
          badge: "Сварка встык • d32–630 мм",
          image: "assets/images/prod_fitting_spigot.jpg?v=16",
          desc: "Литые фасонные изделия с удлиненным хвостовиком под зажим сварочного станка встык или под электросварные муфты. Отводы, тройники, концентрические переходы, втулки под фланец.",
          type: "fittings_spigot",
          subTypes: [
            { id: "elbow90", name: "Отвод 90° литой удлиненный", prefix: "PP-SP-ELBOW90" },
            { id: "elbow45", name: "Отвод 45° литой удлиненный", prefix: "PP-SP-ELBOW45" },
            { id: "tee", name: "Тройник равнопроходной литой", prefix: "PP-SP-TEE" },
            { id: "reducer", name: "Переход концентрический литой", prefix: "PP-SP-RED" },
            { id: "flange_stub", name: "Втулка под фланец литая удлиненная", prefix: "PP-SP-STUB" }
          ],
          diameters: [32, 40, 50, 63, 75, 90, 110, 125, 140, 160, 180, 200, 225, 250, 280, 315, 355, 400, 450, 500, 560, 630],
          sdrs: [7.4, 9, 11],
          defaultSubType: "elbow90",
          defaultD: 110,
          defaultSdr: 11,
          unitName: "шт.",
          defaultQty: 2
        },
        {
          id: "fittings_rastrub",
          name: "Фитинги PE-RT тип II для раструбной сварки и узлов ИТП",
          shortName: "Раструбные фитинги и ИТП",
          badge: "Раструб и латунь • ИТП / ЦТП",
          image: "assets/images/prod_fitting_rastrub.jpg?v=16",
          desc: "Фасонные детали для раструбной сварки ручным нагревателем и комбинированные переходы на латунную резьбу для обвязки тепловых пунктов, узлов учета и котельных.",
          type: "fittings_rastrub",
          subTypes: [
            { id: "coupling", name: "Муфта раструбная", prefix: "PP-RASTR-COUP" },
            { id: "elbow90", name: "Угольник 90° раструбный", prefix: "PP-RASTR-ELBOW" },
            { id: "tee", name: "Тройник раструбный", prefix: "PP-RASTR-TEE" },
            { id: "female", name: "Муфта комбинированная с латунной ВР", prefix: "PP-RASTR-FEM" },
            { id: "male", name: "Муфта комбинированная с латунной НР", prefix: "PP-RASTR-MALE" },
            { id: "american", name: "Разъемное соединение «американка» с латунью", prefix: "PP-RASTR-AMER" }
          ],
          diameters: [20, 25, 32, 40, 50, 63],
          defaultSubType: "female",
          defaultD: 32,
          unitName: "шт.",
          defaultQty: 5
        },
        {
          id: "fittings_ppu",
          name: "Фасонные изделия PE-RT тип II в ППУ изоляции (ППУ/ПЭ и ППУ/ОЦ)",
          shortName: "Фасонные изделия в ППУ",
          badge: "Заводская изоляция ППУ • ОДК",
          image: "assets/images/prod_valve_ppu.jpg?v=16",
          desc: "Отводы 90° и 45°, тройники, шаровые краны со штоком, тройники с краном воздушника, концевые элементы с выводом кабеля ОДК и неподвижные опоры (НОП) с непрерывным заводским слоем ППУ.",
          type: "fittings_ppu",
          subTypes: [
            { id: "elbow90_ppu", name: "Отвод 90° в ППУ изоляции", prefix: "PP-PPU-ELBOW90" },
            { id: "elbow45_ppu", name: "Отвод 45° в ППУ изоляции", prefix: "PP-PPU-ELBOW45" },
            { id: "tee_ppu", name: "Тройник равнопроходной в ППУ", prefix: "PP-PPU-TEE" },
            { id: "air_vent", name: "Тройник с шаровым краном воздушника в ППУ", prefix: "PP-PPU-VENT" },
            { id: "end_elem", name: "Концевой элемент с кабелем ОДК в ППУ", prefix: "PP-PPU-END" },
            { id: "nop", name: "Неподвижная опора (НОП) в ППУ", prefix: "PP-PPU-NOP" }
          ],
          casingTypes: [
            { id: "pe", name: "ППУ/ПЭ (подземная прокладка)" },
            { id: "oc", name: "ППУ/ОЦ (надземная прокладка)" }
          ],
          diameters: [25, 32, 40, 50, 63, 75, 90, 110, 125, 140, 160, 200, 225, 250, 315, 400, 500, 630],
          defaultSubType: "elbow90_ppu",
          defaultCasingType: "pe",
          defaultD: 110,
          unitName: "шт.",
          defaultQty: 1
        },
        {
          id: "accessories_kzs",
          name: "Комплектующие для теплосетей (КЗС, НСПС, фланцы)",
          shortName: "Комплектующие и КЗС",
          badge: "100% герметизация стыков",
          image: "assets/images/prod_kzs_joint.jpg?v=16",
          desc: "Комплекты заделки стыков (КЗС) под оболочки D90–800 мм с радиационно-сшитой термоусадочной муфтой и компонентами ППУ А+Б, соединения ПЭ/Сталь (НСПС), фланцы в ПП.",
          type: "accessories_kzs",
          subTypes: [
            { id: "kzs", name: "Комплект заделки стыка (КЗС) с термомуфтой и пеной А+Б", prefix: "PP-KZS" },
            { id: "nsps", name: "Неразъемное соединение ПЭ/Сталь (НСПС)", prefix: "PP-NSPS" },
            { id: "flange_pp", name: "Фланец стальной расточенный в ПП оболочке PN16", prefix: "PP-FL-PP" },
            { id: "cuff", name: "Манжета стенового ввода армированная", prefix: "PP-CUFF" }
          ],
          casings: [90, 110, 125, 140, 160, 180, 200, 225, 250, 280, 315, 355, 400, 450, 500, 560, 630, 710, 800],
          defaultSubType: "kzs",
          defaultCasing: 180,
          unitName: "компл.",
          defaultQty: 10
        }
      ];
    },

    initDefaultStates() {
      this.getFamilies().forEach(fam => {
        this.cardStates[fam.id] = {
          diameter: fam.defaultD || 110,
          sdr: fam.defaultSdr || 7.4,
          subType: fam.defaultSubType || null,
          casingType: fam.defaultCasingType || null,
          casing: fam.defaultCasing || null,
          coilLength: fam.defaultCoilLen || null,
          variantIdx: fam.defaultVariantIdx !== undefined ? fam.defaultVariantIdx : null,
          qty: fam.defaultQty || 1,
          showTable: false
        };
      });
    },

    bindSearchAndReset() {
      const searchInput = document.getElementById('catalog-search-input');
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          this.searchQuery = e.target.value.toLowerCase().trim();
          this.renderConfigurators();
        });
      }

      const resetBtn = document.getElementById('catalog-reset-filters');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          this.currentCategory = 'all';
          this.searchQuery = '';
          if (searchInput) searchInput.value = '';
          this.updateChipUI();
          this.renderConfigurators();
        });
      }
    },

    renderCategoryChips() {
      const container = document.getElementById('filter-categories');
      if (!container) return;

      const families = this.getFamilies();
      let html = `
        <button class="filter-chip ${this.currentCategory === 'all' ? 'active' : ''}" data-cat="all">
          Все разделы (${families.length})
        </button>
      `;

      families.forEach(f => {
        html += `
          <button class="filter-chip ${this.currentCategory === f.id ? 'active' : ''}" data-cat="${f.id}">
            ${f.shortName}
          </button>
        `;
      });

      container.innerHTML = html;

      container.querySelectorAll('.filter-chip').forEach(btn => {
        btn.addEventListener('click', () => {
          this.currentCategory = btn.getAttribute('data-cat');
          this.updateChipUI();
          this.renderConfigurators();
        });
      });
    },

    updateChipUI() {
      document.querySelectorAll('#filter-categories .filter-chip').forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-cat') === this.currentCategory);
      });
    },

    // Расчет живых инженерных данных
    calculateSpecs(famId) {
      const fam = this.getFamilies().find(f => f.id === famId);
      const state = this.cardStates[famId];
      if (!fam || !state) return null;

      const specsData = window.PIPEBOUND_DATA ? window.PIPEBOUND_DATA.pipeSpecs : [];
      let diameter = state.diameter;
      let sdr = state.sdr;
      let casing = 0;
      let wall = 0;
      let innerD = 0;
      let weightM = 0;
      let pressure = "1.0 МПа (10 бар)";
      let article = "";
      let titleName = "";
      let summaryText = "";

      if (fam.type === "pipe_bars" || fam.type === "pipe_ppu_pe" || fam.type === "pipe_ppu_oc") {
        const spec = specsData.find(s => s.d === diameter) || specsData[0];
        const sdrKey = `sdr${sdr.toString().replace('.', '')}`;
        const sdrVal = spec[sdrKey] || spec.sdr74;

        wall = sdrVal.wall;
        innerD = sdrVal.innerD;
        weightM = sdrVal.weight;
        casing = spec.ppuCasing;

        if (fam.type === "pipe_bars") {
          article = `PP-BAR-${diameter}-SDR${sdr}`;
          titleName = `Труба PE-RT тип II d${diameter} мм SDR ${sdr} (хлыст 12 м)`;
          summaryText = `${state.qty} хлыстов = ${state.qty * 12} метров (общая масса ~${(weightM * 12 * state.qty).toFixed(1)} кг)`;
        } else if (fam.type === "pipe_ppu_pe") {
          weightM = +(weightM + spec.ppuWeight).toFixed(2);
          article = `PP-PPU-PE-${diameter}-${casing}-SDR${sdr}`;
          titleName = `Труба PE-RT тип II ППУ/ПЭ d${diameter}/${casing} мм SDR ${sdr} (хлыст 12 м)`;
          summaryText = `${state.qty} хлыстов = ${state.qty * 12} метров (общая масса ~${(weightM * 12 * state.qty).toFixed(1)} кг)`;
        } else if (fam.type === "pipe_ppu_oc") {
          weightM = +(weightM + spec.ppuWeight * 1.35).toFixed(2);
          article = `PP-PPU-OC-${diameter}-${casing}-SDR${sdr}`;
          titleName = `Труба PE-RT тип II ППУ/ОЦ d${diameter}/${casing} мм SDR ${sdr} (хлыст 12 м)`;
          summaryText = `${state.qty} хлыстов = ${state.qty * 12} метров (общая масса ~${(weightM * 12 * state.qty).toFixed(1)} кг)`;
        }

        pressure = sdr === 7.4 ? "1.0 МПа (10 бар)" : sdr === 9 ? "0.8 МПа (8 бар)" : "0.6 МПа (6 бар)";

      } else if (fam.type === "pipe_coils") {
        const spec = specsData.find(s => s.d === diameter) || specsData[0];
        const sdrKey = `sdr${sdr.toString().replace('.', '')}`;
        const sdrVal = spec[sdrKey] || spec.sdr74;
        wall = sdrVal.wall;
        innerD = sdrVal.innerD;
        weightM = sdrVal.weight;
        const cLen = state.coilLength || 200;
        article = `PP-COIL-${diameter}-SDR${sdr}-${cLen}M`;
        titleName = `Труба PE-RT тип II d${diameter} мм SDR ${sdr} (бухта ${cLen} м)`;
        summaryText = `${state.qty} бухт = ${state.qty * cLen} метров (общая масса ~${(weightM * cLen * state.qty).toFixed(1)} кг)`;
        pressure = sdr === 7.4 ? "1.0 МПа (10 бар)" : sdr === 9 ? "0.8 МПа (8 бар)" : "0.6 МПа (6 бар)";

      } else if (fam.type === "pipe_flexible") {
        const variant = fam.variants[state.variantIdx !== null ? state.variantIdx : 3];
        diameter = variant.d;
        casing = variant.casing;
        const spec = specsData.find(s => s.d === diameter) || specsData[0];
        const sdrKey = `sdr${sdr.toString().replace('.', '')}`;
        const sdrVal = spec[sdrKey] || spec.sdr74;
        wall = sdrVal.wall;
        innerD = sdrVal.innerD;
        weightM = +(sdrVal.weight + spec.ppuWeight * 0.85).toFixed(2);
        const cLen = state.coilLength || 150;
        article = `PP-CRIMP-${diameter}-${casing}-SDR${sdr}`;
        titleName = `Гибкая труба PE-RT в гофре ППУ/ПЭ d${diameter}/${casing} мм (бухта ${cLen} м)`;
        summaryText = `${state.qty} бухт = ${state.qty * cLen} метров (общая масса ~${(weightM * cLen * state.qty).toFixed(1)} кг)`;
        pressure = sdr === 7.4 ? "1.0 МПа (10 бар)" : sdr === 9 ? "0.8 МПа (8 бар)" : "0.6 МПа (6 бар)";

      } else if (fam.type === "fittings_electro") {
        const sub = fam.subTypes.find(s => s.id === state.subType) || fam.subTypes[0];
        article = `${sub.prefix}-${diameter}-SDR${sdr}`;
        titleName = `${sub.name} PE-RT тип II d${diameter} мм SDR ${sdr}`;
        summaryText = `${state.qty} шт. с закладными нагревателями под штрих-код`;
        pressure = sdr === 7.4 ? "1.6 МПа (16 бар / PN16)" : "1.0 МПа (10 бар / PN10)";

      } else if (fam.type === "fittings_spigot") {
        const sub = fam.subTypes.find(s => s.id === state.subType) || fam.subTypes[0];
        article = `${sub.prefix}-${diameter}-SDR${sdr}`;
        titleName = `${sub.name} PE-RT тип II d${diameter} мм SDR ${sdr}`;
        summaryText = `${state.qty} шт. под сварку нагретым инструментом встык`;
        pressure = sdr === 7.4 ? "1.0 МПа (10 бар)" : sdr === 9 ? "0.8 МПа (8 бар)" : "0.6 МПа (6 бар)";

      } else if (fam.type === "fittings_rastrub") {
        const sub = fam.subTypes.find(s => s.id === state.subType) || fam.subTypes[0];
        article = `${sub.prefix}-${diameter}`;
        titleName = `${sub.name} PE-RT тип II d${diameter} мм`;
        summaryText = `${state.qty} шт. для обвязки узлов ИТП и котельных`;
        pressure = "1.6 МПа (PN16)";

      } else if (fam.type === "fittings_ppu") {
        const sub = fam.subTypes.find(s => s.id === state.subType) || fam.subTypes[0];
        const spec = specsData.find(s => s.d === diameter) || specsData[0];
        casing = spec.ppuCasing;
        const cType = state.casingType === 'oc' ? 'ОЦ' : 'ПЭ';
        article = `${sub.prefix}-${diameter}-${casing}-${cType}`;
        titleName = `${sub.name} ППУ/${cType} d${diameter}/${casing} мм`;
        summaryText = `${state.qty} шт. с заводской изоляцией ППУ и кабелем ОДК`;
        pressure = "1.0 МПа (10 бар)";

      } else if (fam.type === "accessories_kzs") {
        const sub = fam.subTypes.find(s => s.id === state.subType) || fam.subTypes[0];
        casing = state.casing || 180;
        article = `${sub.prefix}-D${casing}`;
        titleName = `${sub.name} под оболочку D${casing} мм`;
        summaryText = `${state.qty} комплектов для заделки и восстановления изоляции стыков`;
        pressure = "Герметичность до 0.5 МПа";
      }

      return {
        article,
        titleName,
        diameter,
        casing,
        sdr,
        wall,
        innerD,
        weightM,
        pressure,
        summaryText,
        qty: state.qty,
        unitName: fam.unitName,
        standard: fam.badge
      };
    },

    renderConfigurators() {
      const container = document.getElementById('catalog-configurators-container');
      const countEl = document.getElementById('catalog-results-count');
      if (!container) return;

      const families = this.getFamilies().filter(fam => {
        // Фильтр по выбранной категории
        if (this.currentCategory !== 'all' && fam.id !== this.currentCategory) {
          return false;
        }
        // Фильтр по поисковому запросу
        if (this.searchQuery) {
          const matchText = `${fam.name} ${fam.desc} ${fam.badge} ${fam.id} d${this.cardStates[fam.id]?.diameter}`.toLowerCase();
          if (!matchText.includes(this.searchQuery)) {
            return false;
          }
        }
        return true;
      });

      if (countEl) {
        countEl.textContent = `Отображение: ${families.length} из 10 товарных групп продукции`;
      }

      if (families.length === 0) {
        container.innerHTML = `
          <div class="catalog-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <h3>По вашему запросу ничего не найдено</h3>
            <p>Попробуйте сбросить поисковый запрос или выбрать другой раздел каталога.</p>
            <button class="btn btn--outline btn--sm" onclick="CatalogController.resetFilters()">Показать все разделы</button>
          </div>
        `;
        return;
      }

      container.innerHTML = families.map(fam => this.renderSingleConfigCard(fam)).join('');
      this.bindCardInteractivity();
    },

    renderSingleConfigCard(fam) {
      const state = this.cardStates[fam.id];
      const specs = this.calculateSpecs(fam.id);

      return `
        <div class="config-card" id="config-card-${fam.id}" data-family-id="${fam.id}">
          <div class="config-card__header">
            <div class="config-card__header-info">
              <div class="config-card__kicker">
                <span class="status-indicator-dot"></span>
                <span>Официальный стандарт АТР 2026</span>
              </div>
              <h3 class="config-card__title">${fam.name}</h3>
              <p class="config-card__desc">${fam.desc}</p>
            </div>
            <span class="config-card__badge-tag">${fam.badge}</span>
          </div>

          <div class="config-card__body">
            <!-- Левая колонка: Единое изображение с бейджем -->
            <div class="config-card__visual-col">
              <div class="config-card__image-box">
                <img src="${fam.image}" alt="${fam.name}" loading="lazy">
              </div>
              <div class="config-card__current-pill">
                <div class="config-card__current-title">Текущая конфигурация:</div>
                <div class="config-card__current-val" id="pill-val-${fam.id}">
                  d${specs.diameter} мм ${specs.casing ? `/ D${specs.casing}` : ''} • SDR ${specs.sdr || '—'}
                </div>
              </div>
              <div class="config-card__stock-status">
                <span class="status-indicator-dot"></span>
                <span>В наличии на складе (отгрузка за 24ч)</span>
              </div>
            </div>

            <!-- Правая колонка: Интерактивные селекторы и сводная спецификация -->
            <div class="config-card__controls-col">
              ${this.renderControlElements(fam, state)}

              <!-- Живой расчет объема и веса -->
              <div class="config-qty-row">
                <div class="config-stepper">
                  <button type="button" class="stepper-btn" data-action="dec" data-target="${fam.id}">–</button>
                  <input type="number" class="stepper-input" id="qty-input-${fam.id}" min="1" value="${state.qty}">
                  <button type="button" class="stepper-btn" data-action="inc" data-target="${fam.id}">+</button>
                </div>
                <div class="config-qty-summary" id="qty-summary-${fam.id}">
                  <strong>${specs.summaryText}</strong>
                </div>
              </div>

              <!-- Сетка живых инженерных параметров -->
              <div class="config-live-specs" id="specs-grid-${fam.id}">
                ${this.renderLiveSpecsGrid(specs)}
              </div>

              <!-- Кнопки действий -->
              <div class="config-actions-row">
                <button type="button" class="btn btn--primary btn-add-spec" onclick="CatalogController.addToCart('${fam.id}')">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                  Добавить в спецификацию
                </button>
                <button type="button" class="btn btn--outline" onclick="CatalogController.openQuoteForCard('${fam.id}')">
                  Запросить КП
                </button>
                <button type="button" class="btn-toggle-table" onclick="CatalogController.toggleTable('${fam.id}')">
                  <span>Сводная таблица типоразмеров</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Раскрывающийся блок таблицы всех типоразмеров -->
          <div class="config-table-collapse ${state.showTable ? 'open' : ''}" id="table-collapse-${fam.id}">
            ${this.renderEngineeringTable(fam, state)}
          </div>
        </div>
      `;
    },

    renderControlElements(fam, state) {
      let html = '';

      // 1. Выбор типа изделия (для фитингов и комплектующих)
      if (fam.subTypes) {
        html += `
          <div class="config-control-group">
            <label class="config-control-label">Тип фасонного изделия:</label>
            <select class="config-select field-subtype" data-target="${fam.id}">
              ${fam.subTypes.map(st => `
                <option value="${st.id}" ${state.subType === st.id ? 'selected' : ''}>${st.name}</option>
              `).join('')}
            </select>
          </div>
        `;
      }

      // 2. Исполнение оболочки для фасонины ППУ
      if (fam.casingTypes) {
        html += `
          <div class="config-control-group">
            <label class="config-control-label">Тип защитной оболочки:</label>
            <select class="config-select field-casingtype" data-target="${fam.id}">
              ${fam.casingTypes.map(ct => `
                <option value="${ct.id}" ${state.casingType === ct.id ? 'selected' : ''}>${ct.name}</option>
              `).join('')}
            </select>
          </div>
        `;
      }

      // 3. Выбор диаметра (d) или типоразмера
      if (fam.variants) {
        html += `
          <div class="config-control-group">
            <label class="config-control-label">Типоразмер гибкой трубы (d рабочая / D гофра):</label>
            <select class="config-select field-variant" data-target="${fam.id}">
              ${fam.variants.map((v, idx) => `
                <option value="${idx}" ${state.variantIdx === idx ? 'selected' : ''}>${v.name}</option>
              `).join('')}
            </select>
          </div>
        `;
      } else if (fam.diameters) {
        html += `
          <div class="config-control-group">
            <label class="config-control-label">
              Наружный диаметр рабочей трубы (d):
              <span>Диапазон: d${fam.diameters[0]}–d${fam.diameters[fam.diameters.length - 1]} мм</span>
            </label>
            <select class="config-select field-diameter" data-target="${fam.id}">
              ${fam.diameters.map(d => `
                <option value="${d}" ${state.diameter === d ? 'selected' : ''}>d${d} мм</option>
              `).join('')}
            </select>
          </div>
        `;
      } else if (fam.casings) {
        html += `
          <div class="config-control-group">
            <label class="config-control-label">Диаметр защитной оболочки (D):</label>
            <select class="config-select field-casing" data-target="${fam.id}">
              ${fam.casings.map(c => `
                <option value="${c}" ${state.casing === c ? 'selected' : ''}>D${c} мм</option>
              `).join('')}
            </select>
          </div>
        `;
      }

      // 4. Выбор SDR / Рабочего давления
      if (fam.sdrs) {
        html += `
          <div class="config-control-group">
            <label class="config-control-label">Размерное отношение SDR / Номинальное давление:</label>
            <div class="config-sdr-buttons">
              ${fam.sdrs.map(s => {
                const press = s === 7.4 ? "1.0 МПа (10 бар)" : s === 9 ? "0.8 МПа (8 бар)" : "0.6 МПа (6 бар)";
                const isAct = state.sdr === s;
                return `
                  <button type="button" class="sdr-btn ${isAct ? 'active' : ''}" data-target="${fam.id}" data-sdr="${s}">
                    <span>SDR ${s}</span>
                    <small>${press}</small>
                  </button>
                `;
              }).join('')}
            </div>
          </div>
        `;
      }

      // 5. Длина намотки бухты (для бухт)
      if (fam.coilLengths) {
        html += `
          <div class="config-control-group">
            <label class="config-control-label">Строительная длина намотки в бухте:</label>
            <div class="config-sdr-buttons" style="grid-template-columns: repeat(${fam.coilLengths.length}, 1fr);">
              ${fam.coilLengths.map(l => `
                <button type="button" class="sdr-btn field-coillen ${state.coilLength === l ? 'active' : ''}" data-target="${fam.id}" data-len="${l}">
                  <span>${l} м</span>
                  <small>Цельный отрезок</small>
                </button>
              `).join('')}
            </div>
          </div>
        `;
      }

      return html;
    },

    renderLiveSpecsGrid(specs) {
      return `
        <div class="spec-tile">
          <span class="spec-tile__label">Артикул позиции</span>
          <span class="spec-tile__val spec-tile__val--accent">${specs.article}</span>
        </div>
        <div class="spec-tile">
          <span class="spec-tile__label">Диаметр (d)</span>
          <span class="spec-tile__val">d${specs.diameter} мм</span>
        </div>
        ${specs.casing ? `
          <div class="spec-tile">
            <span class="spec-tile__label">Оболочка (D)</span>
            <span class="spec-tile__val">D${specs.casing} мм</span>
          </div>
        ` : ''}
        ${specs.wall ? `
          <div class="spec-tile">
            <span class="spec-tile__label">Толщина стенки (e)</span>
            <span class="spec-tile__val">${specs.wall} мм</span>
          </div>
        ` : ''}
        ${specs.innerD ? `
          <div class="spec-tile">
            <span class="spec-tile__label">Внутр. просвет (di)</span>
            <span class="spec-tile__val">${specs.innerD} мм</span>
          </div>
        ` : ''}
        ${specs.weightM ? `
          <div class="spec-tile">
            <span class="spec-tile__label">Масса 1 метра</span>
            <span class="spec-tile__val">${specs.weightM} кг/м</span>
          </div>
        ` : ''}
        <div class="spec-tile">
          <span class="spec-tile__label">Рабочее давление</span>
          <span class="spec-tile__val">${specs.pressure}</span>
        </div>
        <div class="spec-tile">
          <span class="spec-tile__label">Температурный режим</span>
          <span class="spec-tile__val">+95°С (пик +110°)</span>
        </div>
      `;
    },

    renderEngineeringTable(fam, state) {
      const specsData = window.PIPEBOUND_DATA ? window.PIPEBOUND_DATA.pipeSpecs : [];
      const showDiameters = fam.diameters || (fam.variants ? fam.variants.map(v => v.d) : [32, 40, 50, 63, 75, 90, 110]);

      return `
        <div style="margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
          <h4 style="font-size: 0.95rem; color: var(--text-white);">Сводная инженерная таблица типоразмеров (d${showDiameters[0]}–d${showDiameters[showDiameters.length - 1]})</h4>
          <span style="font-size: 0.75rem; color: var(--text-muted);">Нажмите на строку для мгновенного выбора параметров</span>
        </div>
        <div class="config-table-scroll">
          <table class="config-table">
            <thead>
              <tr>
                <th>Диаметр (d)</th>
                ${fam.type.includes('ppu') ? '<th>Оболочка (D)</th>' : ''}
                <th>SDR 7.4 (стенка / вес 1м)</th>
                <th>SDR 9 (стенка / вес 1м)</th>
                <th>SDR 11 (стенка / вес 1м)</th>
                <th>Действие</th>
              </tr>
            </thead>
            <tbody>
              ${showDiameters.map(d => {
                const s = specsData.find(item => item.d === d) || {};
                const isCurrent = state.diameter === d;
                return `
                  <tr class="${isCurrent ? 'active-row' : ''}" onclick="CatalogController.selectRow('${fam.id}', ${d})">
                    <td><strong>d${d} мм</strong></td>
                    ${fam.type.includes('ppu') ? `<td>D${s.ppuCasing || '—'} мм</td>` : ''}
                    <td>${s.sdr74 ? `${s.sdr74.wall} мм / ${s.sdr74.weight} кг` : '—'}</td>
                    <td>${s.sdr9 ? `${s.sdr9.wall} мм / ${s.sdr9.weight} кг` : '—'}</td>
                    <td>${s.sdr11 ? `${s.sdr11.wall} мм / ${s.sdr11.weight} кг` : '—'}</td>
                    <td><button type="button" class="select-row-btn">Выбрать</button></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `;
    },

    bindCardInteractivity() {
      // 1. Изменение селектора диаметра
      document.querySelectorAll('.field-diameter').forEach(sel => {
        sel.addEventListener('change', (e) => {
          const famId = e.target.getAttribute('data-target');
          this.cardStates[famId].diameter = parseInt(e.target.value);
          this.refreshCard(famId);
        });
      });

      // 2. Изменение селектора подтипа
      document.querySelectorAll('.field-subtype').forEach(sel => {
        sel.addEventListener('change', (e) => {
          const famId = e.target.getAttribute('data-target');
          this.cardStates[famId].subType = e.target.value;
          this.refreshCard(famId);
        });
      });

      // 3. Изменение типа оболочки
      document.querySelectorAll('.field-casingtype').forEach(sel => {
        sel.addEventListener('change', (e) => {
          const famId = e.target.getAttribute('data-target');
          this.cardStates[famId].casingType = e.target.value;
          this.refreshCard(famId);
        });
      });

      // 4. Изменение размера оболочки (для КЗС)
      document.querySelectorAll('.field-casing').forEach(sel => {
        sel.addEventListener('change', (e) => {
          const famId = e.target.getAttribute('data-target');
          this.cardStates[famId].casing = parseInt(e.target.value);
          this.refreshCard(famId);
        });
      });

      // 5. Изменение варианта гибких труб
      document.querySelectorAll('.field-variant').forEach(sel => {
        sel.addEventListener('change', (e) => {
          const famId = e.target.getAttribute('data-target');
          this.cardStates[famId].variantIdx = parseInt(e.target.value);
          this.refreshCard(famId);
        });
      });

      // 6. Кнопки переключения SDR
      document.querySelectorAll('.sdr-btn[data-sdr]').forEach(btn => {
        btn.addEventListener('click', () => {
          const famId = btn.getAttribute('data-target');
          const sdr = parseFloat(btn.getAttribute('data-sdr'));
          this.cardStates[famId].sdr = sdr;
          this.refreshCard(famId);
        });
      });

      // 7. Кнопки переключения длины бухты
      document.querySelectorAll('.field-coillen').forEach(btn => {
        btn.addEventListener('click', () => {
          const famId = btn.getAttribute('data-target');
          const len = parseInt(btn.getAttribute('data-len'));
          this.cardStates[famId].coilLength = len;
          this.refreshCard(famId);
        });
      });

      // 8. Степпер количества
      document.querySelectorAll('.stepper-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const famId = btn.getAttribute('data-target');
          const act = btn.getAttribute('data-action');
          const input = document.getElementById(`qty-input-${famId}`);
          if (!input) return;

          let val = parseInt(input.value) || 1;
          if (act === 'inc') val++;
          if (act === 'dec') val = Math.max(1, val - 1);
          input.value = val;
          this.cardStates[famId].qty = val;
          this.refreshCard(famId);
        });
      });

      document.querySelectorAll('.stepper-input').forEach(input => {
        input.addEventListener('change', (e) => {
          const famId = e.target.id.replace('qty-input-', '');
          const val = Math.max(1, parseInt(e.target.value) || 1);
          e.target.value = val;
          this.cardStates[famId].qty = val;
          this.refreshCard(famId);
        });
      });
    },

    refreshCard(famId) {
      const fam = this.getFamilies().find(f => f.id === famId);
      const state = this.cardStates[famId];
      const specs = this.calculateSpecs(famId);
      if (!fam || !state || !specs) return;

      // Обновляем бейдж текущей конфигурации
      const pillEl = document.getElementById(`pill-val-${famId}`);
      if (pillEl) {
        pillEl.textContent = `d${specs.diameter} мм ${specs.casing ? `/ D${specs.casing}` : ''} • SDR ${specs.sdr || '—'}`;
      }

      // Обновляем кнопки SDR (active класс)
      const cardEl = document.getElementById(`config-card-${famId}`);
      if (cardEl) {
        cardEl.querySelectorAll('.sdr-btn[data-sdr]').forEach(b => {
          b.classList.toggle('active', parseFloat(b.getAttribute('data-sdr')) === state.sdr);
        });
        cardEl.querySelectorAll('.field-coillen').forEach(b => {
          b.classList.toggle('active', parseInt(b.getAttribute('data-len')) === state.coilLength);
        });
      }

      // Обновляем строку количества
      const summaryEl = document.getElementById(`qty-summary-${famId}`);
      if (summaryEl) {
        summaryEl.innerHTML = `<strong>${specs.summaryText}</strong>`;
      }

      // Обновляем живые характеристики
      const specsGrid = document.getElementById(`specs-grid-${famId}`);
      if (specsGrid) {
        specsGrid.innerHTML = this.renderLiveSpecsGrid(specs);
      }

      // Обновляем активную строку в таблице
      const tableCollapse = document.getElementById(`table-collapse-${famId}`);
      if (tableCollapse) {
        tableCollapse.innerHTML = this.renderEngineeringTable(fam, state);
      }
    },

    selectRow(famId, diameter) {
      this.cardStates[famId].diameter = diameter;
      const diamSelect = document.querySelector(`.field-diameter[data-target="${famId}"]`);
      if (diamSelect) {
        diamSelect.value = diameter;
      }
      this.refreshCard(famId);
    },

    toggleTable(famId) {
      const state = this.cardStates[famId];
      state.showTable = !state.showTable;
      const el = document.getElementById(`table-collapse-${famId}`);
      if (el) {
        el.classList.toggle('open', state.showTable);
      }
    },

    addToCart(famId) {
      const fam = this.getFamilies().find(f => f.id === famId);
      const state = this.cardStates[famId];
      const specs = this.calculateSpecs(famId);
      if (!fam || !state || !specs || !window.SpecCart) return;

      const cartProduct = {
        id: specs.article,
        name: specs.titleName,
        article: specs.article,
        diameter: specs.diameter,
        sdr: specs.sdr,
        form: fam.unitName,
        weightM: specs.weightM || 0,
        image: fam.image
      };

      window.SpecCart.addItem(cartProduct, state.qty);
      if (window.App && typeof window.App.openSpecDrawer === 'function') {
        window.App.openSpecDrawer();
      }
    },

    openQuoteForCard(famId) {
      const specs = this.calculateSpecs(famId);
      if (!specs) return;

      const modal = document.getElementById('modal-quote');
      if (modal) {
        modal.classList.add('active');
        const orgInput = modal.querySelector('input[type="text"]');
        if (orgInput && !orgInput.value) {
          orgInput.focus();
        }
      }
    },

    resetFilters() {
      this.currentCategory = 'all';
      this.searchQuery = '';
      const sInput = document.getElementById('catalog-search-input');
      if (sInput) sInput.value = '';
      this.updateChipUI();
      this.renderConfigurators();
    }
  };

  // Экспорт контроллера
  window.CatalogController = CatalogController;

  document.addEventListener('DOMContentLoaded', () => {
    CatalogController.init();
  });
})();
