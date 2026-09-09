<p align="center">
  <img src="https://img.shields.io/badge/SIH-2026-blue?style=for-the-badge&logo=government" alt="SIH 2026" />
  <img src="https://img.shields.io/badge/Problem-SIH2614-orange?style=for-the-badge" alt="SIH2614" />
  <img src="https://img.shields.io/badge/PyTorch-2.14+-ee4c2c?style=for-the-badge&logo=pytorch&logoColor=white" alt="PyTorch" />
  <img src="https://img.shields.io/badge/CUDA-RTX_3050-76b900?style=for-the-badge&logo=nvidia&logoColor=white" alt="CUDA" />
  <img src="https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite-8-646cff?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
</p>

<h1 align="center">🛰️ TerraSharp — GeoRes</h1>
<h3 align="center">Deep Learning Super-Resolution for Satellite Imagery</h3>
<p align="center"><em>Smart India Hackathon 2026 · Problem Statement SIH2614</em></p>

---

## 📋 Overview

**TerraSharp (GeoRes)** is an end-to-end deep learning pipeline for enhancing medium-resolution satellite imagery. It takes Sentinel-2 satellite tiles and produces spatially enhanced outputs using a trained SRCNN (Super-Resolution Convolutional Neural Network), served through a real-time API with an interactive React frontend.

| Component | Technology | Purpose |
|-----------|-----------|---------|
| 🧠 **Model** | SRCNN (PyTorch) | 3-layer fully-convolutional super-resolution network (~69K params) |
| ⚡ **Training** | AMP + CUDA | Mixed-precision training on RTX 3050 (6GB VRAM) |
| 🌐 **Backend** | Python HTTP Server | Multi-threaded REST API serving SRCNN on GPU |
| 🎨 **Frontend** | React 19 + Vite + Tailwind | Interactive upload, before/after comparison, downloads |
| 🗺️ **Maps** | Leaflet | Satellite imagery preview with GIS markers |

---

## 🏗️ Architecture

```mermaid
flowchart LR
    A["📤 Upload\nSatellite Image"] --> B["🔄 Bicubic\nUpscale ×4"]
    B --> C["🧠 SRCNN\n3-Layer CNN"]
    C --> D["📥 Enhanced\nOutput"]
    D --> E["🖼️ PNG + TIFF\nDownloads"]

    style A fill:#1e40af,color:#fff
    style C fill:#0d9490,color:#fff
    style E fill:#7c3aed,color:#fff
```

### SRCNN Model Architecture

```
Input (B, 3, H, W)
  │
  ├── Conv2d(3→64, 9×9) + ReLU    ← Patch Extraction
  ├── Conv2d(64→32, 5×5) + ReLU   ← Non-Linear Mapping
  └── Conv2d(32→3, 5×5)           ← Reconstruction
  │
Output (B, 3, H, W)  ← Same spatial size, sharpened
```

- **Parameters**: ~69,200 (~280 KB checkpoint)
- **Loss**: L1 (Mean Absolute Error) — preserves edges better than MSE
- **Training Data**: EuroSAT Sentinel-2 dataset (27,000 tiles, 64×64 RGB)

---

## 🚀 Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- NVIDIA GPU with CUDA support (recommended) or CPU

### 1. Clone & Setup Python Environment

```bash
git clone https://github.com/mrparasssingh/TerraSharp.git
cd TerraSharp

# Create virtual environment
python -m venv .venv

# Activate (Windows)
.venv\Scripts\activate

# Activate (Linux/macOS)
source .venv/bin/activate

# Install PyTorch with CUDA (Windows/Linux — adjust cu126 for your CUDA version)
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu126

# Install remaining dependencies
pip install -r requirements.txt
```

### 2. Download EuroSAT Dataset

```bash
# Using Kaggle CLI (requires Kaggle API token)
kaggle datasets download raoofnaushad/eurosat-sentinel2-dataset -p data/eurosat --unzip
```

