"""Extract the supplied PDF; every source character belongs to one experience block."""
from pathlib import Path
from pypdf import PdfReader
import json, re, hashlib, shutil

ROOT = Path(__file__).resolve().parents[1]
PDF = ROOT.parent / '纸环的两面.pdf'

def clean(s):
    s = '\n'.join(line.strip() for line in s.splitlines())
    s = re.sub(r'(?<=[a-zA-Z0-9])\n(?=[a-zA-Z0-9])', ' ', s)
    return re.sub(r' +', ' ', s.replace('\n', ''))

reader = PdfReader(PDF)
pages = [clean(p.extract_text()) for p in reader.pages]
source = ''.join(pages)
page_ends = []
offset = 0
for p in pages:
    offset += len(p)
    page_ends.append(offset)

# Ordered in the PDF, routed to the exhibition's editorial order.
boundaries = [
    (0, '01', 'title', '题名与署名'),
    ('ABSTRACT/摘要', '01', 'abstract', '摘要'),
    ('INDEX TERMS/关键词', '01', 'keywords', '关键词'),
    ('IMPACT STATEMENT/影响声明', '01', 'impact', '影响声明'),
    ('Ⅰ、INTRODUCTION/引言', '02', 'intro', 'Ⅰ 引言'),
    ('在众多依恋类型的组合中', '03', 'ring', 'Ⅰ 引言'),
    ('Ⅱ、ANALYSIS/分析', '04', 'avoidant', 'Ⅱ A 回避型依恋'),
    ('B、焦虑型依恋', '05', 'anxious', 'Ⅱ B 焦虑型依恋'),
    ('C、异地恋', '07', 'distance-1', 'Ⅱ C 异地恋'),
    ('焦虑型依恋者在异地情境下的核心认知模式', '07', 'distance-2', 'Ⅱ C 异地恋'),
    ('于是，他们更频繁地联系', '07', 'distance-3', 'Ⅱ C 异地恋'),
    ('核心在于：焦虑型用自己需要被爱的方式', '07', 'distance-4', 'Ⅱ C 异地恋'),
    ('物理距离天然地减少了', '07', 'distance-5', 'Ⅱ C 异地恋'),
    ('然而，当伴侣因焦虑而步步紧逼时', '07', 'distance-4', 'Ⅱ C 异地恋'),
    ('更为复杂的是，物理距离有时会成为', '07', 'distance-6', 'Ⅱ C 异地恋'),
    ('Ⅲ、DISCUSSION/讨论', '06', 'mirror', 'Ⅲ 讨论'),
    ('我们知道”莫比乌斯环“', '08', 'model', 'Ⅲ 讨论 · 模型'),
    ('A、焦虑型的功课', '09', 'practice-1', 'Ⅲ A 焦虑型的功课'),
    ('B、回避型的功课', '09', 'practice-2', 'Ⅲ B 回避型的功课'),
    ('C、共同的功课', '09', 'practice-3', 'Ⅲ C 共同的功课'),
    ('Ⅳ、CONCLUSIONS/结语', '10', 'conclusion', 'Ⅳ 结语'),
    ('ACKNOWLEDGMENT/致谢', '11', 'dedication', '致谢'),
    ('REFERENCES/参考文献', '12', 'references', '参考文献'),
]
positions = [(key if isinstance(key, int) else source.index(key), ch, group, name) for key,ch,group,name in boundaries]
assert positions == sorted(positions), 'PDF section markers are out of order'
blocks = []
for i, (start,ch,group,name) in enumerate(positions):
    end = positions[i+1][0] if i+1 < len(positions) else len(source)
    section = source[start:end]
    if group == 'dedication':
        pieces = re.split(r'(?=献给)', section)
    elif group == 'references':
        pieces = re.split(r'(?=\[\d\])', section)
    elif group in ['title','abstract','keywords','impact']:
        pieces = [section]
    else:
        sentences = re.findall(r'.*?[。！？](?:[”」"])?|.+$', section)
        pieces, piece = [], ''
        for sentence in sentences:
            if piece and len(piece) + len(sentence) > 260:
                pieces.append(piece)
                piece = ''
            piece += sentence
        if piece: pieces.append(piece)
    cursor = start
    for piece in filter(None, pieces):
        note = None
        if '因此回避型表面上内心担心的是' in piece:
            note = '此处原文写作“回避型”，依照本节上下文，疑为“焦虑型”。原文保留。'
        if '距离越大，焦虑增长越快' in piece:
            note = '原文文字与公式的距离方向相反：在 R、α 不变时，D 增大使 αR/D 减小。演示遵循公式，原文解释保留。'
        if '两极振荡' in piece:
            note = '这组线性方程的特征值为实数，不产生周期振荡。这里保留作者的叙事措辞。'
        blocks.append(dict(id=f'p{len(blocks)+1:03}', chapter=ch, group=group, section=name,
            pages=[j+1 for j,v in enumerate(page_ends) if v>cursor and (j==0 or page_ends[j-1]<cursor+len(piece))],
            start=cursor, end=cursor+len(piece), text=piece, note=note))
        cursor += len(piece)
    assert cursor == end

assert ''.join(b['text'] for b in blocks) == source
data = dict(title='纸环的两面', author='Cannin·Cheung', pdfSha256=hashlib.sha256(PDF.read_bytes()).hexdigest(),
    pageCount=len(pages), characterCount=len(source), source=source, blocks=blocks)
(ROOT/'content').mkdir(exist_ok=True)
(ROOT/'public').mkdir(exist_ok=True)
(ROOT/'content'/'article.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
shutil.copyfile(PDF,ROOT/'public'/'paper.pdf')
print(f'{len(blocks)} blocks; {len(source)} source characters; 10 pages; exact reconstruction PASS')
