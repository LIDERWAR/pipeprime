#!/usr/bin/env python3
"""
PipePrime Enterprise Template Compiler
Компилирует Jinja2-шаблоны из templates/pages в статические HTML файлы корня сайта.
Единый источник компонентов: templates/components/{header.html, footer.html, modals.html, spec_drawer.html}
"""

import os
import glob
import jinja2

PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))
TEMPLATES_DIR = os.path.join(PROJECT_DIR, 'templates')

def build_all():
    env = jinja2.Environment(
        loader=jinja2.FileSystemLoader(TEMPLATES_DIR),
        autoescape=False,
        trim_blocks=True,
        lstrip_blocks=True
    )

    page_files = glob.glob(os.path.join(TEMPLATES_DIR, 'pages', '*.html'))
    print(f">> Building {len(page_files)} pages from templates...")

    for page_path in page_files:
        filename = os.path.basename(page_path)
        rel_template = f"pages/{filename}"
        target_path = os.path.join(PROJECT_DIR, filename)

        template = env.get_template(rel_template)
        rendered_html = template.render()

        with open(target_path, 'w', encoding='utf-8') as f:
            f.write(rendered_html)

        print(f"  [OK] {filename} ({len(rendered_html):,} bytes)")

    print("All pages successfully compiled!")

if __name__ == '__main__':
    build_all()
