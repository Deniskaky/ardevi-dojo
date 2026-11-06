import pathlib

root = pathlib.Path(r'C:\Users\Admin\.gemini\antigravity\scratch\ardevi-dojo-miniapp')
dist = root / 'dist'
dist.mkdir(exist_ok=True)

css = (root / 'style.css').read_text(encoding='utf-8')
audio_js = (root / 'audio.js').read_text(encoding='utf-8')
tg_js = (root / 'telegram.js').read_text(encoding='utf-8')
quotes_js = (root / 'quotes.js').read_text(encoding='utf-8')
fx_js = (root / 'fx.js').read_text(encoding='utf-8')
app_js = (root / 'app.js').read_text(encoding='utf-8')

html = (root / 'index.html').read_text(encoding='utf-8')
html = html.replace('<link rel="stylesheet" href="style.css">', f'<style>\n{css}\n</style>')

scripts = f"""
  <script>
{audio_js}
  </script>
  <script>
{tg_js}
  </script>
  <script>
{quotes_js}
  </script>
  <script>
{fx_js}
  </script>
  <script>
{app_js}
  </script>
"""

html = html.replace('<script src="audio.js"></script>', '')
html = html.replace('<script src="telegram.js"></script>', '')
html = html.replace('<script src="quotes.js"></script>', '')
html = html.replace('<script src="fx.js"></script>', '')
html = html.replace('<script src="app.js"></script>', scripts)

out_file = dist / 'index.html'
out_file.write_text(html, encoding='utf-8')
print('Bundled single-file dist/index.html created! Size:', len(out_file.read_bytes()), 'bytes')
