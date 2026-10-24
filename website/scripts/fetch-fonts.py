"""Download self-hosted Noto (Source Han) text subsets; no external font request at runtime."""
from pathlib import Path
import re, urllib.request, urllib.parse, json, concurrent.futures, time, hashlib
ROOT=Path(__file__).resolve().parents[1]
out=ROOT/'public'/'fonts';out.mkdir(exist_ok=True)
text=json.loads((ROOT/'content'/'article.json').read_text(encoding='utf-8'))['source']
for p in list((ROOT/'src').glob('*.ts'))+[ROOT/'scripts'/'render.mjs',ROOT/'scripts'/'journey-art.mjs',ROOT/'scripts'/'connection-art.mjs',ROOT/'scripts'/'narrative-art.mjs',ROOT/'content'/'corrections.json']:
    text+=p.read_text(encoding='utf-8')
chars=sorted(set(text)|set(chr(i) for i in range(32,127)))
existing=(out/'fonts.css').read_text(encoding='utf-8') if (out/'fonts.css').exists() else ''
covered={chr(int(code,16)) for code in re.findall(r'U\+([0-9A-F]+)',existing)}
chars=[c for c in chars if c not in covered]
if not chars:
    print('All article and interface glyphs already self-hosted.');raise SystemExit(0)
chunks=[''.join(chars[i:i+350]) for i in range(0,len(chars),350)]
UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
def fetch(job):
    family,alias,slug,i,chunk=job
    digest=hashlib.sha256(chunk.encode()).hexdigest()[:10]
    name=f'{slug}-{i}-{digest}.woff2'
    codes=','.join(f'U+{ord(c):X}' for c in chunk)
    if (out/name).exists():
        return (f"@font-face{{font-family:'{alias}';font-style:normal;font-weight:400;font-display:swap;src:url('./{name}') format('woff2');unicode-range:{codes}}}",name,None)
    url='https://fonts.googleapis.com/css2?'+urllib.parse.urlencode({'family':family+':wght@400','display':'swap','text':chunk})
    def request(url):
        if 'fonts.gstatic.com' in url or 'fonts.googleapis.com' in url:
            try:return urllib.request.urlopen(urllib.request.Request(url.replace('fonts.gstatic.com','fonts.gstatic.cn').replace('fonts.googleapis.com','fonts.googleapis.cn'),headers={'User-Agent':UA}),timeout=12).read()
            except Exception:pass
        for attempt in range(4):
            try:return urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':UA}),timeout=20).read()
            except Exception:
                if attempt==3:raise
                time.sleep(1)
    css=request(url).decode()
    fonturl=re.search(r'url\((https:[^)]+)\)',css).group(1)
    blob=request(fonturl)
    ext='woff2' if blob[:4]==b'wOF2' else 'woff' if blob[:4]==b'wOFF' else 'ttf'
    name=f'{slug}-{i}-{digest}.{ext}'
    print(f'Ready {name}: {len(blob)} bytes',flush=True)
    return (f"@font-face{{font-family:'{alias}';font-style:normal;font-weight:400;font-display:swap;src:url('./{name}') format('{ext if ext!='ttf' else 'truetype'}');unicode-range:{codes}}}",name,blob)
jobs=[(family,alias,slug,i,c) for family,alias,slug in [('Noto Serif SC','Paper Serif','serif'),('Noto Sans SC','Paper Sans','sans')] for i,c in enumerate(chunks)]
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    results=list(pool.map(fetch,jobs))
for css,name,blob in results:
    if blob is not None:(out/name).write_bytes(blob)
(out/'fonts.css').write_text(existing+'\n'+'\n'.join(item[0] for item in results),encoding='utf-8')
(out/'README.txt').write_text('Noto Serif SC / Noto Sans SC (Source Han family).\nCopyright the Noto / Source Han contributors. SIL Open Font License 1.1.\nSubset files obtained from Google Fonts for this article.\nhttps://github.com/notofonts/noto-cjk\n',encoding='utf-8')
license_url='https://raw.githubusercontent.com/notofonts/noto-cjk/main/Serif/LICENSE'
try:(out/'OFL.txt').write_bytes(urllib.request.urlopen(license_url,timeout=30).read())
except Exception as e:print('License download needs retry:',str(e))
print(f'{len(chars)} glyphs, {len(jobs)} local font subsets; {sum(p.stat().st_size for p in out.iterdir())//1024} KiB')
