"""
Diagnostic: verify all L2Arctic .wav files required by the evaluation page
are present and non-empty under data/L2Arctic/.

Run from the Cascaded-FAC-Evaluation folder:
    python check_L2_files.py
"""
import os
import sys

REQUIRED = [
    # XAB references (12)
    ('ABA',  'arctic_a0013'),
    ('BWC',  'arctic_a0014'),
    ('HJK',  'arctic_a0015'),
    ('LXC',  'arctic_a0016'),
    ('EBVS', 'arctic_a0017'),
    ('HQTV', 'arctic_a0018'),
    ('ASI',  'arctic_a0006'),
    ('LXC',  'arctic_a0040'),
    ('TNI',  'arctic_a0069'),
    ('TXHC', 'arctic_b0154'),
    ('TXHC', 'arctic_b0490'),
    ('YKWK', 'arctic_b0509'),
    # MOS l2 clips (9)
    ('SKA',  'arctic_a0019'),
    ('SVBI', 'arctic_a0020'),
    ('YDCK', 'arctic_a0017'),
    ('TXHC', 'arctic_a0018'),
    ('ASI',  'arctic_a0033'),
    ('LXC',  'arctic_a0067'),
    ('TNI',  'arctic_a0200'),
    ('TXHC', 'arctic_b0492'),
    ('YKWK', 'arctic_b0515'),
]

BASE = os.path.join('data', 'L2Arctic')

present, missing, empty = [], [], []
for spk, utt in REQUIRED:
    p = os.path.join(BASE, spk, utt + '.wav')
    if not os.path.exists(p):
        missing.append(p)
    elif os.path.getsize(p) == 0:
        empty.append(p)
    else:
        present.append(p)

print(f'Checked {len(REQUIRED)} required L2Arctic files under ./{BASE}/')
print(f'  present (non-empty): {len(present)}')
print(f'  missing:             {len(missing)}')
print(f'  zero-byte:           {len(empty)}')

if missing:
    print('\nMISSING FILES:')
    for p in missing:
        print('  ' + p)
if empty:
    print('\nZERO-BYTE FILES (need to re-copy):')
    for p in empty:
        print('  ' + p)

if not missing and not empty:
    print('\nAll 21 L2Arctic files present and non-empty.')
else:
    print('\nRestore the listed L2Arctic files from the L2-ARCTIC corpus.')

# ---- Also scan the other data folders for zero-byte stragglers ----
print('\n--- Quick scan of other data folders for zero-byte .wav files ---')
for sub in ['native-references', 'baselines', os.path.join('outputs', 'P1_QP')]:
    root = os.path.join('data', sub)
    if not os.path.isdir(root):
        print(f'  {root}: (folder not found)')
        continue
    total = zero = 0
    zero_files = []
    for dirpath, _, filenames in os.walk(root):
        for fn in filenames:
            if fn.endswith('.wav'):
                total += 1
                p = os.path.join(dirpath, fn)
                if os.path.getsize(p) == 0:
                    zero += 1
                    zero_files.append(p)
    print(f'  {root}: {total} wav files, {zero} zero-byte')
    for z in zero_files[:10]:
        print('    zero: ' + z)
    if len(zero_files) > 10:
        print(f'    ... and {len(zero_files) - 10} more')

if missing or empty:
    sys.exit(1)
sys.exit(0)
