# PipePrime Project Guidelines & Directives

## Design & UI Directives: No "Neuroslop"
1. **Never use AI slop decorative pill/capsule badges**:
   - Do NOT wrap subheadings, badges, or tags in rounded capsule borders with borders (`border-radius: 9999px; border: 1px solid ...`).
   - Use clean, elegant, grounded typography for subheadings: e.g. uppercase text with letter-spacing, subtle line/dash accents, and strict industrial styling.
2. **Never use floating gimmick badges**:
   - No floating badges over photos with icons in circles and checkmarks.
3. **Never use AI slop decorative arrow glyphs (`→`, `←`, `->`, `<-`, etc.) in buttons, links, cards, or navigation**:
   - Do NOT append or prepend decorative arrow characters (`→`, `←`, `->`, `<-`, `➔`, `⇒`) to card action links (e.g. use "Открыть раздел каталога", NEVER "Открыть раздел каталога →"), navigation buttons (e.g. use "Вернуться в общий каталог продукции", NEVER "← Вернуться в общий каталог продукции"), or category list items.
   - Professional B2B industrial interfaces rely on clear typographic hierarchy, subtle hover color/underline transitions, and clean layouts rather than generic AI slop decorative arrows.
4. **Intellectual Property Protection**:
   - The proprietary "Альбом технических решений (АТР 2026)" is confidential company IP.
   - Do NOT offer direct public downloads for ATR 2026. Require corporate request via form/modal for certified engineering firms and contractors.
5. **Header Architecture**:
   - Keep header clean, spacious, and dignified.
   - Maximum 5 primary navigation links.
   - Single clickable phone on one line.
   - Cart/Specification drawer button.
   - No duplicate CTA buttons (e.g. no "Заказать звонок" next to phone).
6. **Immediate Push & Production Deploy Rule**:
   - Always immediately commit, push to GitHub (`main`), and deploy changes to the production server upon task completion:
     1. Recompile pages if templates/pages changed: `python build_pages.py`
     2. Commit changes with a clear message: `git commit`
     3. Push to remote: `git push origin main`
     4. Deploy to production server: `ssh root@194.58.118.106 "cd /var/www/pipeprime && ./deploy/deploy.sh docker"`
     5. Verify production container health: `ssh root@194.58.118.106 "docker ps; curl -s http://localhost:8000/api/health"`

