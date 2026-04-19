# L2Arctic Files Required for Evaluation

The evaluation page references **21 distinct L2Arctic .wav files**. These must exist at `data/L2Arctic/{speaker}/{utt}.wav` for the XAB and MOS tests to work.

## Files needed (21 total)

Paths are relative to the `Cascaded-FAC-Evaluation/` folder.

### Used by the XAB Similarity Test (12 files, as the reference clip "X")

```
data/L2Arctic/ABA/arctic_a0013.wav
data/L2Arctic/BWC/arctic_a0014.wav
data/L2Arctic/HJK/arctic_a0015.wav
data/L2Arctic/LXC/arctic_a0016.wav
data/L2Arctic/EBVS/arctic_a0017.wav
data/L2Arctic/HQTV/arctic_a0018.wav
data/L2Arctic/ASI/arctic_a0006.wav
data/L2Arctic/LXC/arctic_a0040.wav
data/L2Arctic/TNI/arctic_a0069.wav
data/L2Arctic/TXHC/arctic_b0154.wav
data/L2Arctic/TXHC/arctic_b0490.wav
data/L2Arctic/YKWK/arctic_b0509.wav
```

### Used by the MOS Naturalness Test (9 files, as the `l2` condition)

```
data/L2Arctic/SKA/arctic_a0019.wav
data/L2Arctic/SVBI/arctic_a0020.wav
data/L2Arctic/YDCK/arctic_a0017.wav
data/L2Arctic/TXHC/arctic_a0018.wav
data/L2Arctic/ASI/arctic_a0033.wav
data/L2Arctic/LXC/arctic_a0067.wav
data/L2Arctic/TNI/arctic_a0200.wav
data/L2Arctic/TXHC/arctic_b0492.wav
data/L2Arctic/YKWK/arctic_b0515.wav
```

## How to restore

1. On the machine where you have the original L2-ARCTIC dataset, run `check_L2_files.py` (in this folder) to verify all 21 files exist, then copy them into `data/L2Arctic/{speaker}/` here.
2. If you no longer have the original dataset locally, L2-ARCTIC is freely downloadable at https://psi.engr.tamu.edu/l2-arctic-corpus/ (the full corpus is ~4GB but you only need these 21 files).
3. Commit + push to GitHub. GitHub Pages will redeploy in ~1 minute.

Total size of the 21 files is ~2-4 MB — trivially small for GitHub.

## Quick sanity check

After copying, run `python check_L2_files.py` from `Cascaded-FAC-Evaluation/` — it will report which of the 21 files are present/missing/zero-byte.
