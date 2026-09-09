# Tracking: EuroSAT Dataset Ingestion

- **Feature / Task**: Download and organize EuroSAT Sentinel-2 dataset
- **Date Started**: 2026-09-07
- **Status**: Completed

## Context & Scope
Acquire the EuroSAT dataset containing 27,000 Sentinel-2 satellite image patches across 10 land cover classes (AnnualCrop, Forest, HerbaceousVegetation, Highway, Industrial, Pasture, PermanentCrop, Residential, River, SeaLake).

## Dataset Source
- Kaggle slug: `raoofnaushad/eurosat-sentinel2-dataset` (93.5 MB, RGB version)
- Target directory: `data/eurosat/Dataset/` (ignored by git in `.gitignore`)

## Steps & Results
1. Created `data/eurosat` target directory.
2. Executed: `kaggle datasets download -d raoofnaushad/eurosat-sentinel2-dataset -p data/eurosat/ --unzip`.
3. Verified layout:
   - Total files: 27,000 `.jpg` images.
   - 10 classes present: `AnnualCrop`, `Forest`, `HerbaceousVegetation`, `Highway`, `Industrial`, `Pasture`, `PermanentCrop`, `Residential`, `River`, `SeaLake`.
   - Filename format: `<Class>_<Index>.jpg`.

