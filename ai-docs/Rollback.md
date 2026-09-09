# Rollback Protocol

For large or risky changes: which commit to revert to, which files to restore, what to re-check after.

## Setup / Kaggle Kernel Pull Rollback
- To undo pulling starter kernel:
  Remove any generated notebook file (`starter-eurosat-sentinel-2-dataset-0469bae4-9.ipynb`) and `kernel-metadata.json`.

## EuroSAT Dataset Rollback
- Delete the `data/eurosat/` directory and any downloaded `.zip` archive:
  `Remove-Item -Recurse -Force "data/eurosat"`

## Audit Fixes Rollback
- Revert code edits in `src/train.py`, `src/model.py`, `src/dataset.py`, `.gitignore`:
  `git checkout HEAD -- src/ .gitignore`
- Remove newly added package files if rollback needed:
  `Remove-Item -Force requirements.txt, pyproject.toml`

## Download & Server Audit Fix Rollback
- Revert server, frontend utils, and ResultsPage:
  `git checkout HEAD -- src/server.py frontend/src/utils/fileUtils.ts frontend/src/pages/ResultsPage.tsx frontend/vite.config.ts`

