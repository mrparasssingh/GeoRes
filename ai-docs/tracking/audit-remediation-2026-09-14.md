# Tracking: Deep Code Audit Remediation (2026-09-14)

- **Task**: Remediate all 35 issues from deep codebase audit (6 Critical, 8 High, 12 Medium, 9 Low).
- **Date**: 2026-09-14
- **Status**: Completed & Verified

## Scope & Resolutions Matrix

| ID | Severity | Item | Resolution | Verified |
|---|---|---|---|---|
| **C1** | Critical | Unbounded in-memory `JOBS` dict | Added `_evict_stale_jobs()` with `JOB_TTL_SECONDS = 3600` and `MAX_JOBS = 100` cap in `src/server.py`. | Unit test & live server |
| **C2** | Critical | No upload size limit on server | Added `MAX_UPLOAD_BYTES = 100 * 1024 * 1024` check; returns HTTP 413. | Unit test |
| **C3** | Critical | Wildcard CORS `Access-Control-Allow-Origin: *` | Restricted CORS origin to `http://localhost:5173`. | Unit test |
| **C4** | Critical | Stale "SwinIR" keyword in HTML meta | Removed "SwinIR" from `frontend/index.html`. | Browser DOM & build |
| **C5** | Critical | `GradScaler('cuda')` crashes on CPU | Added `use_amp = device.type == "cuda"` guard in `src/train.py`. | Pytest on CPU |
| **C6** | Critical | Unconditional `autocast('cuda')` in predict | Guarded `autocast('cuda')` with `if device.type == "cuda"` in `src/predict.py`. | Pytest |
| **H1** | High | No max image dimension check | Added `MAX_IMAGE_DIM = 4096` guard in `run_super_resolution()`. | Unit test |
| **H2** | High | Factual accuracy of "GeoTIFF" vs "TIFF" | Corrected claims across UI, README, and backend to clarify plain TIFF export. | Browser & README |
| **H3** | High | Inconsistent project naming | Standardized naming to `GeoRes` across repo and documentation. | Repo-wide |
| **H4** | High | Zero test coverage for server/evaluate | Created `test_server.py`, `test_evaluate.py`, and `test_predict.py` (total 21 passing tests). | Full pytest suite |
| **H5** | High | Unconditional `autocast('cuda')` in evaluate | Guarded with `if device.type == "cuda"` in `src/evaluate.py`. | Pytest |
| **H6** | High | Non-functional "RGB + NIR" channel toggle | Removed non-functional NIR toggle from UI and constants. | Browser test |
| **H7** | High | Unused `scikit-learn` and `matplotlib` deps | Removed unused dependencies from `requirements.txt` and `pyproject.toml`. | pip install check |
| **M1** | Medium | Dependency pin divergence | Reconciled version pins across manifests. | Build check |
| **M2** | Medium | Bilinear rotation distortion | Switched to PIL native transpose in `src/dataset.py`. | Pytest |
| **M3-M5** | Medium | Absolute server URLs bypassing proxy | Changed API calls and downloads to relative paths `/api/...` and `/static/...`. | E2E browser test |
| **M6** | Medium | Broad exception catching in server POST | Narrowed to `(ValueError, OSError, RuntimeError)`. | Unit test |
| **M7** | Medium | Stale classifier phases in Test-Checklist | Collapsed legacy phases into informative note. | Checklist review |
| **M8** | Medium | Wrong clone URL in README | Fixed clone URL to `https://github.com/mrparasssingh/GeoRes.git`. | README check |
| **M10** | Medium | Dead `ImageViewer.tsx` code | Deleted unreferenced file. | Git status |
| **L3-L5** | Low | Stale docstrings referencing old classifier | Cleaned docstrings in `model.py`, `predict.py`, `evaluate.py`. | Source review |
| **L6-L7** | Low | package.json metadata | Renamed package to `"geores"`, moved `@types/leaflet` to `devDependencies`. | Frontend build |

## End-to-End Verification
1. **Pytest Suite**: All 21 tests pass in 13.89s.
2. **Frontend Build**: `tsc -b && vite build` completes in 588ms with 0 errors.
3. **Browser E2E**: Verified navigation, sample enhancement processing on GPU, before/after comparison slider, and image downloads with 0 errors.
