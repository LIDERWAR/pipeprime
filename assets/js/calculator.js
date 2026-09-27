/**
 * PipePrime - Engineering Heating Network Calculator
 * Инженерный расчет потребности труб, комплектов заделки стыков (КЗС), массы и логистики
 * на основе формул и размерных рядов АТР 2026.
 */

(function() {
  'use strict';

  const PipeCalculator = {
    init() {
      this.bindInputs();
      this.recalculate();
    },

    bindInputs() {
      const inputs = [
        'calc-sys-type',
        'calc-length',
        'calc-pipe-type',
        'calc-diameter',
        'calc-sdr'
      ];

      inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          el.addEventListener('input', () => this.recalculate());
          el.addEventListener('change', () => this.recalculate());
        }
      });

      const addBtn = document.getElementById('calc-add-to-cart');
      if (addBtn) {
        addBtn.addEventListener('click', () => this.addCalculatedToCart());
      }

      const pdfBtn = document.getElementById('calc-download-pdf');
      if (pdfBtn) {
        pdfBtn.addEventListener('click', () => this.downloadPdfOffer());
      }
    },

    recalculate() {
      const sysTypeEl = document.getElementById('calc-sys-type');
      const lengthEl = document.getElementById('calc-length');
      const pipeTypeEl = document.getElementById('calc-pipe-type');
      const diamEl = document.getElementById('calc-diameter');
      const sdrEl = document.getElementById('calc-sdr');

      if (!lengthEl || !diamEl || !window.PIPEBOUND_DATA) return;

      const multiplier = parseInt(sysTypeEl ? sysTypeEl.value : 2) || 2;
      const routeLength = parseFloat(lengthEl.value) || 100;
      const pipeType = pipeTypeEl ? pipeTypeEl.value : 'ppu_pe';
      const diameter = parseInt(diamEl.value) || 110;
      const sdr = parseFloat(sdrEl ? sdrEl.value : 7.4) || 7.4;

      // Получаем точные данные из АТР 2026
      const spec = window.PIPEBOUND_DATA.pipeSpecs.find(s => s.d === diameter) || window.PIPEBOUND_DATA.pipeSpecs[7];
      const sdrKey = `sdr${sdr.toString().replace('.', '')}`;
      const sdrData = spec[sdrKey] || spec.sdr74;

      // 1. Длина труб
      const totalPipeMeters = routeLength * multiplier;
      const barsCount = Math.ceil(totalPipeMeters / 12);

      // 2. Расчет веса
      let weightPerMeter = sdrData.weight;
      if (pipeType === 'ppu_pe') {
        weightPerMeter += spec.ppuWeight;
      } else if (pipeType === 'ppu_oc') {
        weightPerMeter += spec.ppuWeight * 1.35;
      }

      const totalWeightKg = +(weightPerMeter * totalPipeMeters).toFixed(1);
      const totalWeightTons = +(totalWeightKg / 1000).toFixed(2);

      // 3. Количество стыков и КЗС
      const jointsCount = Math.max(0, barsCount - multiplier);
      const casingDiameter = spec.ppuCasing || 180;

      // 4. Объем для перевозки (грубая оценка с коэффициентом укладки)
      const outerD = (pipeType === 'uninsulated' ? diameter : casingDiameter) / 1000; // в метрах
      const pipeVol = (Math.PI * Math.pow(outerD / 2, 2) * 12) * barsCount * 1.6; // коэффициент плотности укладки
      const transportVolM3 = Math.max(2, Math.ceil(pipeVol));

      // 5. Подбор автотранспорта
      let transport = 'Еврофура 13.6 м (до 20 т / 82 м³)';
      if (barsCount <= 4 && totalWeightKg <= 1500) {
        transport = 'Длинномер 6 м или спецприцеп (до 1.5 т)';
      } else if (barsCount <= 12 && totalWeightKg <= 5000) {
        transport = 'Бортовой грузовик 12 м (до 5 т)';
      }

      // Обновление UI
      this.setVal('res-total-meters', `${totalPipeMeters} м`);
      this.setVal('res-bars-count', `${barsCount} шт (${barsCount * 12} м)`);
      this.setVal('res-total-weight', totalWeightKg > 1000 ? `${totalWeightTons} т` : `${totalWeightKg} кг`);
      this.setVal('res-joints-count', `${jointsCount} шт`);
      this.setVal('res-casing-info', pipeType === 'uninsulated' ? '—' : `D${casingDiameter} мм`);
      this.setVal('res-volume', `~${transportVolM3} м³`);
      this.setVal('res-transport', transport);

      // Сохраняем расчет для добавления в корзину
      this.lastCalculation = {
        pipeName: `Труба PE-RT тип II ${pipeType === 'ppu_pe' ? 'ППУ/ПЭ' : pipeType === 'ppu_oc' ? 'ППУ/ОЦ' : 'неизолированная'} d${diameter} мм SDR ${sdr}`,
        diameter: diameter,
        sdr: sdr,
        pipeType: pipeType,
        totalMeters: totalPipeMeters,
        barsCount: barsCount,
        casingD: casingDiameter,
        jointsCount: jointsCount,
        totalWeightKg: totalWeightKg,
        weightPerMeter: weightPerMeter
      };
    },

    setVal(id, val) {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    },

    addCalculatedToCart() {
      if (!this.lastCalculation || !window.SpecCart) return;

      const calc = this.lastCalculation;
      // Добавляем трубы
      window.SpecCart.addItem({
        id: `calc-pipe-${calc.diameter}-${calc.sdr}-${calc.pipeType}`,
        name: calc.pipeName,
        article: `CALC-PP-${calc.diameter}-SDR${calc.sdr}`,
        diameter: calc.diameter,
        sdr: calc.sdr,
        form: `${calc.barsCount} хлыстов по 12 м (${calc.totalMeters} м)`,
        weightM: calc.weightPerMeter
      }, 1);

      // Если труба в ППУ - добавляем необходимое количество КЗС
      if (calc.pipeType !== 'uninsulated' && calc.jointsCount > 0) {
        window.SpecCart.addItem({
          id: `calc-kzs-d${calc.casingD}`,
          name: `Комплект заделки стыка (КЗС) под оболочку D${calc.casingD} мм`,
          article: `CALC-KZS-D${calc.casingD}`,
          diameter: calc.casingD,
          sdr: '—',
          form: 'Комплект',
          weightM: 1.5
        }, calc.jointsCount);
      }

      window.App.showToast('Расчетная спецификация добавлена в корзину');
      window.App.openDrawer();
    },

    async downloadPdfOffer() {
      if (!this.lastCalculation) return;
      const calc = this.lastCalculation;
      const btn = document.getElementById('calc-download-pdf');
      const origHtml = btn ? btn.innerHTML : '';

      if (btn) {
        btn.disabled = true;
        btn.innerHTML = `
          <svg class="spin-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle><path d="M12 2a10 10 0 0 1 10 10"></path></svg>
          Генерация КП...
        `;
      }

      try {
        const apiBase = window.PIPEPRIME_API_BASE || (window.location.port === '3000' ? 'http://localhost:8000' : '');
        const payload = {
          pipe_category: calc.pipeName,
          diameter: `${calc.diameter} мм`,
          sdr: `SDR ${calc.sdr}`,
          length_meters: calc.totalMeters,
          whips_12m: calc.barsCount,
          joints_count: calc.jointsCount,
          weight_tons: +(calc.totalWeightKg / 1000).toFixed(2),
          trucks_count: Math.max(1, Math.ceil(calc.totalWeightKg / 18000))
        };

        const res = await fetch(`${apiBase}/api/calculator/generate-pdf`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          throw new Error(`Ошибка сервера: ${res.status}`);
        }

        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `PipePrime_KP_d${calc.diameter}_${calc.totalMeters}m.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);

        if (window.App && window.App.showToast) {
          window.App.showToast('Официальное КП успешно сформировано и скачано');
        }
      } catch (err) {
        console.error('PDF generation error:', err);
        if (window.App && window.App.showToast) {
          window.App.showToast('Ошибка при генерации PDF. Попробуйте еще раз.');
        }
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = origHtml;
        }
      }
    }
  };

  window.PipeCalculator = PipeCalculator;

  document.addEventListener('DOMContentLoaded', () => {
    PipeCalculator.init();
  });
})();
