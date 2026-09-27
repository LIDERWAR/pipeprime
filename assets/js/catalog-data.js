/**
 * PipePrime Catalog Database
 * Полная номенклатура полимерных напорных трубопроводов PE-RT тип II,
 * предизолированных труб в ППУ/ПЭ и ППУ/ОЦ, гибких систем в гофре, фитингов и комплектующих
 * на основе официального Альбома технических решений (АТР 2026) и отраслевого стандарта (Boilerberg).
 */

const PIPEBOUND_DATA = {
  // Геометрические параметры и расчетные массы 1 м напорных труб PE-RT тип II (ГОСТ 32415-2013, ГОСТ Р 56730-2015)
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
    { d: 400, sdr74: { wall: 54.7, innerD: 290.6, weight: 61.80 }, sdr9: { wall: 44.7, innerD: 310.6, weight: 52.14 }, sdr11: { wall: 36.3, innerD: 327.4, weight: 43.51 }, ppuCasing: 560, ppuWeight: 84.90 },
    { d: 450, sdr74: { wall: 61.5, innerD: 327.0, weight: 78.10 }, sdr9: { wall: 50.3, innerD: 349.4, weight: 65.90 }, sdr11: { wall: 40.9, innerD: 368.2, weight: 55.05 }, ppuCasing: 630, ppuWeight: 98.40 },
    { d: 500, sdr74: { wall: 68.5, innerD: 363.0, weight: 96.50 }, sdr9: { wall: 55.8, innerD: 388.4, weight: 81.40 }, sdr11: { wall: 45.4, innerD: 409.2, weight: 67.90 }, ppuCasing: 670, ppuWeight: 115.00 },
    { d: 560, sdr74: { wall: 76.7, innerD: 406.6, weight: 121.00 }, sdr9: { wall: 62.5, innerD: 435.0, weight: 102.10 }, sdr11: { wall: 50.8, innerD: 458.4, weight: 85.20 }, ppuCasing: 710, ppuWeight: 135.00 },
    { d: 630, sdr74: { wall: 86.3, innerD: 457.4, weight: 153.20 }, sdr9: { wall: 70.3, innerD: 489.4, weight: 129.30 }, sdr11: { wall: 57.2, innerD: 515.6, weight: 107.80 }, ppuCasing: 800, ppuWeight: 165.00 }
  ],

  // 10 ключевых категорий каталога (в точном соответствии с номенклатурой Boilerberg и АТР 2026)
  categories: [
    {
      id: "uninsulated_bars",
      name: "Трубы PE-RT тип II неизолированные (хлысты 12 м)",
      shortName: "Трубы неизолированные (хлысты)",
      badge: "ГОСТ 32415-2013",
      image: "assets/images/cat_pert_pipe.png",
      description: "Напорные трубы из термостойкого полиэтилена PE-RT тип II в отрезках по 12 метров для отопления и ГВС. Диаметры 25–630 мм. Рабочая температура до +95°С (пиковая +110°С).",
      features: ["SDR 7.4 / SDR 9 / SDR 11", "Давление до 1.0 МПа (10 бар)", "Срок службы 50+ лет", "Сварка встык и электромуфтовая"],
      type: "pipes"
    },
    {
      id: "uninsulated_coils",
      name: "Трубы PE-RT тип II неизолированные (бухты 100–500 м)",
      shortName: "Трубы неизолированные (бухты)",
      badge: "Бесшовный монтаж",
      image: "assets/images/cat_pert_pipe.png",
      description: "Гибкие напорные трубы в бухтах от 100 до 500 метров для бестраншейной и канальной прокладки. Минимизируют количество стыков на трассе, ускоряя монтаж в 3 раза.",
      features: ["Диаметры 25, 32, 40, 50, 63, 75, 90, 110 мм", "Поставка цельными отрезками", "Идеально для ГНБ и реконструкции", "Экономия на фитингах"],
      type: "pipes"
    },
    {
      id: "insulated_ppu_pe",
      name: "Трубы PE-RT тип II предизолированные в ППУ/ПЭ (хлысты 12 м)",
      shortName: "Трубы в ППУ/ПЭ (подземные)",
      badge: "ГОСТ Р 56730-2015",
      image: "assets/images/cat_ppu_pipe.png",
      description: "Трубы в жестком пенополиуретане (ППУ) с полиэтиленовой оболочкой для бесканальной подземной прокладки тепловых сетей. Оснащаются проводниками системы ОДК.",
      features: ["Защитная ПЭ оболочка", "Теплопроводность ППУ 0.028 Вт/(м·К)", "Встроенная система ОДК", "Бесканальная укладка прямо в грунт"],
      type: "pipes"
    },
    {
      id: "insulated_ppu_oc",
      name: "Трубы PE-RT тип II предизолированные в ППУ/ОЦ (хлысты 12 м)",
      shortName: "Трубы в ППУ/ОЦ (надземные)",
      badge: "Оцинкованная сталь",
      image: "assets/images/cat_ppu_pipe.png",
      description: "Трубы с ППУ изоляцией в спирально-навивной оцинкованной оболочке (ОЦ) для надземной прокладки, эстакад, мостовых переходов и проходных каналов.",
      features: ["Устойчивость к УФ и осадкам", "Пожаробезопасность", "Прокладка по эстакадам и подвалам", "Долговечная антикоррозийная защита"],
      type: "pipes"
    },
    {
      id: "insulated_flexible",
      name: "Трубы PE-RT тип II гибкие в гофрированной оболочке ППУ/ПЭ (бухты)",
      shortName: "Гибкие трубы в гофре (бухты)",
      badge: "Бухты 100–300 м",
      image: "assets/images/cat_ppu_pipe.png",
      description: "Гибкие предизолированные трубопроводы в гофрированном полиэтиленовом кожухе высокой стойкости. Поставляются в бухтах до 300 метров для бестраншейной прокладки в плотной городской застройке без стыков и компенсаторов.",
      features: ["Бухты 100–300 м", "Огибание любых подземных препятствий", "Монтаж без компенсаторов", "Размеры 25/90 – 110/180 мм"],
      type: "pipes"
    },
    {
      id: "fittings_electro",
      name: "Фитинги PE-RT тип II электросварные",
      shortName: "Фитинги электросварные",
      badge: "SDR 7.4 / SDR 11",
      image: "assets/images/cat_fitting_electro.png",
      description: "Муфты, отводы 45°/90°, равнопроходные и редукционные тройники, переходы и седелки со встроенными нагревательными спиралями. 100% герметичность и штрих-код автоматической сварки.",
      features: ["Штрих-код для сварочного аппарата", "Диаметры 25–400 мм", "Сварка без зазоров и протечек", "Рабочее давление до 1.6 МПа"],
      type: "fittings"
    },
    {
      id: "fittings_spigot",
      name: "Фитинги PE-RT тип II литые (спигот) под сварку встык",
      shortName: "Литые фитинги (спигот)",
      badge: "Сварка встык",
      image: "assets/images/cat_fitting_spigot.png",
      description: "Литые фасонные изделия (отводы 45° и 90°, тройники равнопроходные и редукционные, переходы концентрические, втулки под фланец). Удлиненный хвостовик для сварки нагретым инструментом встык или электромуфтами.",
      features: ["Высокая прочность литья", "Идеальная геометрия", "Диаметры 32–630 мм", "Экономичное решение для магистралей"],
      type: "fittings"
    },
    {
      id: "fittings_rastrub",
      name: "Фитинги PE-RT тип II для раструбной сварки",
      shortName: "Раструбные фитинги",
      badge: "Раструб и резьба",
      image: "assets/images/cat_fitting_spigot.png",
      description: "Фасонные детали для раструбной сварки (муфты, отводы, тройники, комбинированные муфты ВР/НР с латунными резьбами и накидными гайками-американками). Применяются при обвязке ИТП/ЦТП, котельных и узлов учета.",
      features: ["Диаметры 20–63 мм", "Комбинированные муфты с латунью", "Быстрый ручной монтаж", "Надежность узлов ИТП и котельных"],
      type: "fittings"
    },
    {
      id: "fittings_ppu",
      name: "Фитинги PE-RT тип II предизолированные в ППУ/ПЭ и ППУ/ОЦ",
      shortName: "Фасонные изделия в ППУ",
      badge: "Заводская изоляция",
      image: "assets/images/cat_ppu_pipe.png",
      description: "Отводы 90° и 45°, тройники равнопроходные и ответвления, тройники с шаровым краном воздушника, концевые элементы с кабелем ОДК, неподвижные опоры (НОП) с заводской теплоизоляцией.",
      features: ["Оболочка ПЭ или ОЦ", "Встроенные проводники ОДК", "Краны воздушников в ППУ", "Заводской контроль качества"],
      type: "fittings"
    },
    {
      id: "accessories_kzs",
      name: "Комплектующие для теплосетей (НСПС, фланцы, КЗС, ОДК)",
      shortName: "Комплектующие и КЗС",
      badge: "100% герметичность",
      image: "assets/images/kzs_joint.png",
      description: "Неразъемные соединения полиэтилен-сталь (НСПС), фланцы расточенные стальные PN10/PN16 в полипропиленовой защитной оболочке, комплекты заделки стыков (КЗС) под оболочку D90–560 мм, манжеты стенового ввода и ковера ОДК.",
      features: ["НСПС ПЭ/Сталь ст.20", "Расточенные фланцы в ПП", "КЗС с муфтой и пеной ППУ А+Б", "Манжеты и система ОДК"],
      type: "accessories"
    }
  ],

  // Сгенерированный детализированный каталог товаров (SKU)
  getProducts: function() {
    const products = [];

    // 1. Трубы неизолированные хлысты 12 м (диаметры d25 - d630)
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
          image: "assets/images/cat_pert_pipe.png",
          standard: "ГОСТ 32415-2013",
          application: "Отопление, горячее и холодное водоснабжение, бесканальная прокладка в футлярах, технологические трубопроводы"
        });
      });
    });

    // 2. Трубы неизолированные бухты (диаметры d25 - d110)
    this.pipeSpecs.filter(s => s.d <= 110).forEach(spec => {
      [7.4, 9, 11].forEach(sdr => {
        const sdrKey = `sdr${sdr.toString().replace('.', '')}`;
        const sdrData = spec[sdrKey];
        if (!sdrData) return;
        const coilLen = spec.d <= 40 ? 200 : spec.d <= 63 ? 150 : spec.d <= 90 ? 120 : 100;
        const pressure = sdr === 7.4 ? "1.0 МПа (10 бар)" : sdr === 9 ? "0.8 МПа (8 бар)" : "0.6 МПа (6 бар)";

        products.push({
          id: `pp-unins-coil-${spec.d}-${sdr}`,
          categoryId: "uninsulated_coils",
          categoryName: "Трубы PE-RT тип II неизолированные (в бухтах 100–500 м)",
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
          image: "assets/images/cat_pert_pipe.png",
          standard: "ГОСТ 32415-2013",
          application: "Бестраншейный монтаж, ГНБ, длинномерная бесканальная прокладка с минимумом стыков"
        });
      });
    });

    // 3. Трубы предизолированные в ППУ/ПЭ (хлысты 12 м, d25 - d630)
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
          image: "assets/images/cat_ppu_pipe.png",
          standard: "ГОСТ Р 56730-2015, СП 315.1325800.2017",
          application: "Подземная бесканальная прокладка магистральных и распределительных тепловых сетей"
        });
      });
    });

    // 4. Трубы предизолированные в ППУ/ОЦ (хлысты 12 м, d25 - d315)
    this.pipeSpecs.filter(s => s.d <= 315).forEach(spec => {
      [7.4, 11].forEach(sdr => {
        const sdrKey = `sdr${sdr.toString().replace('.', '')}`;
        const sdrData = spec[sdrKey];
        if (!sdrData) return;
        const casing = spec.ppuCasing;
        const totalWeightM = +(sdrData.weight + spec.ppuWeight * 1.35).toFixed(2);

        products.push({
          id: `pp-ppu-oc-${spec.d}-${casing}-${sdr}`,
          categoryId: "insulated_ppu_oc",
          categoryName: "Трубы PE-RT тип II предизолированные в ППУ/ОЦ (хлысты 12 м)",
          name: `Труба PE-RT тип II ППУ/ОЦ d${spec.d}/${casing} мм SDR ${sdr} (хлыст 12 м)`,
          article: `PP-PPU-OC-${spec.d}/${casing}-SDR${sdr}`,
          diameter: spec.d,
          casingD: casing,
          sdr: sdr,
          wall: sdrData.wall,
          innerD: sdrData.innerD,
          weightM: totalWeightM,
          weightBar: +(totalWeightM * 12).toFixed(2),
          form: "Хлыст 12 м",
          insulation: "ППУ/ОЦ (пенополиуретан в оцинкованной оболочке)",
          odk: "С проводниками ОДК",
          pressure: sdr === 7.4 ? "1.0 МПа (10 бар)" : "0.6 МПа (6 бар)",
          temp: "Рабочая +95°С, пиковая +110°С",
          image: "assets/images/cat_ppu_pipe.png",
          standard: "ГОСТ Р 56730-2015",
          application: "Надземная прокладка теплотрасс, эстакады, переходы через препятствия, подвалы"
        });
      });
    });

    // 5. Трубы гибкие предизолированные в гофрированной оболочке ППУ/ПЭ (бухты 100–300 м)
    const flexibleSizes = [
      { d: 25, casing: 90, coilLen: 300, weightM: 1.35 },
      { d: 32, casing: 90, coilLen: 250, weightM: 1.55 },
      { d: 40, casing: 90, coilLen: 200, weightM: 1.85 },
      { d: 50, casing: 110, coilLen: 150, weightM: 2.45 },
      { d: 63, casing: 125, coilLen: 120, weightM: 3.10 },
      { d: 75, casing: 140, coilLen: 100, weightM: 4.10 },
      { d: 90, casing: 160, coilLen: 100, weightM: 5.30 },
      { d: 110, casing: 160, coilLen: 100, weightM: 6.80 },
      { d: 110, casing: 180, coilLen: 80, weightM: 7.90 }
    ];

    flexibleSizes.forEach(item => {
      [7.4, 9, 11].forEach(sdr => {
        products.push({
          id: `pp-flex-ppu-${item.d}-${item.casing}-sdr${sdr}`,
          categoryId: "insulated_flexible",
          categoryName: "Трубы PE-RT тип II гибкие в гофрированной оболочке ППУ/ПЭ (бухты)",
          name: `Труба PE-RT тип II гибкая в гофре ППУ/ПЭ d${item.d}/${item.casing} мм SDR ${sdr} (бухта ${item.coilLen} м)`,
          article: `PP-CRIMP-${item.d}/${item.casing}-SDR${sdr}`,
          diameter: item.d,
          casingD: item.casing,
          sdr: sdr,
          weightM: item.weightM,
          weightBar: +(item.weightM * item.coilLen).toFixed(1),
          form: `Бухта ${item.coilLen} м`,
          insulation: "ППУ в гибкой гофрированной полиэтиленовой оболочке",
          odk: "С проводниками ОДК",
          pressure: sdr === 7.4 ? "1.0 МПа (10 бар)" : sdr === 9 ? "0.8 МПа (8 бар)" : "0.6 МПа (6 бар)",
          temp: "До +95°С (пиковая +110°С)",
          image: "assets/images/cat_ppu_pipe.png",
          standard: "ГОСТ Р 56730-2015, ТУ завода-изготовителя",
          application: "Бестраншейная бесканальная прокладка теплосетей и ГВС в стесненных городских условиях с огибанием коммуникаций без компенсаторов"
        });
      });
    });

    // 6. Фитинги электросварные
    const electroDiameters = [25, 32, 40, 50, 63, 75, 90, 110, 125, 140, 160, 180, 200, 225, 250, 315, 400];
    electroDiameters.forEach(d => {
      // Муфта электросварная
      products.push({
        id: `pp-fit-el-coupler-${d}`,
        categoryId: "fittings_electro",
        categoryName: "Фитинги PE-RT тип II электросварные",
        name: `Муфта электросварная PE-RT тип II d${d} мм (SDR 7.4-11)`,
        article: `PP-EF-M-${d}`,
        diameter: d,
        sdr: "7.4 / 11",
        typeItem: "Муфта электросварная",
        pressure: "1.6 МПа (16 бар)",
        image: "assets/images/cat_fitting_electro.png",
        standard: "ГОСТ 32415-2013, ГОСТ Р 52779",
        application: "Монолитное соединение напорных труб PE-RT со штрих-код позиционированием"
      });

      // Отводы 90 и 45 до d225
      if (d <= 225) {
        products.push({
          id: `pp-fit-el-bend90-${d}`,
          categoryId: "fittings_electro",
          categoryName: "Фитинги PE-RT тип II электросварные",
          name: `Отвод 90° электросварной PE-RT тип II d${d} мм`,
          article: `PP-EF-B90-${d}`,
          diameter: d,
          sdr: "7.4 / 11",
          typeItem: "Отвод 90° электросварной",
          pressure: "1.6 МПа (16 бар)",
          image: "assets/images/cat_fitting_electro.png",
          standard: "ГОСТ 32415-2013",
          application: "Поворот трассы теплосети под углом 90°"
        });

        products.push({
          id: `pp-fit-el-bend45-${d}`,
          categoryId: "fittings_electro",
          categoryName: "Фитинги PE-RT тип II электросварные",
          name: `Отвод 45° электросварной PE-RT тип II d${d} мм`,
          article: `PP-EF-B45-${d}`,
          diameter: d,
          sdr: "7.4 / 11",
          typeItem: "Отвод 45° электросварной",
          pressure: "1.6 МПа (16 бар)",
          image: "assets/images/cat_fitting_electro.png",
          standard: "ГОСТ 32415-2013",
          application: "Плавный поворот трассы теплосети под углом 45°"
        });

        products.push({
          id: `pp-fit-el-tee-${d}`,
          categoryId: "fittings_electro",
          categoryName: "Фитинги PE-RT тип II электросварные",
          name: `Тройник равнопроходной электросварной PE-RT тип II d${d} мм`,
          article: `PP-EF-TEE-${d}`,
          diameter: d,
          sdr: "7.4 / 11",
          typeItem: "Тройник электросварной",
          pressure: "1.6 МПа (16 бар)",
          image: "assets/images/cat_fitting_electro.png",
          standard: "ГОСТ 32415-2013",
          application: "Разветвление трубопровода с закладным нагревателем"
        });
      }
    });

    // Переходы электросварные редукционные
    const electroReductions = [
      { d1: 32, d2: 25 }, { d1: 40, d2: 32 }, { d1: 50, d2: 40 }, { d1: 63, d2: 50 },
      { d1: 75, d2: 63 }, { d1: 90, d2: 63 }, { d1: 110, d2: 90 }, { d1: 160, d2: 110 }
    ];
    electroReductions.forEach(r => {
      products.push({
        id: `pp-fit-el-red-${r.d1}-${r.d2}`,
        categoryId: "fittings_electro",
        categoryName: "Фитинги PE-RT тип II электросварные",
        name: `Переход электросварной редукционный PE-RT тип II d${r.d1}*${r.d2} мм`,
        article: `PP-EF-RED-${r.d1}/${r.d2}`,
        diameter: r.d1,
        sdr: "7.4 / 11",
        typeItem: "Переход редукционный электросварной",
        pressure: "1.6 МПа",
        image: "assets/images/cat_fitting_electro.png",
        standard: "ГОСТ 32415-2013",
        application: "Переход диаметра трубопровода при электромуфтовой сварке"
      });
    });

    // 7. Литые фитинги (спигот) под сварку встык
    const spigotDiameters = [32, 40, 50, 63, 75, 90, 110, 125, 140, 160, 200, 225, 250, 315, 400, 500, 630];
    spigotDiameters.forEach(d => {
      // Отвод 90° литой удлиненный
      products.push({
        id: `pp-fit-spigot-bend90-${d}`,
        categoryId: "fittings_spigot",
        categoryName: "Фитинги PE-RT тип II литые (спигот)",
        name: `Отвод 90° литой удлиненный (спигот) PE-RT тип II d${d} мм SDR 11`,
        article: `PP-SP-B90-${d}`,
        diameter: d,
        sdr: 11,
        typeItem: "Отвод литой 90°",
        pressure: "1.0 МПа (10 бар)",
        image: "assets/images/cat_fitting_spigot.png",
        standard: "ГОСТ 32415-2013",
        application: "Поворот магистральных линий под стыковую или электромуфтовую сварку"
      });

      // Отвод 45° литой удлиненный
      products.push({
        id: `pp-fit-spigot-bend45-${d}`,
        categoryId: "fittings_spigot",
        categoryName: "Фитинги PE-RT тип II литые (спигот)",
        name: `Отвод 45° литой удлиненный (спигот) PE-RT тип II d${d} мм SDR 11`,
        article: `PP-SP-B45-${d}`,
        diameter: d,
        sdr: 11,
        typeItem: "Отвод литой 45°",
        pressure: "1.0 МПа (10 бар)",
        image: "assets/images/cat_fitting_spigot.png",
        standard: "ГОСТ 32415-2013",
        application: "Угловой поворот магистрали под 45°"
      });

      // Тройник равнопроходной литой
      products.push({
        id: `pp-fit-spigot-tee-${d}`,
        categoryId: "fittings_spigot",
        categoryName: "Фитинги PE-RT тип II литые (спигот)",
        name: `Тройник равнопроходной литой PE-RT тип II d${d} мм SDR 11`,
        article: `PP-SP-TEE-${d}`,
        diameter: d,
        sdr: 11,
        typeItem: "Тройник литой",
        pressure: "1.0 МПа (10 бар)",
        image: "assets/images/cat_fitting_spigot.png",
        standard: "ГОСТ 32415-2013",
        application: "Разветвление трубопроводов под сварку встык или электромуфты"
      });

      // Втулка под фланец литая удлиненная
      products.push({
        id: `pp-fit-spigot-flange-bush-${d}`,
        categoryId: "fittings_spigot",
        categoryName: "Фитинги PE-RT тип II литые (спигот)",
        name: `Втулка под фланец литая удлиненная PE-RT тип II d${d} мм SDR 11`,
        article: `PP-SP-BUSH-${d}`,
        diameter: d,
        sdr: 11,
        typeItem: "Втулка под фланец",
        pressure: "1.0 МПа",
        image: "assets/images/cat_fitting_spigot.png",
        standard: "ГОСТ 32415-2013",
        application: "Фланцевое присоединение полимерной трубы к запорной арматуре"
      });
    });

    // Редукции литые спигот
    const spigotReductions = [
      { d1: 63, d2: 32 }, { d1: 63, d2: 40 }, { d1: 63, d2: 50 }, { d1: 75, d2: 63 },
      { d1: 90, d2: 63 }, { d1: 110, d2: 63 }, { d1: 110, d2: 90 }, { d1: 160, d2: 110 },
      { d1: 225, d2: 160 }, { d1: 315, d2: 225 }
    ];
    spigotReductions.forEach(r => {
      products.push({
        id: `pp-fit-spigot-red-${r.d1}-${r.d2}`,
        categoryId: "fittings_spigot",
        categoryName: "Фитинги PE-RT тип II литые (спигот)",
        name: `Переход литой/спигот редукционный PE-RT тип II d${r.d1}*${r.d2} мм SDR 11`,
        article: `PP-SP-RED-${r.d1}/${r.d2}`,
        diameter: r.d1,
        sdr: 11,
        typeItem: "Переход литой редукционный",
        pressure: "1.0 МПа",
        image: "assets/images/cat_fitting_spigot.png",
        standard: "ГОСТ 32415-2013",
        application: "Концентрическое сужение диаметра трубопровода при сварке встык"
      });
    });

    // 8. Фитинги для раструбной сварки (d20 - d63)
    const rastrubDiameters = [20, 25, 32, 40, 50, 63];
    const threadMap = { 20: '1/2"', 25: '3/4"', 32: '1"', 40: '1 1/4"', 50: '1 1/2"', 63: '2"' };

    rastrubDiameters.forEach(d => {
      // Муфта раструбная соединительная
      products.push({
        id: `pp-rastrub-coupler-${d}`,
        categoryId: "fittings_rastrub",
        categoryName: "Фитинги PE-RT тип II для раструбной сварки",
        name: `Муфта PE-RT тип II соединительная для раструбной сварки d${d} мм`,
        article: `PP-RAST-M-${d}`,
        diameter: d,
        sdr: 7.4,
        typeItem: "Муфта раструбная",
        pressure: "1.0 МПа",
        image: "assets/images/cat_fitting_spigot.png",
        standard: "ГОСТ 32415-2013",
        application: "Раструбное соединение труб PE-RT ручным аппаратом"
      });

      // Отвод 90° раструбный
      products.push({
        id: `pp-rastrub-b90-${d}`,
        categoryId: "fittings_rastrub",
        categoryName: "Фитинги PE-RT тип II для раструбной сварки",
        name: `Отвод 90° PE-RT тип II для раструбной сварки d${d} мм`,
        article: `PP-RAST-B90-${d}`,
        diameter: d,
        sdr: 7.4,
        typeItem: "Отвод 90° раструбный",
        pressure: "1.0 МПа",
        image: "assets/images/cat_fitting_spigot.png",
        standard: "ГОСТ 32415-2013",
        application: "Поворот на 90° при раструбной сварке в ИТП и котельных"
      });

      // Тройник раструбный
      products.push({
        id: `pp-rastrub-tee-${d}`,
        categoryId: "fittings_rastrub",
        categoryName: "Фитинги PE-RT тип II для раструбной сварки",
        name: `Тройник равнопроходной PE-RT тип II для раструбной сварки d${d} мм`,
        article: `PP-RAST-TEE-${d}`,
        diameter: d,
        sdr: 7.4,
        typeItem: "Тройник раструбный",
        pressure: "1.0 МПа",
        image: "assets/images/cat_fitting_spigot.png",
        standard: "ГОСТ 32415-2013",
        application: "Тройниковое ответвление при раструбном монтаже"
      });

      // Муфта комбинированная с ВР
      products.push({
        id: `pp-rastrub-comb-vr-${d}`,
        categoryId: "fittings_rastrub",
        categoryName: "Фитинги PE-RT тип II для раструбной сварки",
        name: `Муфта комбинированная PE-RT d${d} мм с ВР ${threadMap[d]} под раструбную сварку`,
        article: `PP-RAST-VR-${d}`,
        diameter: d,
        typeItem: "Муфта комбинированная ВР",
        pressure: "1.0 МПа",
        image: "assets/images/cat_fitting_spigot.png",
        standard: "ГОСТ 32415-2013",
        application: "Переход с трубы PE-RT на внутреннюю трубную резьбу для кранов и приборов"
      });

      // Муфта комбинированная с НР и накидной гайкой (американка)
      products.push({
        id: `pp-rastrub-comb-nr-${d}`,
        categoryId: "fittings_rastrub",
        categoryName: "Фитинги PE-RT тип II для раструбной сварки",
        name: `Муфта комбинированная PE-RT d${d} мм с НР ${threadMap[d]} с накидной гайкой`,
        article: `PP-RAST-NR-${d}`,
        diameter: d,
        typeItem: "Муфта комбинированная с накидной гайкой",
        pressure: "1.0 МПа",
        image: "assets/images/cat_fitting_spigot.png",
        standard: "ГОСТ 32415-2013",
        application: "Разъемное резьбовое соединение с запорной арматурой"
      });
    });

    // 9. Фитинги предизолированные в ППУ/ПЭ и ППУ/ОЦ
    [32, 40, 50, 63, 75, 90, 110, 125, 160, 200, 225, 250, 315, 400].forEach(d => {
      const spec = this.pipeSpecs.find(s => s.d === d);
      const casing = spec ? spec.ppuCasing : 160;

      // Отвод 90° в ППУ/ПЭ
      products.push({
        id: `pp-ppu-bend90-${d}-${casing}`,
        categoryId: "fittings_ppu",
        categoryName: "Фитинги PE-RT тип II предизолированные в ППУ/ПЭ (ОЦ)",
        name: `Отвод 90° PE-RT тип II в ППУ/ПЭ d${d}/${casing} мм с ОДК`,
        article: `PP-PPU-B90-${d}/${casing}`,
        diameter: d,
        casingD: casing,
        sdr: 7.4,
        typeItem: "Отвод 90° в ППУ/ПЭ",
        pressure: "1.0 МПа",
        image: "assets/images/cat_ppu_pipe.png",
        standard: "ГОСТ Р 56730-2015",
        application: "Поворот бесканальной теплотрассы с сохранением непрерывной ППУ изоляции и цепи ОДК"
      });

      // Отвод 45° в ППУ/ПЭ
      products.push({
        id: `pp-ppu-bend45-${d}-${casing}`,
        categoryId: "fittings_ppu",
        categoryName: "Фитинги PE-RT тип II предизолированные в ППУ/ПЭ (ОЦ)",
        name: `Отвод 45° PE-RT тип II в ППУ/ПЭ d${d}/${casing} мм с ОДК`,
        article: `PP-PPU-B45-${d}/${casing}`,
        diameter: d,
        casingD: casing,
        sdr: 7.4,
        typeItem: "Отвод 45° в ППУ/ПЭ",
        pressure: "1.0 МПа",
        image: "assets/images/cat_ppu_pipe.png",
        standard: "ГОСТ Р 56730-2015",
        application: "Плавный поворот подземной теплотрассы в грунте"
      });

      // Тройник равнопроходной в ППУ/ПЭ
      products.push({
        id: `pp-ppu-tee-${d}-${casing}`,
        categoryId: "fittings_ppu",
        categoryName: "Фитинги PE-RT тип II предизолированные в ППУ/ПЭ (ОЦ)",
        name: `Тройник равнопроходной PE-RT тип II в ППУ/ПЭ d${d}/${casing} мм с ОДК`,
        article: `PP-PPU-TEE-${d}/${casing}`,
        diameter: d,
        casingD: casing,
        sdr: 7.4,
        typeItem: "Тройник в ППУ/ПЭ",
        pressure: "1.0 МПа",
        image: "assets/images/cat_ppu_pipe.png",
        standard: "ГОСТ Р 56730-2015",
        application: "Разветвление предизолированной тепловой сети с ОДК"
      });

      // Неподвижная опора (НОП)
      products.push({
        id: `pp-ppu-support-${d}-${casing}`,
        categoryId: "fittings_ppu",
        categoryName: "Фитинги PE-RT тип II предизолированные в ППУ/ПЭ (ОЦ)",
        name: `Неподвижная щитовая опора (НОП) PE-RT в ППУ/ПЭ d${d}/${casing} мм`,
        article: `PP-PPU-NOP-${d}/${casing}`,
        diameter: d,
        casingD: casing,
        typeItem: "Неподвижная опора",
        pressure: "1.0 МПа",
        image: "assets/images/cat_ppu_pipe.png",
        standard: "ГОСТ Р 56730-2015, АТР 2026",
        application: "Восприятие осевых температурных усилий и фиксация трубопровода в грунте"
      });

      // Концевой элемент с кабелем вывода ОДК
      products.push({
        id: `pp-ppu-ke-${d}-${casing}`,
        categoryId: "fittings_ppu",
        categoryName: "Фитинги PE-RT тип II предизолированные в ППУ/ПЭ (ОЦ)",
        name: `Элемент концевой с кабелем вывода ОДК PE-RT в ППУ/ПЭ d${d}/${casing} мм`,
        article: `PP-PPU-KE-${d}/${casing}`,
        diameter: d,
        casingD: casing,
        typeItem: "Концевой элемент с ОДК",
        pressure: "1.0 МПа",
        image: "assets/images/cat_ppu_pipe.png",
        standard: "ГОСТ Р 56730-2015, СП 315.1325800.2017",
        application: "Вывод сигнальных проводников системы ОДК в терминал контроля влажности"
      });
    });

    // 10. Комплектующие для теплосетей (НСПС, расточенные фланцы, КЗС)
    // НСПС (переходы ПЭ/Сталь)
    const nspsSizes = [
      { pe: 32, st: 32 }, { pe: 40, st: 32 }, { pe: 50, st: 40 }, { pe: 63, st: 57 },
      { pe: 75, st: 76 }, { pe: 90, st: 89 }, { pe: 110, st: 108 }, { pe: 160, st: 159 },
      { pe: 225, st: 219 }, { pe: 315, st: 325 }, { pe: 400, st: 426 }
    ];

    nspsSizes.forEach(n => {
      products.push({
        id: `pp-nsps-${n.pe}-${n.st}`,
        categoryId: "accessories_kzs",
        categoryName: "Комплектующие для теплосетей (НСПС, фланцы, КЗС, ОДК)",
        name: `Неразъемное соединение полиэтилен-сталь (НСПС) d${n.pe}*${n.st} мм, ст.20`,
        article: `PP-NSPS-${n.pe}/${n.st}`,
        diameter: n.pe,
        sdr: 11,
        typeItem: "Переходник ПЭ-Сталь",
        pressure: "1.0 МПа (10 бар)",
        image: "assets/images/cat_fitting_spigot.png",
        standard: "ТУ, Альбом АТР 2026",
        application: "Переход с полимерной трубы PE-RT на стальную запорную арматуру или тепловую камеру"
      });
    });

    // Фланцы расточенные в ПП оболочке
    const flangeSizes = [32, 40, 50, 63, 75, 90, 110, 125, 140, 160, 200, 225, 250, 315, 400];
    flangeSizes.forEach(d => {
      products.push({
        id: `pp-flange-pp-${d}`,
        categoryId: "accessories_kzs",
        categoryName: "Комплектующие для теплосетей (НСПС, фланцы, КЗС, ОДК)",
        name: `Фланец стальной расточенный под втулку в ПП оболочке d${d} мм PN16`,
        article: `PP-FL-PP-${d}`,
        diameter: d,
        typeItem: "Фланец расточенный в ПП",
        pressure: "1.6 МПа (PN16)",
        image: "assets/images/cat_fitting_spigot.png",
        standard: "ГОСТ 33259-2015, ТУ",
        application: "Фланцевый монтаж полимерных втулок со стальной антикоррозийной защитой"
      });
    });

    // Комплекты заделки стыков КЗС
    [90, 110, 125, 140, 160, 180, 200, 225, 250, 280, 315, 355, 400, 450, 500, 560, 630, 710, 800].forEach(casing => {
      products.push({
        id: `pp-kzs-${casing}`,
        categoryId: "accessories_kzs",
        categoryName: "Комплектующие для теплосетей (НСПС, фланцы, КЗС, ОДК)",
        name: `Комплект заделки стыка КЗС под защитную оболочку D${casing} мм`,
        article: `PP-KZS-D${casing}`,
        casingD: casing,
        typeItem: "Комплект КЗС",
        components: "Радиационно-сшитая термомуфта, пенопакет ППУ А+Б, пробки заварные/стравливающие, адгезивная лента",
        image: "assets/images/kzs_joint.png",
        standard: "ГОСТ Р 56730-2015, СП 315.1325800.2017",
        application: "100% герметизация и восстановление изоляции на стыках предизолированных труб в грунте"
      });
    });

    return products;
  }
};

if (typeof window !== 'undefined') {
  window.PIPEBOUND_DATA = PIPEBOUND_DATA;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PIPEBOUND_DATA;
}
