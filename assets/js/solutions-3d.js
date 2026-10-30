/**
 * PipePrime - Interactive 3D WebGL Pipeline Assembly Engine
 * Процедурный параметрический 3D-движок на базе Three.js (r128)
 * Инженерная визуализация узлов АТР 2026 без тяжелых внешних CAD-файлов.
 * Поддерживает: 360° вращение, зум, продольный разрез, взрыв-схему (exploded view),
 * адаптивную перестройку при выборе диаметров и подсветку позиций спецификации (BOM).
 */

(function() {
  'use strict';

  const Solutions3DEngine = {
    viewers: {}, // Хранилище активных инстансов: { [solutionId]: viewerInstance }

    // Конфигурация фирменной инженерной палитры материалов PipePrime
    getMaterials() {
      if (this._materials) return this._materials;

      const m = {
        // Труба PE-RT тип II (интенсивный инженерный синий)
        pertPipe: new THREE.MeshStandardMaterial({
          color: 0x1d4ed8,
          roughness: 0.35,
          metalness: 0.1,
          side: THREE.DoubleSide
        }),
        // Теплоизоляция пенополиуретан ППУ (янтарно-желтая мелкоячеистая пена)
        ppuFoam: new THREE.MeshStandardMaterial({
          color: 0xf59e0b,
          roughness: 0.85,
          metalness: 0.05
        }),
        // Защитная оболочка ПЭ (матовый антрацит полиэтилен 100)
        peCasing: new THREE.MeshStandardMaterial({
          color: 0x0f172a,
          roughness: 0.55,
          metalness: 0.15
        }),
        // Защитная оболочка ОЦ (оцинкованная спирально-навивная сталь)
        ocCasing: new THREE.MeshStandardMaterial({
          color: 0xa1a1aa,
          roughness: 0.28,
          metalness: 0.82
        }),
        // Буртовая втулка под фланец (литой полимер)
        flangeStub: new THREE.MeshStandardMaterial({
          color: 0x0284c7,
          roughness: 0.3,
          metalness: 0.1
        }),
        // Свободный стальной расточенный фланец (кованая конструкционная сталь)
        steelFlange: new THREE.MeshStandardMaterial({
          color: 0x64748b,
          roughness: 0.25,
          metalness: 0.85
        }),
        // Корпус чугунной/стальной задвижки и шарового крана
        valveBody: new THREE.MeshStandardMaterial({
          color: 0x1e293b,
          roughness: 0.4,
          metalness: 0.75
        }),
        // Фирменный оранжевый маховик / рукоятка PipePrime
        valveAccent: new THREE.MeshStandardMaterial({
          color: 0xff6b00,
          roughness: 0.3,
          metalness: 0.2
        }),
        // Эластомерная уплотнительная прокладка EPDM
        epdmGasket: new THREE.MeshStandardMaterial({
          color: 0x10b981,
          roughness: 0.65,
          metalness: 0.05
        }),
        // Монолитный железобетонный массив B25 (полупрозрачный конструкционный блок)
        concrete: new THREE.MeshStandardMaterial({
          color: 0x64748b,
          roughness: 0.95,
          metalness: 0.05,
          transparent: true,
          opacity: 0.42
        }),
        // Арматурный каркас (рифленая сталь А500С)
        rebar: new THREE.MeshStandardMaterial({
          color: 0xd97706,
          roughness: 0.45,
          metalness: 0.65
        }),
        // Диэлектрические центрирующие кольца ОНК
        onkRing: new THREE.MeshStandardMaterial({
          color: 0x0ea5e9,
          roughness: 0.4,
          metalness: 0.15
        }),
        // Стальной защитный футляр ГНБ (труба в изоляции ВУС)
        casingSteel: new THREE.MeshStandardMaterial({
          color: 0x334155,
          roughness: 0.35,
          metalness: 0.8,
          side: THREE.DoubleSide
        }),
        // Несущий стальной швеллер эстакады
        channelSteel: new THREE.MeshStandardMaterial({
          color: 0x475569,
          roughness: 0.3,
          metalness: 0.75
        }),
        // Оцинкованный крепеж: болты, шпильки, хомуты, гайки
        fasteners: new THREE.MeshStandardMaterial({
          color: 0xe2e8f0,
          roughness: 0.2,
          metalness: 0.92
        }),
        // Электросварная муфта с закладными спиралями
        electroCoupler: new THREE.MeshStandardMaterial({
          color: 0x18181b,
          roughness: 0.45,
          metalness: 0.2
        })
      };

      this._materials = m;
      return m;
    },

    /**
     * Инициализация или перерисовка 3D вьюера для конкретного узла
     */
    initViewer(solutionId, containerEl, diameter) {
      if (typeof THREE === 'undefined') {
        console.warn('Three.js is not loaded.');
        return null;
      }

      // Если вьюер уже создан, обновляем геометрию
      if (this.viewers[solutionId]) {
        this.updateModel(solutionId, diameter);
        return this.viewers[solutionId];
      }

      const rect = containerEl.getBoundingClientRect();
      const width = rect.width || 600;
      const height = rect.height || 360;

      // 1. Создаем сцену
      const scene = new THREE.Scene();

      // 2. Инженерная чертежная сетка на полу
      const grid = new THREE.GridHelper(30, 30, 0xff6b00, 0x1e293b);
      grid.position.y = -2.2;
      grid.material.opacity = 0.35;
      grid.material.transparent = true;
      scene.add(grid);

      // 3. Камера
      const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
      camera.position.set(7.5, 5.0, 9.0);

      // 4. WebGL Рендерер
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height);
      renderer.localClippingEnabled = true;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;

      // Очищаем контейнер перед добавлением холста
      containerEl.innerHTML = '';
      containerEl.appendChild(renderer.domElement);

      // 5. Освещение сцены (индустриальное студийное освещение)
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
      scene.add(ambientLight);

      const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.85);
      dirLight1.position.set(10, 15, 10);
      scene.add(dirLight1);

      const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 0.4);
      dirLight2.position.set(-10, -5, -8);
      scene.add(dirLight2);

      const warmPoint = new THREE.PointLight(0xffedd5, 0.5, 20);
      warmPoint.position.set(0, 4, 3);
      scene.add(warmPoint);

      // 6. Управление камерой OrbitControls
      let controls = null;
      if (typeof THREE.OrbitControls !== 'undefined') {
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.08;
        controls.maxPolarAngle = Math.PI / 2 + 0.1;
        controls.minDistance = 2.0;
        controls.maxDistance = 28.0;
        controls.target.set(0, 0, 0);
      }

      // 7. Плоскость отсечения для режима «Разрез» (Section View)
      const sectionPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

      // Корневая группа модели для вращения и трансформаций
      const modelGroup = new THREE.Group();
      scene.add(modelGroup);

      const viewer = {
        solutionId,
        containerEl,
        scene,
        camera,
        renderer,
        controls,
        modelGroup,
        sectionPlane,
        isExploded: false,
        isSection: false,
        diameter: diameter || 110,
        interactiveMeshes: [],
        animating: true,
        defaultCamPos: new THREE.Vector3(7.5, 5.0, 9.0),
        defaultTarget: new THREE.Vector3(0, 0, 0)
      };

      this.viewers[solutionId] = viewer;

      // Построение начальной модели
      this.buildAssembly(viewer, solutionId, viewer.diameter);

      // 8. Подключение Raycaster для интерактива
      this.setupRaycasting(viewer);

      // 9. Resize observer
      const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
          const w = entry.contentRect.width;
          const h = entry.contentRect.height;
          if (w > 0 && h > 0) {
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
          }
        }
      });
      resizeObserver.observe(containerEl);
      viewer.resizeObserver = resizeObserver;

      // 10. Цикл анимации (Render Loop)
      const animate = () => {
        if (!viewer.animating) return;
        requestAnimationFrame(animate);

        if (controls) controls.update();

        // Плавная интерполяция взрыв-схемы
        modelGroup.traverse(child => {
          if (child.userData && child.userData.basePos && child.userData.explodedPos) {
            const targetPos = viewer.isExploded ? child.userData.explodedPos : child.userData.basePos;
            child.position.lerp(targetPos, 0.1);
          }
        });

        renderer.render(scene, camera);
      };
      animate();

      return viewer;
    },

    /**
     * Построение процедурной геометрии узла
     */
    buildAssembly(viewer, solutionId, diameter) {
      const g = viewer.modelGroup;
      // Очистка предыдущей геометрии
      while (g.children.length > 0) {
        const obj = g.children[0];
        g.remove(obj);
        if (obj.geometry) obj.geometry.dispose();
      }
      viewer.interactiveMeshes = [];

      const mats = this.getMaterials();
      const d = parseInt(diameter) || 110;

      // Коэффициент масштаба диаметра
      const scaleD = Math.max(0.4, Math.min(1.6, d / 110));
      const pipeR = 0.42 * scaleD;
      const ppuR = 0.72 * scaleD;
      const caseR = 0.76 * scaleD;

      switch(solutionId) {
        case 'steel-flanged':
          this.buildFlangedAssembly(viewer, pipeR, ppuR, caseR, d, mats);
          break;

        case 'steel-nsps':
          this.buildNspsAssembly(viewer, pipeR, d, mats);
          break;

        case 'fixed-anchor-monolith':
          this.buildFixedAnchorAssembly(viewer, pipeR, ppuR, caseR, d, mats);
          break;

        case 'aboveground-rack-oc':
          this.buildAbovegroundRackAssembly(viewer, pipeR, ppuR, caseR, d, mats);
          break;

        case 'casing-trenchless':
          this.buildCasingCrossingAssembly(viewer, pipeR, ppuR, caseR, d, mats);
          break;

        case 'heat-chamber-node':
          this.buildHeatChamberAssembly(viewer, pipeR, d, mats);
          break;

        case 'snow-melting-field':
          this.buildSnowMeltingAssembly(viewer, mats);
          break;

        default:
          this.buildFlangedAssembly(viewer, pipeR, ppuR, caseR, d, mats);
      }

      // Применяем текущие режимы (Разрез)
      this.applySectionState(viewer);
    },

    /**
     * 1. Узел фланцевого перехода на стальную задвижку
     */
    buildFlangedAssembly(viewer, pipeR, ppuR, caseR, d, mats) {
      const g = viewer.modelGroup;

      // 1.1 Труба PE-RT тип II (внутренний напорный канал)
      const pipeGeom = new THREE.CylinderGeometry(pipeR, pipeR, 3.2, 32, 1, true);
      pipeGeom.rotateZ(Math.PI / 2);
      const pipeMesh = new THREE.Mesh(pipeGeom, mats.pertPipe);
      pipeMesh.position.set(-2.0, 0, 0);
      pipeMesh.userData = {
        title: `Труба PE-RT тип II SDR 7.4 (dn ${d} мм)`,
        pos: 1,
        basePos: new THREE.Vector3(-2.0, 0, 0),
        explodedPos: new THREE.Vector3(-3.4, 0, 0)
      };
      g.add(pipeMesh);
      viewer.interactiveMeshes.push(pipeMesh);

      // 1.2 Слой ППУ-изоляции
      const ppuGeom = new THREE.CylinderGeometry(ppuR, ppuR, 2.3, 32);
      ppuGeom.rotateZ(Math.PI / 2);
      const ppuMesh = new THREE.Mesh(ppuGeom, mats.ppuFoam);
      ppuMesh.position.set(-2.45, 0, 0);
      ppuMesh.userData = {
        title: `Слой теплоизоляции ППУ (толщина ${(ppuR - pipeR) * 100 | 0} мм)`,
        pos: 1,
        basePos: new THREE.Vector3(-2.45, 0, 0),
        explodedPos: new THREE.Vector3(-4.0, 0, 0)
      };
      g.add(ppuMesh);
      viewer.interactiveMeshes.push(ppuMesh);

      // 1.3 Защитная ПЭ-оболочка
      const caseGeom = new THREE.CylinderGeometry(caseR, caseR, 2.25, 32, 1, true);
      caseGeom.rotateZ(Math.PI / 2);
      const caseMesh = new THREE.Mesh(caseGeom, mats.peCasing);
      caseMesh.position.set(-2.48, 0, 0);
      caseMesh.userData = {
        title: `Защитная гидрозащитная оболочка ПЭ-100`,
        pos: 1,
        basePos: new THREE.Vector3(-2.48, 0, 0),
        explodedPos: new THREE.Vector3(-4.1, 0, 0)
      };
      g.add(caseMesh);
      viewer.interactiveMeshes.push(caseMesh);

      // 1.4 Концевой предохранитель торцевой (термоусаживаемый наконечник)
      const capGeom = new THREE.CylinderGeometry(caseR * 1.03, pipeR * 1.05, 0.25, 32);
      capGeom.rotateZ(Math.PI / 2);
      const capMesh = new THREE.Mesh(capGeom, mats.peCasing);
      capMesh.position.set(-1.3, 0, 0);
      capMesh.userData = {
        title: `Концевой термоусаживаемый предохранитель ППУ`,
        pos: 5,
        basePos: new THREE.Vector3(-1.3, 0, 0),
        explodedPos: new THREE.Vector3(-2.2, 0, 0)
      };
      g.add(capMesh);
      viewer.interactiveMeshes.push(capMesh);

      // 1.5 Буртовая втулка под фланец PE-RT (длинный хвостовик)
      const stubGroup = new THREE.Group();
      const stubStem = new THREE.Mesh(new THREE.CylinderGeometry(pipeR * 1.02, pipeR * 1.02, 1.2, 32), mats.flangeStub);
      stubStem.rotateZ(Math.PI / 2);
      stubStem.position.x = -0.55;
      stubGroup.add(stubStem);

      const stubCollar = new THREE.Mesh(new THREE.CylinderGeometry(pipeR * 1.55, pipeR * 1.55, 0.22, 32), mats.flangeStub);
      stubCollar.rotateZ(Math.PI / 2);
      stubCollar.position.x = 0.05;
      stubGroup.add(stubCollar);

      stubGroup.position.set(0, 0, 0);
      stubGroup.userData = {
        title: `Втулка под фланец литая удлиненная d${d}`,
        pos: 1,
        basePos: new THREE.Vector3(0, 0, 0),
        explodedPos: new THREE.Vector3(-1.0, 0, 0)
      };
      g.add(stubGroup);
      viewer.interactiveMeshes.push(stubCollar, stubStem);

      // 1.6 Свободный стальной расточенный фланец
      const flangeGeom = new THREE.CylinderGeometry(pipeR * 1.85, pipeR * 1.85, 0.28, 32);
      flangeGeom.rotateZ(Math.PI / 2);
      const flangeMesh = new THREE.Mesh(flangeGeom, mats.steelFlange);
      flangeMesh.position.set(-0.15, 0, 0);
      flangeMesh.userData = {
        title: `Фланец стальной свободный расточенный Ду ${(d * 0.9) | 0} Ру 16`,
        pos: 2,
        basePos: new THREE.Vector3(-0.15, 0, 0),
        explodedPos: new THREE.Vector3(-0.6, 0, 0)
      };
      g.add(flangeMesh);
      viewer.interactiveMeshes.push(flangeMesh);

      // 1.7 Эластомерная уплотнительная прокладка EPDM
      const gasketGeom = new THREE.CylinderGeometry(pipeR * 1.48, pipeR * 1.48, 0.06, 32);
      gasketGeom.rotateZ(Math.PI / 2);
      const gasketMesh = new THREE.Mesh(gasketGeom, mats.epdmGasket);
      gasketMesh.position.set(0.18, 0, 0);
      gasketMesh.userData = {
        title: `Прокладка фланцевая эластомерная EPDM со стальным кордом`,
        pos: 3,
        basePos: new THREE.Vector3(0.18, 0, 0),
        explodedPos: new THREE.Vector3(0.05, 0, 0)
      };
      g.add(gasketMesh);
      viewer.interactiveMeshes.push(gasketMesh);

      // 1.8 Ответный фланец стальной задвижки
      const valveFlangeGeom = new THREE.CylinderGeometry(pipeR * 1.85, pipeR * 1.85, 0.28, 32);
      valveFlangeGeom.rotateZ(Math.PI / 2);
      const valveFlangeMesh = new THREE.Mesh(valveFlangeGeom, mats.steelFlange);
      valveFlangeMesh.position.set(0.35, 0, 0);
      valveFlangeMesh.userData = {
        title: `Ответный приварной фланец задвижки`,
        pos: 4,
        basePos: new THREE.Vector3(0.35, 0, 0),
        explodedPos: new THREE.Vector3(0.7, 0, 0)
      };
      g.add(valveFlangeMesh);
      viewer.interactiveMeshes.push(valveFlangeMesh);

      // 1.9 Корпус стальной клиновой задвижки
      const valveGroup = new THREE.Group();
      const vBody = new THREE.Mesh(new THREE.BoxGeometry(1.6, pipeR * 2.3, pipeR * 2.1), mats.valveBody);
      vBody.position.x = 1.2;
      valveGroup.add(vBody);

      const vBonnet = new THREE.Mesh(new THREE.CylinderGeometry(pipeR * 0.9, pipeR * 1.1, 1.4, 24), mats.valveBody);
      vBonnet.position.set(1.2, pipeR * 1.8, 0);
      valveGroup.add(vBonnet);

      const vWheel = new THREE.Mesh(new THREE.TorusGeometry(pipeR * 1.1, 0.12, 16, 32), mats.valveAccent);
      vWheel.rotateX(Math.PI / 2);
      vWheel.position.set(1.2, pipeR * 2.6, 0);
      valveGroup.add(vWheel);

      valveGroup.userData = {
        title: `Задвижка стальная клиновая фланцевая Ду ${(d * 0.9) | 0} Ру 16`,
        pos: 4,
        basePos: new THREE.Vector3(0, 0, 0),
        explodedPos: new THREE.Vector3(1.6, 0, 0)
      };
      g.add(valveGroup);
      viewer.interactiveMeshes.push(vBody, vWheel);

      // 1.10 Болтовой крепеж по окружности фланца
      const boltGroup = new THREE.Group();
      const numBolts = 8;
      const boltR = pipeR * 1.55;
      for (let i = 0; i < numBolts; i++) {
        const ang = (i / numBolts) * Math.PI * 2;
        const b = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.95, 12), mats.fasteners);
        b.rotateZ(Math.PI / 2);
        b.position.set(0.1, Math.sin(ang) * boltR, Math.cos(ang) * boltR);
        boltGroup.add(b);
      }
      boltGroup.userData = {
        title: `Комплект шпилек и гаек М20 (класс прочности 8.8)`,
        pos: 4,
        basePos: new THREE.Vector3(0, 0, 0),
        explodedPos: new THREE.Vector3(-0.1, 0, 0)
      };
      g.add(boltGroup);
    },

    /**
     * 2. Узел неразъемного соединения полиэтилен-сталь (НСПС)
     */
    buildNspsAssembly(viewer, pipeR, d, mats) {
      const g = viewer.modelGroup;

      // 2.1 Подводящая труба PE-RT
      const pert = new THREE.Mesh(new THREE.CylinderGeometry(pipeR, pipeR, 2.5, 32), mats.pertPipe);
      pert.rotateZ(Math.PI / 2);
      pert.position.set(-2.0, 0, 0);
      pert.userData = {
        title: `Труба PE-RT тип II SDR 7.4 d${d}`,
        pos: 1,
        basePos: new THREE.Vector3(-2.0, 0, 0),
        explodedPos: new THREE.Vector3(-3.2, 0, 0)
      };
      g.add(pert);
      viewer.interactiveMeshes.push(pert);

      // 2.2 Электросварная муфта
      const coupler = new THREE.Mesh(new THREE.CylinderGeometry(pipeR * 1.3, pipeR * 1.3, 1.2, 32), mats.electroCoupler);
      coupler.rotateZ(Math.PI / 2);
      coupler.position.set(-0.8, 0, 0);
      coupler.userData = {
        title: `Муфта электросварная SDR 7.4 с закладными спиралями`,
        pos: 2,
        basePos: new THREE.Vector3(-0.8, 0, 0),
        explodedPos: new THREE.Vector3(-1.4, 0, 0)
      };
      g.add(coupler);
      viewer.interactiveMeshes.push(coupler);

      // 2.3 Полимерная часть патрубка НСПС
      const nspsPoly = new THREE.Mesh(new THREE.CylinderGeometry(pipeR, pipeR, 1.4, 32), mats.flangeStub);
      nspsPoly.rotateZ(Math.PI / 2);
      nspsPoly.position.set(0.1, 0, 0);
      nspsPoly.userData = {
        title: `Полимерный патрубок переходника НСПС заводской опрессовки`,
        pos: 1,
        basePos: new THREE.Vector3(0.1, 0, 0),
        explodedPos: new THREE.Vector3(-0.2, 0, 0)
      };
      g.add(nspsPoly);
      viewer.interactiveMeshes.push(nspsPoly);

      // 2.4 Металлическая обжимная муфта заводской заделки
      const crimpRing = new THREE.Mesh(new THREE.CylinderGeometry(pipeR * 1.25, pipeR * 1.25, 0.7, 32), mats.steelFlange);
      crimpRing.rotateZ(Math.PI / 2);
      crimpRing.position.set(0.65, 0, 0);
      crimpRing.userData = {
        title: `Стальная обжимная силовая гильза НСПС (герметичность до 2.5 МПа)`,
        pos: 1,
        basePos: new THREE.Vector3(0.65, 0, 0),
        explodedPos: new THREE.Vector3(0.5, 0, 0)
      };
      g.add(crimpRing);
      viewer.interactiveMeshes.push(crimpRing);

      // 2.5 Стальной бесшовный патрубок Ст.20 под электродуговую сварку
      const steelPipe = new THREE.Mesh(new THREE.CylinderGeometry(pipeR * 0.98, pipeR * 0.98, 2.2, 32), mats.casingSteel);
      steelPipe.rotateZ(Math.PI / 2);
      steelPipe.position.set(1.9, 0, 0);
      steelPipe.userData = {
        title: `Стальной патрубок Ст.20 ГОСТ 8732-78 со скосом кромки под приварку`,
        pos: 1,
        basePos: new THREE.Vector3(1.9, 0, 0),
        explodedPos: new THREE.Vector3(2.6, 0, 0)
      };
      g.add(steelPipe);
      viewer.interactiveMeshes.push(steelPipe);

      // 2.6 Термоусаживаемая антикоррозийная манжета
      const wrapMesh = new THREE.Mesh(new THREE.CylinderGeometry(pipeR * 1.35, pipeR * 1.35, 1.4, 32), mats.peCasing);
      wrapMesh.rotateZ(Math.PI / 2);
      wrapMesh.position.set(1.1, 0, 0);
      wrapMesh.userData = {
        title: `Термоусаживаемая манжета антикоррозионная ВУС с термоплавким клеем`,
        pos: 3,
        basePos: new THREE.Vector3(1.1, 0, 0),
        explodedPos: new THREE.Vector3(1.1, 1.4, 0)
      };
      g.add(wrapMesh);
      viewer.interactiveMeshes.push(wrapMesh);
    },

    /**
     * 3. Неподвижная опора в монолитном блоке (двухтрубная трасса Т1 / Т2)
     */
    buildFixedAnchorAssembly(viewer, pipeR, ppuR, caseR, d, mats) {
      const g = viewer.modelGroup;
      const pipeDist = caseR * 2.4;

      [-pipeDist / 2, pipeDist / 2].forEach((zPos, idx) => {
        const pipeName = idx === 0 ? 'Т1 (Подающая)' : 'Т2 (Обратная)';

        // Труба
        const pipe = new THREE.Mesh(new THREE.CylinderGeometry(pipeR, pipeR, 5.0, 32), mats.pertPipe);
        pipe.rotateZ(Math.PI / 2);
        pipe.position.set(0, 0, zPos);
        pipe.userData = {
          title: `Труба PE-RT тип II магистрали ${pipeName}`,
          pos: 1,
          basePos: new THREE.Vector3(0, 0, zPos),
          explodedPos: new THREE.Vector3(0, 0, zPos * 1.3)
        };
        g.add(pipe);
        viewer.interactiveMeshes.push(pipe);

        // Изоляция ППУ-ПЭ
        const ppu = new THREE.Mesh(new THREE.CylinderGeometry(caseR, caseR, 4.8, 32), mats.peCasing);
        ppu.rotateZ(Math.PI / 2);
        ppu.position.set(0, 0, zPos);
        ppu.userData = {
          title: `Оболочка ППУ-ПЭ D ${(caseR * 200) | 0} мм ${pipeName}`,
          pos: 1,
          basePos: new THREE.Vector3(0, 0, zPos),
          explodedPos: new THREE.Vector3(0, 0, zPos * 1.3)
        };
        g.add(ppu);
        viewer.interactiveMeshes.push(ppu);

        // Стальной упорный фланец неподвижной опоры (НОП)
        const flange = new THREE.Mesh(new THREE.BoxGeometry(0.3, caseR * 2.8, caseR * 2.8), mats.steelFlange);
        flange.position.set(0, 0, zPos);
        flange.userData = {
          title: `Стальной упорный щит-фланец 10 мм элемента НОП`,
          pos: 1,
          basePos: new THREE.Vector3(0, 0, zPos),
          explodedPos: new THREE.Vector3(0, 0, zPos * 1.3)
        };
        g.add(flange);
        viewer.interactiveMeshes.push(flange);
      });

      // Пространственный арматурный каркас (А500С)
      const cageGroup = new THREE.Group();
      const cageW = 1.8;
      const cageH = 1.6;
      const cageD = pipeDist * 1.8;

      for (let x = -cageW / 2; x <= cageW / 2; x += 0.5) {
        for (let y = -cageH / 2; y <= cageH / 2; y += 0.5) {
          const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, cageD, 8), mats.rebar);
          bar.position.set(x, y, 0);
          cageGroup.add(bar);
        }
      }
      cageGroup.userData = {
        title: `Арматурный каркас упора: арматура 12 А500С ячейка 150х150`,
        pos: 3,
        basePos: new THREE.Vector3(0, 0, 0),
        explodedPos: new THREE.Vector3(0, 2.2, 0)
      };
      g.add(cageGroup);

      // Монолитный железобетонный блок B25
      const concreteBlock = new THREE.Mesh(
        new THREE.BoxGeometry(2.2, 2.0, pipeDist * 2.2),
        mats.concrete
      );
      concreteBlock.position.set(0, 0, 0);
      concreteBlock.userData = {
        title: `Монолитный упорный блок из тяжелого бетона B25 W6 F150`,
        pos: 4,
        basePos: new THREE.Vector3(0, 0, 0),
        explodedPos: new THREE.Vector3(0, -2.6, 0)
      };
      g.add(concreteBlock);
      viewer.interactiveMeshes.push(concreteBlock);
    },

    /**
     * 4. Надземная прокладка на эстакаде в изоляции ППУ-ОЦ
     */
    buildAbovegroundRackAssembly(viewer, pipeR, ppuR, caseR, d, mats) {
      const g = viewer.modelGroup;

      // 4.1 Несущий швеллер горячекатаный (ГОСТ 8240-97)
      const chGroup = new THREE.Group();
      const chLength = 6.0;
      const chW = caseR * 2.2;
      const chH = 0.28;
      const chThick = 0.08;

      // Основание швеллера (стенка)
      const web = new THREE.Mesh(new THREE.BoxGeometry(chLength, chThick, chW), mats.channelSteel);
      web.position.set(0, -caseR - 0.04, 0);
      chGroup.add(web);

      // Боковые полки швеллера
      const f1 = new THREE.Mesh(new THREE.BoxGeometry(chLength, chH, chThick), mats.channelSteel);
      f1.position.set(0, -caseR + chH / 2 - 0.04, chW / 2);
      chGroup.add(f1);

      const f2 = new THREE.Mesh(new THREE.BoxGeometry(chLength, chH, chThick), mats.channelSteel);
      f2.position.set(0, -caseR + chH / 2 - 0.04, -chW / 2);
      chGroup.add(f2);

      chGroup.userData = {
        title: `Несущий горячекатаный швеллер №20П ГОСТ 8240-97`,
        pos: 2,
        basePos: new THREE.Vector3(0, 0, 0),
        explodedPos: new THREE.Vector3(0, -1.2, 0)
      };
      g.add(chGroup);
      viewer.interactiveMeshes.push(web, f1, f2);

      // 4.2 Труба PE-RT тип II внутри
      const pert = new THREE.Mesh(new THREE.CylinderGeometry(pipeR, pipeR, 5.8, 32), mats.pertPipe);
      pert.rotateZ(Math.PI / 2);
      pert.position.set(0, 0, 0);
      pert.userData = {
        title: `Напорная полимерная труба PE-RT тип II SDR 7.4 d${d}`,
        pos: 1,
        basePos: new THREE.Vector3(0, 0, 0),
        explodedPos: new THREE.Vector3(0, 1.4, 0)
      };
      g.add(pert);
      viewer.interactiveMeshes.push(pert);

      // 4.3 Слой ППУ пены
      const ppu = new THREE.Mesh(new THREE.CylinderGeometry(ppuR, ppuR, 5.2, 32), mats.ppuFoam);
      ppu.rotateZ(Math.PI / 2);
      ppu.position.set(0, 0, 0);
      ppu.userData = {
        title: `Теплоизоляционный слой ППУ`,
        pos: 1,
        basePos: new THREE.Vector3(0, 0, 0),
        explodedPos: new THREE.Vector3(0, 0.8, 0)
      };
      g.add(ppu);
      viewer.interactiveMeshes.push(ppu);

      // 4.4 Спирально-навивная оцинкованная оболочка (ППУ-ОЦ)
      const ocCasing = new THREE.Mesh(new THREE.CylinderGeometry(caseR, caseR, 5.0, 32, 1, true), mats.ocCasing);
      ocCasing.rotateZ(Math.PI / 2);
      ocCasing.position.set(0, 0, 0);
      ocCasing.userData = {
        title: `Спирально-навивная защитная оболочка из оцинкованной стали (ПИ-ОЦ)`,
        pos: 1,
        basePos: new THREE.Vector3(0, 0, 0),
        explodedPos: new THREE.Vector3(0, 0, 0)
      };
      g.add(ocCasing);
      viewer.interactiveMeshes.push(ocCasing);

      // 4.5 U-образные хомуты с резьбой М20
      [-1.8, 0, 1.8].forEach(x => {
        const uClampGroup = new THREE.Group();
        const arch = new THREE.Mesh(
          new THREE.TorusGeometry(caseR * 1.05, 0.05, 12, 24, Math.PI),
          mats.fasteners
        );
        arch.position.set(x, 0, 0);
        uClampGroup.add(arch);

        // Резьбовые шпильки вниз
        [-caseR * 1.05, caseR * 1.05].forEach(z => {
          const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.8, 12), mats.fasteners);
          rod.position.set(x, -caseR * 0.5, z);
          uClampGroup.add(rod);
        });

        uClampGroup.userData = {
          title: `Хомут U-образный М20 оцинкованный с гайками и шайбами`,
          pos: 3,
          basePos: new THREE.Vector3(0, 0, 0),
          explodedPos: new THREE.Vector3(0, 1.8, 0)
        };
        g.add(uClampGroup);
      });
    },

    /**
     * 5. Прокладка в защитном футляре под автодорогой (ГНБ)
     */
    buildCasingCrossingAssembly(viewer, pipeR, ppuR, caseR, d, mats) {
      const g = viewer.modelGroup;
      const steelCaseR = caseR * 1.65;

      // 5.1 Стальной защитный футляр в продольном разрезе (полуцилиндр)
      const caseGeom = new THREE.CylinderGeometry(steelCaseR, steelCaseR, 5.5, 32, 1, false, 0, Math.PI * 1.5);
      caseGeom.rotateZ(Math.PI / 2);
      const steelCasing = new THREE.Mesh(caseGeom, mats.casingSteel);
      steelCasing.position.set(0, 0, 0);
      steelCasing.userData = {
        title: `Стальной футляр D ${(steelCaseR * 200) | 0} мм с наружной гидроизоляцией ВУС`,
        pos: 1,
        basePos: new THREE.Vector3(0, 0, 0),
        explodedPos: new THREE.Vector3(0, 0, 1.4)
      };
      g.add(steelCasing);
      viewer.interactiveMeshes.push(steelCasing);

      // 5.2 Внутренняя рабочая труба PE-RT в изоляции ППУ-ПЭ
      const carrier = new THREE.Mesh(new THREE.CylinderGeometry(caseR, caseR, 6.2, 32), mats.peCasing);
      carrier.rotateZ(Math.PI / 2);
      carrier.position.set(0, 0, 0);
      carrier.userData = {
        title: `Труба PE-RT тип II в изоляции ППУ-ПЭ d${d}`,
        pos: 1,
        basePos: new THREE.Vector3(0, 0, 0),
        explodedPos: new THREE.Vector3(0, 0, 0)
      };
      g.add(carrier);
      viewer.interactiveMeshes.push(carrier);

      // Внутренняя напорная труба
      const pertInner = new THREE.Mesh(new THREE.CylinderGeometry(pipeR, pipeR, 6.4, 32), mats.pertPipe);
      pertInner.rotateZ(Math.PI / 2);
      pertInner.position.set(0, 0, 0);
      g.add(pertInner);

      // 5.3 Опорно-направляющие центрирующие кольца (ОНК)
      [-1.5, 0, 1.5].forEach(x => {
        const onkGroup = new THREE.Group();
        const ring = new THREE.Mesh(new THREE.CylinderGeometry(caseR * 1.08, caseR * 1.08, 0.22, 24), mats.onkRing);
        ring.rotateZ(Math.PI / 2);
        ring.position.set(x, 0, 0);
        onkGroup.add(ring);

        // Диэлектрические опорные ролики
        for (let a = 0; a < 6; a++) {
          const ang = (a / 6) * Math.PI * 2;
          const roller = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, (steelCaseR - caseR) * 0.95), mats.fasteners);
          roller.position.set(x, Math.sin(ang) * (caseR + steelCaseR) / 2, Math.cos(ang) * (caseR + steelCaseR) / 2);
          roller.rotation.x = ang;
          onkGroup.add(roller);
        }

        onkGroup.userData = {
          title: `Кольцо опорно-направляющее центрирующее диэлектрическое (ОНК)`,
          pos: 2,
          basePos: new THREE.Vector3(0, 0, 0),
          explodedPos: new THREE.Vector3(0, 1.2, 0)
        };
        g.add(onkGroup);
      });

      // 5.4 Конусные термоусаживаемые манжеты торцов футляра (ТУМ)
      [-2.6, 2.6].forEach((x, i) => {
        const tumGeom = new THREE.CylinderGeometry(
          i === 0 ? steelCaseR * 1.02 : caseR * 1.02,
          i === 0 ? caseR * 1.02 : steelCaseR * 1.02,
          0.5, 32
        );
        tumGeom.rotateZ(Math.PI / 2);
        const tum = new THREE.Mesh(tumGeom, mats.peCasing);
        tum.position.set(x, 0, 0);
        tum.userData = {
          title: `Манжета герметизации торца футляра термоусаживаемая конусная (ТУМ)`,
          pos: 3,
          basePos: new THREE.Vector3(x, 0, 0),
          explodedPos: new THREE.Vector3(i === 0 ? -1.2 : 1.2, 0, 0)
        };
        g.add(tum);
        viewer.interactiveMeshes.push(tum);
      });
    },

    /**
     * 6. Типовой распределительный узел тепловой камеры
     */
    buildHeatChamberAssembly(viewer, pipeR, d, mats) {
      const g = viewer.modelGroup;
      const du = Math.round(d * 0.9);
      const pipeDist = 1.6;

      // Стена тепловой камеры с проходными гильзами
      const wall = new THREE.Mesh(new THREE.BoxGeometry(0.5, 3.2, 4.0), mats.concrete);
      wall.position.set(-2.8, 0, 0);
      wall.userData = {
        title: `Железобетонная стена тепловой камеры с герметичными сальниками`,
        pos: 1,
        basePos: new THREE.Vector3(-2.8, 0, 0),
        explodedPos: new THREE.Vector3(-4.0, 0, 0)
      };
      g.add(wall);
      viewer.interactiveMeshes.push(wall);

      [-pipeDist / 2, pipeDist / 2].forEach((z, i) => {
        const lineName = i === 0 ? 'Т1' : 'Т2';

        // Труба
        const p = new THREE.Mesh(new THREE.CylinderGeometry(pipeR, pipeR, 5.0, 32), mats.pertPipe);
        p.rotateZ(Math.PI / 2);
        p.position.set(0, 0, z);
        p.userData = {
          title: `Магистральная труба ${lineName} PE-RT SDR 7.4`,
          pos: 1,
          basePos: new THREE.Vector3(0, 0, z),
          explodedPos: new THREE.Vector3(0, 0, z * 1.4)
        };
        g.add(p);
        viewer.interactiveMeshes.push(p);

        // Кран шаровой магистральный
        const valve = new THREE.Group();
        const vCore = new THREE.Mesh(new THREE.CylinderGeometry(pipeR * 1.5, pipeR * 1.5, 0.9, 24), mats.valveBody);
        vCore.rotateZ(Math.PI / 2);
        valve.add(vCore);

        // Червячный редуктор со штурвалом
        const gearbox = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.5, 0.4), mats.valveBody);
        gearbox.position.set(0, pipeR * 1.8, 0);
        valve.add(gearbox);

        const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.05, 12, 24), mats.valveAccent);
        wheel.rotateY(Math.PI / 2);
        wheel.position.set(0.2, pipeR * 2.2, 0);
        valve.add(wheel);

        valve.position.set(0.2, 0, z);
        valve.userData = {
          title: `Кран шаровой фланцевый Ду ${du} Ру 16 полнопроходной (${lineName})`,
          pos: 1,
          basePos: new THREE.Vector3(0.2, 0, z),
          explodedPos: new THREE.Vector3(0.2, 1.2, z * 1.4)
        };
        g.add(valve);
        viewer.interactiveMeshes.push(vCore, wheel);

        // Верхний воздушник
        const airVent = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.6, 12), mats.fasteners);
        airVent.position.set(1.4, pipeR + 0.3, z);
        airVent.userData = {
          title: `Штуцер воздушника воздухоудаления с шаровым краном Ду 25`,
          pos: 4,
          basePos: new THREE.Vector3(1.4, pipeR + 0.3, z),
          explodedPos: new THREE.Vector3(1.4, pipeR + 1.2, z * 1.4)
        };
        g.add(airVent);
        viewer.interactiveMeshes.push(airVent);

        // Нижний дренажный спускник
        const drain = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.7, 12), mats.fasteners);
        drain.position.set(-1.0, -pipeR - 0.35, z);
        drain.userData = {
          title: `Дренажный спускник теплоносителя Ду 40 с отводом в приямок`,
          pos: 5,
          basePos: new THREE.Vector3(-1.0, -pipeR - 0.35, z),
          explodedPos: new THREE.Vector3(-1.0, -pipeR - 1.2, z * 1.4)
        };
        g.add(drain);
        viewer.interactiveMeshes.push(drain);
      });
    },

    /**
     * 7. Греющий контур снеготаяния и обогрева полей
     */
    buildSnowMeltingAssembly(viewer, mats) {
      const g = viewer.modelGroup;

      // 7.1 Песчано-гравийная подушка основания
      const baseGround = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.3, 4.2), mats.concrete);
      baseGround.position.set(0, -0.6, 0);
      baseGround.userData = {
        title: `Уплотненное песчано-гравийное основание со слоем теплоизоляции`,
        pos: 1,
        basePos: new THREE.Vector3(0, -0.6, 0),
        explodedPos: new THREE.Vector3(0, -1.8, 0)
      };
      g.add(baseGround);
      viewer.interactiveMeshes.push(baseGround);

      // 7.2 Арматурная сетка укладки труб
      const meshGrid = new THREE.GridHelper(5.6, 18, 0xd97706, 0x78350f);
      meshGrid.position.y = -0.42;
      g.add(meshGrid);

      // 7.3 Контур греющих петель PE-RT d25 / d32
      const loopGroup = new THREE.Group();
      const numPipes = 9;
      const pipeLen = 5.2;

      for (let i = 0; i < numPipes; i++) {
        const z = -1.6 + i * 0.4;
        const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, pipeLen, 16), mats.pertPipe);
        tube.rotateZ(Math.PI / 2);
        tube.position.set(0, -0.36, z);
        loopGroup.add(tube);
      }
      loopGroup.userData = {
        title: `Греющий контур из гибких труб PE-RT тип II d25/d32 мм (шаг укладки 200 мм)`,
        pos: 1,
        basePos: new THREE.Vector3(0, 0, 0),
        explodedPos: new THREE.Vector3(0, 0.5, 0)
      };
      g.add(loopGroup);

      // 7.4 Распределительный латунный/полимерный коллектор
      const manifold = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 3.8, 24), mats.valveAccent);
      manifold.position.set(-2.6, -0.2, 0);
      manifold.userData = {
        title: `Распределительный коллектор с балансировочными клапанами и расходомерами`,
        pos: 2,
        basePos: new THREE.Vector3(-2.6, -0.2, 0),
        explodedPos: new THREE.Vector3(-3.4, -0.2, 0)
      };
      g.add(manifold);
      viewer.interactiveMeshes.push(manifold);

      // 7.5 Верхний песчаный / газонный слой спортивного покрытия
      const turf = new THREE.Mesh(
        new THREE.BoxGeometry(6.2, 0.15, 4.2),
        new THREE.MeshStandardMaterial({ color: 0x065f46, roughness: 0.9, transparent: true, opacity: 0.65 })
      );
      turf.position.set(0, 0.1, 0);
      turf.userData = {
        title: `Спортивное натуральное покрытие / газон с обогревом корневой зоны`,
        pos: 1,
        basePos: new THREE.Vector3(0, 0.1, 0),
        explodedPos: new THREE.Vector3(0, 1.6, 0)
      };
      g.add(turf);
      viewer.interactiveMeshes.push(turf);
    },

    /**
     * Интерактивный Raycasting (наведение и клик на детали узла)
     */
    setupRaycasting(viewer) {
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();
      const canvas = viewer.renderer.domElement;
      const tooltip = document.getElementById(`tooltip-3d-${viewer.solutionId}`);

      let hoveredMesh = null;

      canvas.addEventListener('mousemove', e => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, viewer.camera);
        const intersects = raycaster.intersectObjects(viewer.interactiveMeshes, true);

        if (intersects.length > 0) {
          const hit = intersects[0].object;
          if (hoveredMesh !== hit) {
            if (hoveredMesh && hoveredMesh.material && hoveredMesh.material.emissive) {
              hoveredMesh.material.emissive.setHex(0x000000);
            }
            hoveredMesh = hit;
            if (hit.material && hit.material.emissive) {
              hit.material.emissive.setHex(0x1e3a8a);
            }
          }

          if (tooltip && hit.userData && hit.userData.title) {
            tooltip.style.display = 'block';
            tooltip.style.left = `${e.clientX - rect.left + 15}px`;
            tooltip.style.top = `${e.clientY - rect.top - 35}px`;
            tooltip.innerHTML = `
              <div class="tip-pos">${hit.userData.pos ? 'ПОЗ. ' + hit.userData.pos : 'ИНЖЕНЕРНЫЙ ЭЛЕМЕНТ'}</div>
              <div class="tip-title">${hit.userData.title}</div>
            `;
          }
        } else {
          if (hoveredMesh && hoveredMesh.material && hoveredMesh.material.emissive) {
            hoveredMesh.material.emissive.setHex(0x000000);
          }
          hoveredMesh = null;
          if (tooltip) tooltip.style.display = 'none';
        }
      });

      canvas.addEventListener('mouseleave', () => {
        if (hoveredMesh && hoveredMesh.material && hoveredMesh.material.emissive) {
          hoveredMesh.material.emissive.setHex(0x000000);
        }
        hoveredMesh = null;
        if (tooltip) tooltip.style.display = 'none';
      });

      // При клике на деталь — подсвечиваем соответствующую позицию в таблице BOM
      canvas.addEventListener('click', () => {
        if (hoveredMesh && hoveredMesh.userData && hoveredMesh.userData.pos) {
          const pos = hoveredMesh.userData.pos;
          const container = document.querySelector(`[data-solution-id="${viewer.solutionId}"]`);
          if (container) {
            const row = container.querySelector(`tr:nth-child(${pos})`);
            if (row) {
              row.classList.add('highlight-bom-row');
              setTimeout(() => row.classList.remove('highlight-bom-row'), 2000);
              row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
          }
        }
      });
    },

    /**
     * Переключение режима «Взрыв-схема» (Exploded View)
     */
    toggleExploded(solutionId) {
      const v = this.viewers[solutionId];
      if (!v) return;
      v.isExploded = !v.isExploded;
      
      const btn = document.querySelector(`#btn-exploded-${solutionId}`);
      if (btn) {
        btn.classList.toggle('active', v.isExploded);
      }
    },

    /**
     * Переключение режима «Продольный разрез» (Section View)
     */
    toggleSection(solutionId) {
      const v = this.viewers[solutionId];
      if (!v) return;
      v.isSection = !v.isSection;

      this.applySectionState(v);

      const btn = document.querySelector(`#btn-section-${solutionId}`);
      if (btn) {
        btn.classList.toggle('active', v.isSection);
      }
    },

    applySectionState(viewer) {
      const mats = this.getMaterials();
      const planes = viewer.isSection ? [viewer.sectionPlane] : [];

      // Применяем плоскость сечения к трубе, изоляции и оболочке
      [mats.pertPipe, mats.ppuFoam, mats.peCasing, mats.ocCasing, mats.flangeStub, mats.casingSteel].forEach(m => {
        m.clippingPlanes = planes;
        m.clipShadows = true;
        m.needsUpdate = true;
      });
    },

    /**
     * Сброс ракурса камеры
     */
    resetCamera(solutionId) {
      const v = this.viewers[solutionId];
      if (!v || !v.controls) return;
      v.camera.position.copy(v.defaultCamPos);
      v.controls.target.copy(v.defaultTarget);
      v.controls.update();
    },

    /**
     * Обновление модели при смене диаметра
     */
    updateModel(solutionId, diameter) {
      const v = this.viewers[solutionId];
      if (!v) return;
      v.diameter = diameter;
      this.buildAssembly(v, solutionId, diameter);
    }
  };

  // Экспорт в глобальную область видимости
  window.Solutions3DEngine = Solutions3DEngine;
})();
