/**
 * PipePrime Catalog Database
 * Полная номенклатура полимерных напорных трубопроводов PE-RT тип II,
 * предизолированных труб в ППУ/ПЭ и ППУ/ОЦ, фитингов и комплектующих
 * на основе официального Альбома технических решений (АТР 2026).
 */

const PIPEBOUND_DATA = {
  // Геометрические параметры и расчетные массы 1 м неизолированных труб PE-RT тип II
  pipeSpecs: [
    { d: 25, sdr74: { wall: 3.5, innerD: 18.0, weight: 0.26 }, sdr9: { wall: 2.8, innerD: 19.4, weight: 0.21 }, sdr11: { wall: 2.3, innerD: 20.4, weight: 0.18 }, ppuCasing: 90, ppuWeight: 1.15 },
    { d: 32, sdr74: { wall: 4.4, innerD: 23.2, weight: 0.41 }, sdr9: { wall: 3.6, innerD: 24.8, weight: 0.35 }, sdr11: { wall: 2.9, innerD: 26.2, weight: 0.29 }, ppuCasing: 110, ppuWeight: 1.62 },
    { d: 40, sdr74: { wall: 5.5, innerD: 29.0, weight: 0.64 }, sdr9: { wall: 4.5, innerD: 31.0, weight: 0.54 }, sdr11: { wall: 3.7, innerD: 32.6, weight: 0.46 }, ppuCasing: 110, ppuWeight: 1.95 },
    { d: 50, sdr74: { wall: 6.9, innerD: 36.2, weight: 0.98 }, sdr9: { wall: 5.6, innerD: 38.8, weight: 0.83 }, sdr11: { wall: 4.6, innerD: 40.8, weight: 0.70 }, ppuCasing: 125, ppuWeight: 2.65 },
    { d: 63, sdr74: { wall: 8.6, innerD: 45.8, weight: 1.55 }, sdr9: { wall: 7.1, innerD: 48.8, weight: 1.33 }, sdr11: { wall: 5.8, innerD: 51.4, weight: 1.11 }, ppuCasing: 125, ppuWeight: 3.25 },
    { d: 75, sdr74: { wall: 10.3, innerD: 54.4, weight: 2.71 }, sdr9: { wall: 8.4, innerD: 58.2, weight: 1.86 }, sdr11: { wall: 6.8, innerD: 61.4, weight: 1.55 }, ppuCasing: 140, ppuWeight: 4.30 },
    { d: 90, sdr74: { wall: 12.3, innerD: 65.4, weight: 3.16 }, sdr9: { wall: 10.1, innerD: 69.8, weight: 2.69 }, sdr11: { wall: 8.2, innerD: 73.6, weight: 2.24 }, ppuCasing: 160, ppuWeight: 5.50 },
    { d: 110, sdr74: { wall: 15.1, innerD: 79.8, weight: 4.73 }, sdr9: { wall: 12.3, innerD: 85.4, weight: 3.98 }, sdr11: { wall: 10.0, innerD: 90.0, weight: 3.31 }, ppuCasing: 180, ppuWeight: 7.60 },
    { d: 125, sdr74: { wall: 17.1, innerD: 90.8, weight: 6.08 }, sdr9: { wall: 14.0, innerD: 97.0, weight: 5.12 }, sdr11: { wall: 11.4, innerD: 102.2, weight: 4.31 }, ppuCasing: 200, ppuWeight: 9.30 },
    { d: 140, sdr74: { wall: 19.2, innerD: 101.6, weight: 7.64 }, sdr9: { wall: 15.7, innerD: 108.6, weight: 6.44 }, sdr11: { wall: 12.7, innerD: 114.6, weight: 5.36 }, ppuCasing: 225, ppuWeight: 11.40 },
    { d: 160, sdr74: { wall: 21.9, innerD: 116.2, weight: 9.92 }, sdr9: { wall: 17.9, innerD: 124.2, weight: 8.38 }, sdr11: { wall: 14.6, innerD: 130.8, weight: 7.03 }, ppuCasing: 250, ppuWeight: 14.50 },
    { d: 180, sdr74: { wall: 24.6, innerD: 130.8, weight: 12.54 }, sdr9: { wall: 20.1, innerD: 139.8, weight: 10.61 }, sdr11: { wall: 16.4, innerD: 147.2, weight: 8.88 }, ppuCasing: 280, ppuWeight: 18.20 },
    { d: 200, sdr74: { wall: 27.4, innerD: 145.2, weight: 15.51 }, sdr9: { wall: 22.4, innerD: 155.2, weight: 13.10 }, sdr11: { wall: 18.2, innerD: 163.6, weight: 10.95 }, ppuCasing: 315, ppuWeight: 22.80 },
    { d: 225, sdr74: { wall: 30.8, innerD: 163.4, weight: 19.60 }, sdr9: { wall: 25.2, innerD: 174.6, weight: 16.59 }, sdr11: { wall: 20.5, innerD: 184.0, weight: 13.85 }, ppuCasing: 315, ppuWeight: 27.50 },
    { d: 250, sdr74: { wall: 34.2, innerD: 181.6, weight: 24.20 }, sdr9: { wall: 27.9, innerD: 194.2, weight: 20.36 }, sdr11: { wall: 22.7, innerD: 204.6, weight: 17.02 }, ppuCasing: 355, ppuWeight: 34.20 },
    { d: 280, sdr74: { wall: 38.3, innerD: 203.4, weight: 30.34 }, sdr9: { wall: 31.3, innerD: 217.4, weight: 25.61 }, sdr11: { wall: 25.4, innerD: 229.2, weight: 21.34 }, ppuCasing: 400, ppuWeight: 42.60 },
    { d: 315, sdr74: { wall: 43.1, innerD: 228.8, weight: 38.41 }, sdr9: { wall: 35.2, innerD: 244.6, weight: 32.39 }, sdr11: { wall: 28.6, innerD: 257.8, weight: 27.00 }, ppuCasing: 450, ppuWeight: 53.80 },
    { d: 355, sdr74: { wall: 48.5, innerD: 258.0, weight: 48.69 }, sdr9: { wall: 39.7, innerD: 275.6, weight: 41.13 }, sdr11: { wall: 32.2, innerD: 290.6, weight: 34.30 }, ppuCasing: 500, ppuWeight: 67.50 },
    { d: 400, sdr74: { wall: 54.7, innerD: 290.6, weight: 61.80 }, sdr9: { wall: 44.7, innerD: 310.6, weight: 52.14 }, sdr11: { wall: 36.3, innerD: 327.4, weight: 43.51 }, ppuCasing: 560, ppuWeight: 84.90 }
  ],

  // Категории каталога
  categories: [
    {
      id: "uninsulated_bars",
      name: "Трубы PE-RT тип II неизолированные (хлысты 12 м)",
      shortName: "Трубы неизолированные (хлысты)",
      badge: "ГОСТ 32415-2013",
      image: "assets/images/pipe_uninsulated.png",
      description: "Напорные трубы из термостойкого полиэтилена PE-RT тип II в отрезках по 12 метров для отопления и ГВС. Диаметры 25–400 мм. Рабочая температура до +95°С (пиковая +110°С).",
      features: ["SDR 7.4 / SDR 9 / SDR 11", "Давление до 1.0 МПа (10 бар)", "Срок службы 50+ лет", "Сварка встык и электромуфтовая"],
      type: "pipes"
    },
    {
      id: "uninsulated_coils",
      name: "Трубы PE-RT тип II неизолированные (в бухтах 100–500 м)",
      shortName: "Трубы неизолированные (бухты)",
      badge: "Бесшовный монтаж",
      image: "assets/images/pipe_uninsulated.png",
      description: "Гибкие напорные трубы в бухтах от 100 до 500 метров для бестраншейной и канальной прокладки. Минимизируют количество стыков на трассе, ускоряя монтаж в 3 раза.",
      features: ["Диаметры 25, 32, 40, 50, 63, 75, 90, 110 мм", "Поставка цельными отрезками", "Идеально для ГНБ и реконструкции", "Экономия на фитингах"],
      type: "pipes"
    },
    {
      id: "insulated_ppu_pe",
      name: "Трубы PE-RT тип II предизолированные в ППУ/ПЭ (хлысты 12 м)",
      shortName: "Трубы в ППУ/ПЭ (подземные)",
      badge: "ГОСТ Р 56730-2015",
      image: "assets/images/pipe_cross_section.png",
      description: "Трубы в жестком пенополиуретане (ППУ) с полиэтиленовой оболочкой для бесканальной подземной прокладки тепловых сетей. Оснащаются проводниками системы ОДК.",
      features: ["Защитная ПЭ оболочка", "Теплопроводность ППУ 0.028 Вт/(м·К)", "Встроенная система ОДК", "Бесканальная укладка прямо в грунт"],
      type: "pipes"
    },
    {
      id: "insulated_ppu_oc",
      name: "Трубы PE-RT тип II предизолированные в ППУ/ОЦ (хлысты 12 м)",
      shortName: "Трубы в ППУ/ОЦ (надземные)",
      badge: "Оцинкованная сталь",
      image: "assets/images/pipe_cross_section.png",
      description: "Трубы с ППУ изоляцией в спирально-навивной оцинкованной оболочке (ОЦ) для надземной прокладки, эстакад, мостовых переходов и проходных каналов.",
      features: ["Устойчивость к УФ и осадкам", "Пожаробезопасность", "Прокладка по эстакадам и подвалам", "Долговечная антикоррозийная защита"],
      type: "pipes"
    },
    {
      id: "insulated_flexible",
      name: "Трубы PE-RT тип II гибкие в гофрированной оболочке ППУ/ПЭ (бухты)",
      shortName: "Гибкие трубы в гофре (бухты)",
      badge: "Премиум гибкость",
      image: "assets/images/hero_warehouse.jpg",
      description: "Гибкие предизолированные трубопроводы в гофрированном кожухе высокой стойкости. Поставляются в бухтах до 300 метров для оперативного монтажа теплотрасс в плотной городской застройке.",
      features: ["Бухты 100–300 м", "Огибание любых подземных препятствий", "Монтаж без компенсаторов", "Минимальный радиус изгиба"],
      type: "pipes"
    },
    {
      id: "fittings_electro",
      name: "Фитинги PE-RT тип II электросварные с закладными нагревателями",
      shortName: "Электросварные фитинги",
      badge: "SDR 7.4 / SDR 11",
      image: "assets/images/fitting_electro.png",
      description: "Муфты, отводы 45°/90°, тройники и переходы со встроенными нагревательными спиралями. Обеспечивают 100% герметичность и гомогенный сварной шов.",
      features: ["Штрих-код для сварочного аппарата", "Диаметры 25–400 мм", "Сварка без зазоров и протечек", "Рабочее давление до 10 бар"],
      type: "fittings"
    },
    {
      id: "fittings_spigot",
      name: "Фитинги PE-RT тип II литые (спигот) под сварку встык",
      shortName: "Литые фитинги (спигот)",
      badge: "Удлиненные",
      image: "assets/images/fitting_spigot.png",
      description: "Литые фасонные изделия (отводы, равнопроходные и редукционные тройники, переходы, втулки под фланец). Предназначены для сварки нагретым инструментом встык либо электромуфтами.",
      features: ["Высокая прочность литья", "Идеальная геометрия", "Диаметры 25–400 мм", "Экономичное решение для магистралей"],
      type: "fittings"
    },
    {
      id: "fittings_rastrub",
      name: "Фитинги PE-RT тип II для раструбной сварки",
      shortName: "Раструбные фитинги",
      badge: "Быстрый монтаж",
      image: "assets/images/fitting_spigot.png",
      description: "Фасонные детали для раструбной сварки малых и средних диаметров (20–63 мм). Применяются при разводке в теплопунктах (ИТП/ЦТП), котельных и внутридомовых сетях.",
      features: ["Диаметры 20–63 мм", "Простой сварочный инструмент", "Компактные размеры", "Надежность узлов подключения"],
      type: "fittings"
    },
    {
      id: "fittings_ppu",
      name: "Фасонные изделия PE-RT предизолированные в ППУ/ПЭ и ППУ/ОЦ",
      shortName: "Предизолированные фитинги",
      badge: "Заводская изоляция",
      image: "assets/images/fitting_ppu_pe.png",
      description: "Отводы 90° и 45°, тройники, Z-образные и П-образные элементы, неподвижные опоры с нанесенной заводской ППУ-изоляцией. Сохраняют сплошность теплоизоляционного контура.",
      features: ["Оболочка ПЭ или ОЦ", "Встроенные проводники ОДК", "Усиленная изоляция", "Заводской контроль качества"],
      type: "fittings"
    },
    {
      id: "accessories_kzs",
      name: "Комплектующие для теплосетей: КЗС, муфты, манжеты, НСПС",
      shortName: "Комплекты заделки стыков (КЗС)",
      badge: "100% герметичность",
      image: "assets/images/kzs_joint.png",
      description: "Комплекты заделки стыков (термоусаживаемые радиационно-сшитые муфты, двухкомпонентный пенополиуретан ППУ А+Б, пробки для заварки, манжеты стенового ввода, НСПС).",
      features: ["Полный набор для изоляции стыка", "Компоненты ППУ точной дозировки", "Адгезивные ленты горячего нанесения", "Манжеты стенового ввода"],
      type: "accessories"
    },
    {
      id: "snowmelt_systems",
      name: "Системы снеготаяния и обогрева футбольных полей",
      shortName: "Системы снеготаяния",
      badge: "Спортивные объекты",
      image: "assets/images/project_trench.jpg",
      description: "Специализированные контуры обогрева открытых площадок, стадионов, вертолетных площадок, пандусов и кровель на основе труб PE-RT повышенной эластичности и коллекторных узлов.",
      features: ["Равномерное распределение тепла", "Устойчивость к антифризам и гликолям", "Коллекторные узлы из нержавеющей стали", "Проектирование шага укладки"],
      type: "accessories"
    }
  ],

  // Сгенерированный детализированный каталог товаров (SKU)
  getProducts: function() {
    const products = [];
    let idCounter = 1;

    // 1. Трубы неизолированные хлысты
    this.pipeSpecs.forEach(spec => {
      [7.4, 9, 11].forEach(sdr => {
        const sdrKey = `sdr${sdr.toString().replace('.', '')}`;
        const sdrData = spec[sdrKey];
        if (!sdrData) return;
        const pressure = sdr === 7.4 ? "1.0 МПа (10 бар)" : sdr === 9 ? "0.8 МПа (8 бар)" : "0.6 МПа (6 бар)";

        products.push({
          id: `pp-unins-bar-${spec.d}-${sdr}`,
          categoryId: "uninsulated_bars",
          categoryName: "Трубы PE-RT тип II неизолированные (хлысты 12 м)",
          name: `Труба PE-RT тип II d${spec.d} мм SDR ${sdr} (хлыст 12 м)`,
          article: `PP-BAR-${spec.d}-SDR${sdr}`,
          diameter: spec.d,
          sdr: sdr,
          wall: sdrData.wall,
          innerD: sdrData.innerD,
          weightM: sdrData.weight,
          weightBar: +(sdrData.weight * 12).toFixed(2),
          form: "Хлыст 12 м",
          insulation: "Без изоляции",
          pressure: pressure,
          temp: "До +95°С (пиковая +110°С)",
          image: "assets/images/pipe_uninsulated.png",
          standard: "ГОСТ 32415-2013",
          application: "Отопление, горячее и холодное водоснабжение, бесканальная прокладка в футлярах, технологические трубопроводы"
        });
      });
    });

    // 2. Трубы неизолированные бухты (диаметры 25 - 110)
    this.pipeSpecs.filter(s => s.d <= 110).forEach(spec => {
      [7.4, 9, 11].forEach(sdr => {
        const sdrKey = `sdr${sdr.toString().replace('.', '')}`;
        const sdrData = spec[sdrKey];
        if (!sdrData) return;
        const coilLen = spec.d <= 63 ? 200 : spec.d <= 90 ? 150 : 100;
        const pressure = sdr === 7.4 ? "1.0 МПа (10 бар)" : sdr === 9 ? "0.8 МПа (8 бар)" : "0.6 МПа (6 бар)";

        products.push({
          id: `pp-unins-coil-${spec.d}-${sdr}`,
          categoryId: "uninsulated_coils",
          categoryName: "Трубы PE-RT тип II неизолированные (в бухтах)",
          name: `Труба PE-RT тип II d${spec.d} мм SDR ${sdr} (бухта ${coilLen} м)`,
          article: `PP-COIL-${spec.d}-SDR${sdr}`,
          diameter: spec.d,
          sdr: sdr,
          wall: sdrData.wall,
          innerD: sdrData.innerD,
          weightM: sdrData.weight,
          weightBar: +(sdrData.weight * coilLen).toFixed(2),
          form: `Бухта ${coilLen} м`,
          insulation: "Без изоляции",
          pressure: pressure,
          temp: "До +95°С (пиковая +110°С)",
          image: "assets/images/pipe_uninsulated.png",
          standard: "ГОСТ 32415-2013",
          application: "Бестраншейный монтаж, ГНБ, длинномерная бесканальная прокладка с минимумом стыков"
        });
      });
    });

    // 3. Трубы предизолированные в ППУ/ПЭ (хлысты 12 м)
    this.pipeSpecs.forEach(spec => {
      [7.4, 9, 11].forEach(sdr => {
        const sdrKey = `sdr${sdr.toString().replace('.', '')}`;
        const sdrData = spec[sdrKey];
        if (!sdrData) return;
        const casing = spec.ppuCasing;
        const totalWeightM = +(sdrData.weight + spec.ppuWeight).toFixed(2);

        products.push({
          id: `pp-ppu-pe-${spec.d}-${casing}-${sdr}`,
          categoryId: "insulated_ppu_pe",
          categoryName: "Трубы PE-RT тип II предизолированные в ППУ/ПЭ (хлысты 12 м)",
          name: `Труба PE-RT тип II ППУ/ПЭ d${spec.d}/${casing} мм SDR ${sdr} (хлыст 12 м)`,
          article: `PP-PPU-PE-${spec.d}/${casing}-SDR${sdr}`,
          diameter: spec.d,
          casingD: casing,
          sdr: sdr,
          wall: sdrData.wall,
          innerD: sdrData.innerD,
          weightM: totalWeightM,
          weightBar: +(totalWeightM * 12).toFixed(2),
          form: "Хлыст 12 м",
          insulation: "ППУ/ПЭ (пенополиуретан в полиэтиленовой оболочке)",
          odk: "С проводниками ОДК",
          pressure: sdr === 7.4 ? "1.0 МПа" : sdr === 9 ? "0.8 МПа" : "0.6 МПа",
          temp: "Рабочая +95°С, пиковая +110°С",
          image: "assets/images/pipe_cross_section.png",
          standard: "ГОСТ Р 56730-2015, СП 315.1325800.2017",
          application: "Подземная бесканальная прокладка магистральных и распределительных тепловых сетей"
        });
      });
    });

    // 4. Трубы предизолированные в ППУ/ОЦ (хлысты 12 м)
    this.pipeSpecs.filter(s => s.d <= 315).forEach(spec => {
      const sdrData = spec.sdr74;
      const casing = spec.ppuCasing;
      const totalWeightM = +(sdrData.weight + spec.ppuWeight * 1.35).toFixed(2);

      products.push({
        id: `pp-ppu-oc-${spec.d}-${casing}-74`,
        categoryId: "insulated_ppu_oc",
        categoryName: "Трубы PE-RT тип II предизолированные в ППУ/ОЦ (хлысты 12 м)",
        name: `Труба PE-RT тип II ППУ/ОЦ d${spec.d}/${casing} мм SDR 7.4 (хлыст 12 м)`,
        article: `PP-PPU-OC-${spec.d}/${casing}-SDR7.4`,
        diameter: spec.d,
        casingD: casing,
        sdr: 7.4,
        wall: sdrData.wall,
        innerD: sdrData.innerD,
        weightM: totalWeightM,
        weightBar: +(totalWeightM * 12).toFixed(2),
        form: "Хлыст 12 м",
        insulation: "ППУ/ОЦ (пенополиуретан в оцинкованной оболочке)",
        odk: "С проводниками ОДК",
        pressure: "1.0 МПа (10 бар)",
        temp: "Рабочая +95°С, пиковая +110°С",
        image: "assets/images/fitting_ppu_oc.png",
        standard: "ГОСТ Р 56730-2015",
        application: "Надземная прокладка теплотрасс, эстакады, переходы через препятствия, подвалы"
      });
    });

    // 5. Фитинги электросварные
    const electroDiameters = [25, 32, 40, 50, 63, 75, 90, 110, 125, 140, 160, 180, 200, 225, 250, 315, 400];
    electroDiameters.forEach(d => {
      products.push({
        id: `pp-fit-el-coupler-${d}`,
        categoryId: "fittings_electro",
        categoryName: "Фитинги PE-RT тип II электросварные",
        name: `Муфта электросварная PE-RT тип II d${d} мм (SDR 7.4-11)`,
        article: `PP-EF-M-${d}`,
        diameter: d,
        sdr: "7.4 / 11",
        typeItem: "Муфта соединительная",
        pressure: "До 1.6 МПа",
        image: "assets/images/fitting_electro.png",
        standard: "ГОСТ 32415-2013, ГОСТ Р 52779",
        application: "Электромуфтовое соединение отрезков труб и фасонных изделий"
      });

      if (d <= 225) {
        products.push({
          id: `pp-fit-el-bend90-${d}`,
          categoryId: "fittings_electro",
          categoryName: "Фитинги PE-RT тип II электросварные",
          name: `Отвод 90° электросварной PE-RT тип II d${d} мм`,
          article: `PP-EF-B90-${d}`,
          diameter: d,
          sdr: "7.4 / 11",
          typeItem: "Отвод 90 градусов",
          pressure: "До 1.6 МПа",
          image: "assets/images/fitting_electro.png",
          standard: "ГОСТ 32415-2013",
          application: "Поворот трассы теплосети под углом 90°"
        });
      }
    });

    // 6. Литые фитинги (спигот)
    const spigotDiameters = [32, 40, 50, 63, 75, 90, 110, 125, 140, 160, 200, 225, 250, 315, 400];
    spigotDiameters.forEach(d => {
      products.push({
        id: `pp-fit-spigot-tee-${d}`,
        categoryId: "fittings_spigot",
        categoryName: "Фитинги PE-RT тип II литые (спигот)",
        name: `Тройник равнопроходной литой PE-RT тип II d${d} мм SDR 11`,
        article: `PP-SP-TEE-${d}`,
        diameter: d,
        sdr: 11,
        typeItem: "Тройник литой",
        pressure: "1.0 МПа",
        image: "assets/images/fitting_spigot.png",
        standard: "ГОСТ 32415-2013",
        application: "Разветвление трубопроводов под сварку встык или электромуфты"
      });

      products.push({
        id: `pp-fit-spigot-bend90-${d}`,
        categoryId: "fittings_spigot",
        categoryName: "Фитинги PE-RT тип II литые (спигот)",
        name: `Отвод 90° литой удлиненный PE-RT тип II d${d} мм SDR 11`,
        article: `PP-SP-B90-${d}`,
        diameter: d,
        sdr: 11,
        typeItem: "Отвод литой",
        pressure: "1.0 МПа",
        image: "assets/images/fitting_spigot.png",
        standard: "ГОСТ 32415-2013",
        application: "Поворот магистральных линий теплоснабжения"
      });
    });

    // 7. Предизолированные фасонные элементы
    [32, 40, 50, 63, 75, 90, 110, 125, 160, 200, 225, 250, 315].forEach(d => {
      const spec = this.pipeSpecs.find(s => s.d === d);
      const casing = spec ? spec.ppuCasing : 160;

      products.push({
        id: `pp-ppu-bend90-${d}-${casing}`,
        categoryId: "fittings_ppu",
        categoryName: "Фасонные изделия PE-RT предизолированные в ППУ/ПЭ",
        name: `Отвод 90° PE-RT в ППУ/ПЭ d${d}/${casing} мм`,
        article: `PP-PPU-B90-${d}/${casing}`,
        diameter: d,
        casingD: casing,
        typeItem: "Отвод предизолированный",
        pressure: "1.0 МПа",
        image: "assets/images/fitting_ppu_pe.png",
        standard: "ГОСТ Р 56730-2015",
        application: "Поворот бесканальной теплотрассы с сохранением непрерывной ППУ изоляции"
      });

      products.push({
        id: `pp-ppu-support-${d}-${casing}`,
        categoryId: "fittings_ppu",
        categoryName: "Фасонные изделия PE-RT предизолированные в ППУ/ПЭ",
        name: `Неподвижная опора (НОП) PE-RT в ППУ/ПЭ d${d}/${casing} мм`,
        article: `PP-PPU-NOP-${d}/${casing}`,
        diameter: d,
        casingD: casing,
        typeItem: "Неподвижная опора",
        pressure: "1.0 МПа",
        image: "assets/images/fitting_ppu_pe.png",
        standard: "ГОСТ Р 56730-2015, АТР 2026",
        application: "Фиксация трубопровода в грунте и восприятие осевых температурных усилий"
      });
    });

    // 8. Комплектующие и КЗС
    [90, 110, 125, 140, 160, 180, 200, 225, 250, 280, 315, 355, 400, 450, 500, 560].forEach(casing => {
      products.push({
        id: `pp-kzs-${casing}`,
        categoryId: "accessories_kzs",
        categoryName: "Комплекты заделки стыков (КЗС)",
        name: `Комплект заделки стыка КЗС под оболочку D${casing} мм`,
        article: `PP-KZS-D${casing}`,
        casingD: casing,
        typeItem: "Комплект КЗС",
        components: "Термоусадочная муфта, компоненты ППУ А+Б, пробки стравливающие и заварочные, адгезивная лента",
        image: "assets/images/kzs_joint.png",
        standard: "ГОСТ Р 56730-2015, СП 315.1325800.2017",
        application: "Герметизация и восстановление теплоизоляционного слоя сварных стыков труб в ППУ"
      });
    });

    // Дополнительные комплектующие
    products.push({
      id: "pp-nsps-110-108",
      categoryId: "accessories_kzs",
      categoryName: "Комплектующие для теплосетей",
      name: "Неразъемное соединение полиэтилен-сталь (НСПС) d110/108 мм",
      article: "PP-NSPS-110/108",
      diameter: 110,
      typeItem: "Переходник полиэтилен-сталь",
      pressure: "1.0 МПа",
      image: "assets/images/fitting_spigot.png",
      standard: "ТУ, АТР 2026",
      application: "Переход с полимерной трубы PE-RT на стальную запорную арматуру или тепловую камеру"
    });

    products.push({
      id: "pp-snowmelt-coil-25",
      categoryId: "snowmelt_systems",
      categoryName: "Системы снеготаяния",
      name: "Труба PE-RT тип II для снеготаяния и обогрева полей d25х2.3 мм (бухта 500 м)",
      article: "PP-SNOW-25-500",
      diameter: 25,
      sdr: 11,
      form: "Бухта 500 м",
      image: "assets/images/project_trench.jpg",
      standard: "ГОСТ 32415-2013, АТР 2026",
      application: "Обогрев футбольных газонов, открытых рамп, взлетно-посадочных площадок, открытых автостоянок"
    });

    return products;
  }
};

if (typeof window !== 'undefined') {
  window.PIPEBOUND_DATA = PIPEBOUND_DATA;
}
