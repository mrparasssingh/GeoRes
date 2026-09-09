# Tracking: EuroSAT Starter Kernel Pull

- **Feature / Task**: Pull and inspect Kaggle starter kernel `kerneler/starter-eurosat-sentinel-2-dataset-0469bae4-9`
- **Date Started**: 2026-09-07
- **Status**: Completed

## Context & Scope
Pull the EuroSAT Sentinel-2 starter kernel to inspect reference code, data layout, and preprocessing approaches for EuroSAT.

## Steps & Results
1. Checked `kaggle` CLI: Installed `kaggle` inside isolated `.venv`.
2. Configured Kaggle access token:
   - Written to `C:\Users\mrpar\.kaggle\access_token`.
   - Set environment variable `KAGGLE_API_TOKEN=KGAT_8b2d357aec51ab4a54cf10b0fc7f0478`.
3. Pulled kernel:
   - Successfully downloaded `starter-eurosat-sentinel-2-dataset-0469bae4-9.ipynb`.
4. Inspection & Findings:
   - The kernel is an automated Kaggle exploratory template (`kerneler` bot).
   - Because EuroSAT is an image dataset organized into class folders rather than tabular CSVs, the bot kernel notes: `There is 0 csv file in the current version of the dataset`.
   - EuroSAT dataset requires an image-based processing pipeline (e.g. PyTorch `torchvision.datasets.EuroSAT` or direct loading of Sentinel-2 band arrays/imagery).
