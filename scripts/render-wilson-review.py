"""Render the additional source/project SVGs into labeled contact sheets for review.
Requires Inkscape and Pillow. Output is intermediate review evidence, not card count.
Usage: python scripts/render-wilson-review.py /tmp/wilson-final-review
"""
import concurrent.futures
import io
import json
import pathlib
import subprocess
import sys
from PIL import Image, ImageDraw, ImageFont
root = pathlib.Path(__file__).resolve().parents[1]
out = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else '/tmp/wilson-final-review')
out.mkdir(parents=True, exist_ok=True)
code = "const fs=require('fs'),vm=require('vm');const s=['wilson-lexicon.js','wilson-image-candidates.js','wilson-vocabulary.js'].map(f=>fs.readFileSync(f,'utf8')).join('\\n');const v=vm.runInNewContext(s+';WILSON_VOCABULARY');const old=new Set(JSON.parse(fs.readFileSync('scripts/wilson-legacy-picture-ids.json','utf8')).map(w=>w.id));console.log(JSON.stringify(v.inputWords.filter(w=>!old.has(w.id)).map(w=>({...w,path:w.imagePath,provider:w.imageCredit?.provider||'mulberry'}))));"
items = json.loads(subprocess.check_output(['node', '-e', code], cwd=root))
def render(w):
    dest = out / (w['id'] + '.png')
    subprocess.run(['inkscape', str(root / w['path']), '--export-type=png', '--export-filename='+str(dest), '--export-width=200', '--export-height=160'], check=True, capture_output=True)
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
    list(pool.map(render, items))
font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 14)
for group in ['mulberry', 'project']:
    batch = [w for w in items if w['provider'] == group]
    for start in range(0, len(batch), 30):
        sheet = Image.new('RGB', (1250, 1440), '#f5f3ec')
        d = ImageDraw.Draw(sheet)
        for j, w in enumerate(batch[start:start+30]):
            x, y = (j % 5)*250, (j // 5)*240
            im = Image.open(out/(w['id']+'.png')).convert('RGBA')
            sheet.paste(im, (x+25, y), im)
            d.text((x+8,y+160), w['id'], font=font, fill='black')
            d.text((x+8,y+181), w['de'], font=font, fill='black')
            d.text((x+8,y+201), w['plural'], font=font, fill='black')
            d.text((x+8,y+220), w['en'][:31], font=font, fill='black')
        sheet.save(out/(group+'-'+str(start//30)+'.jpg'))
print('Rendered',len(items),'SVGs into',out)