Or manually download from [Kaggle](https://www.kaggle.com/datasets/raoofnaushad/eurosat-sentinel2-dataset) and extract to `data/eurosat/Dataset/`.

### 3. Train the Model

```bash
python src/train.py --epochs 30 --batch_size 32 --scale 2
```

Training produces:
- `checkpoints/srcnn_best.pth` — best checkpoint by L1 loss
- `checkpoints/srcnn_last.pth` — final epoch checkpoint
- `checkpoints/sr_training_history.json` — loss history

### 4. Evaluate

```bash
python src/evaluate.py --checkpoint checkpoints/srcnn_best.pth
```

Outputs PSNR comparison: SRCNN vs bicubic baseline.

### 5. Single-Image Inference

```bash
python src/predict.py --image path/to/satellite_tile.jpg --scale 2 --out enhanced.png
```

### 6. Run Automated Tests

```bash
pytest -v
```

---

## 🌐 Web Application

### Start the Backend API

```bash
python src/server.py
# → Server runs on http://localhost:8000
```

### Start the Frontend

```bash
cd frontend
npm install
npm run dev
# → Frontend runs on http://localhost:5173
```

Open `http://localhost:5173` in your browser.

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | GPU status, VRAM usage, model info |
| `POST` | `/api/enhance` | Upload image → returns job ID |
| `GET` | `/api/jobs/{id}` | Poll job status |
| `GET` | `/api/results/{id}` | Get result URLs |
| `GET` | `/api/download/{id}?format=png` | Download enhanced PNG |
| `GET` | `/api/download/{id}?format=geotiff` | Download enhanced TIFF |
| `GET` | `/static/{file}` | Serve static images |

---

## 📁 Project Structure

```
GeoRes/
├── src/
│   ├── model.py           # SRCNN architecture (3-layer FCN, ~69,251 params)
│   ├── dataset.py         # SRDataset — builds degraded/HR pairs on the fly
│   ├── train.py           # Training loop with AMP, checkpointing
│   ├── evaluate.py        # PSNR evaluation vs bicubic baseline
│   ├── predict.py         # Single-image CLI inference
│   └── server.py          # REST API backend (ThreadingHTTPServer)
├── tests/                 # Automated pytest unit test suite
│   ├── test_model.py      # Architecture, parameters, output shape
│   ├── test_dataset.py    # Dataset length, LR/HR tensor pairs
│   └── test_train.py      # Forward/loss/backward optimization loop
├── frontend/
│   ├── src/
│   │   ├── pages/         # HomePage, EnhancePage, ResultsPage, HowItWorksPage
│   │   ├── components/    # Leaflet Map, ComparisonSlider, FileDropzone
│   │   ├── hooks/         # useEnhancement, useJobPolling
│   │   └── services/      # REST API client
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── ai-docs/               # Development documentation
│   ├── Handover.md        # Session-by-session progress log
│   ├── Decisions.md       # Architectural decision record
│   ├── Architecture.md    # System architecture diagram
│   ├── Flow.md            # Execution flow documentation
│   └── Constraints.md     # Project constraints
├── .gitignore
├── requirements.txt
├── pyproject.toml
└── MODEL_FEATURES.md      # Detailed model specs for SIH presentation
```

---

## ⚙️ Technical Specifications

| Spec | Value |
|------|-------|
| Model | SRCNN (Dong et al., 2014) |
| Parameters | ~69,200 |
| Checkpoint Size | ~280 KB |
| Input | RGB satellite tile (any resolution) |
| Output | Enhanced RGB tile (same spatial dims) |
| Scale Factor | Configurable (default 2×, UI uses 4×) |
| Loss Function | L1Loss (MAE) |
| Optimizer | Adam (lr=1e-4) |
| Mixed Precision | AMP with GradScaler (mandatory for 6GB VRAM) |
| Training VRAM | ~5 MB allocated / ~124 MB reserved |
| Training Time | ~1 min/epoch on RTX 3050 |
| Dataset | EuroSAT Sentinel-2 (27,000 tiles, 64×64) |
| Augmentation | Random flips + 90° rotations |

---

## 📊 Training Pipeline

```
EuroSAT 64×64 Tiles
       │
       ▼
  ┌─────────────┐
  │  SRDataset   │ ← On-the-fly degradation (downscale → bicubic upscale)
  │  + Augment   │ ← Random flips, 90° rotations (2× per image)
  └──────┬──────┘
         │ (lr_tensor, hr_tensor) pairs
         ▼
  ┌─────────────┐
  │   SRCNN      │ ← 3 Conv2d layers, ReLU, no pooling
  │   Forward    │
  └──────┬──────┘
         │
         ▼
  ┌─────────────┐
  │  L1 Loss +   │ ← AMP autocast + GradScaler
  │  Adam Step   │
  └──────┬──────┘
         │
         ▼
  Best checkpoint saved by lowest epoch loss
```

---

## 🖥️ Frontend Features

- **Drag & Drop Upload** — Supports GeoTIFF, PNG, JPG up to 100MB
- **Before/After Slider** — Interactive comparison with zoom controls
- **Real-Time Processing** — GPU-accelerated inference with live progress
- **Multiple Downloads** — Enhanced PNG and TIFF formats
- **Demo Mode** — Works offline with bundled sample imagery
- **Leaflet Map** — Satellite imagery preview with India region markers
- **Dark/Light Sections** — Modern glassmorphism design

---

## 🔧 Hardware Requirements

| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| GPU | Any CUDA-capable | NVIDIA RTX 3050+ |
| VRAM | 2 GB | 6 GB |
| RAM | 8 GB | 16 GB |
| Storage | 2 GB (code + dataset) | 5 GB |
| OS | Windows 10 / Linux | Windows 11 / Ubuntu 22.04 |

> **Note**: The model is lightweight enough to run on CPU, but GPU acceleration is strongly recommended for real-time serving.

---

## 👥 Team

**Team 404 Brain Not Found** — Smart India Hackathon 2026

---

## 📄 License

This project was developed as part of the Smart India Hackathon 2026 (SIH2614).

---

<p align="center">
  <strong>Built with 🛰️ by Team 404 Brain Not Found for SIH 2026</strong>
</p>
