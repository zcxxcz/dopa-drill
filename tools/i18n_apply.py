#!/usr/bin/env python3
"""应用 i18n/dict_*.json 到 app/ 源码。单遍替换，长键优先，避免级联误替换。"""
import json, pathlib, re, sys, collections

ROOT = pathlib.Path(__file__).resolve().parent.parent
APP = ROOT / 'app'

def load_dict():
    d = {}
    dup = []
    for f in sorted((ROOT / 'i18n').glob('dict_*.json')):
        for k, v in json.loads(f.read_text(encoding='utf-8')).items():
            if k.startswith('_'):
                continue
            if k in d and d[k] != v:
                dup.append((k, d[k], v))
            d[k] = v
    if dup:
        print('!! 冲突键:', dup)
    return d

def main():
    d = load_dict()
    keys = sorted(d, key=len, reverse=True)
    pat = re.compile('|'.join(re.escape(k) for k in keys))
    counts = collections.Counter()
    files = [APP / 'index.html', APP / 'style.css', *sorted(APP.glob('js/*.js'))]
    for f in files:
        src = f.read_text(encoding='utf-8')
        def sub(m):
            k = m.group(0)
            counts[k] += 1
            return d[k]
        out = pat.sub(sub, src)
        out = out.replace("'ja-JP'", "'zh-CN'")
        if out != src:
            f.write_text(out, encoding='utf-8')
    total = sum(counts.values())
    print(f'替换 {total} 处，命中 {len(counts)}/{len(keys)} 个键')
    unused = [k for k in keys if k not in counts]
    if unused:
        print('\n未命中的键：')
        for k in unused:
            print('  ', k)

if __name__ == '__main__':
    main()
