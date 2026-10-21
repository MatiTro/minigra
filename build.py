"""Build the offline, GitHub Pages compatible single-file game."""
from pathlib import Path
import base64, json

ROOT = Path(__file__).resolve().parent
shell = (ROOT / 'src/shell.html').read_text(encoding='utf-8')
for marker, filename in [('STYLE', 'style.css'), ('CORE', 'core.js'), ('WORLD', 'world.js'), ('PHYSICS', 'physics.js'), ('SCENES', 'scenes.js'), ('ART', 'art.js'), ('EFFECTS', 'effects.js'), ('GAME', 'game.js')]:
    source = (ROOT / 'src' / filename).read_text(encoding='utf-8')
    if filename.endswith('.js') and '</script' in source.lower():
        raise ValueError('Unexpected closing script tag in source')
    shell = shell.replace('/* ' + marker + ' */', source)
assets = {}
for key, name in [('portraits', 'wojtek-lider-portraits.png'), ('directions', 'wojtek-lider-directions.png'), ('walk', 'wojtek-lider-walk.png'), ('props', 'warehouse-props.png'), ('truck', 'truck-atlas.png'), ('people', 'warehouse-people.png'), ('contacts', 'contacts-portraits.png'), ('emptyFork', 'forklift-empty.png')]:
    assets[key] = 'data:image/png;base64,' + base64.b64encode((ROOT / 'assets' / name).read_bytes()).decode('ascii')
assets['propMeta'] = json.loads((ROOT / 'assets/warehouse-props.json').read_text())
assets['truckMeta'] = json.loads((ROOT / 'assets/truck-atlas.json').read_text())
shell = shell.replace('/* ASSETS */', 'window.WarehouseAssets=' + json.dumps(assets) + ';')
(ROOT / 'index.html').write_text(shell, encoding='utf-8')
print(f'Built index.html ({len(shell.encode("utf-8")):,} bytes). No external assets.')
