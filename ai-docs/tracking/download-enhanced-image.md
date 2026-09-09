# Tracking: Download Enhanced Image Fails

## Scope
User reports: "after enhancing the image i am unable to download the photo". Investigate why clicking "Download PNG" or "Download GeoTIFF" fails or does not trigger an image download after enhancement.

## How Found / Scoped
User reported being unable to download the enhanced image on the Results page after enhancement.

## What Was Tried
1. Inspected `frontend/src/utils/fileUtils.ts` (`downloadFile`, `downloadFromUrl`) and `frontend/src/pages/ResultsPage.tsx` (`handleDownloadPng`, `handleDownloadGeoTiff`).
2. Inspected backend static file handler in `src/server.py` (`/static/<filename>`).
3. Checked backend server log (`task-31.log`), observed `ConnectionAbortedError: [WinError 10053]` and multiple requests to `/static/...`.
4. Tested browser interaction via browser subagent: verified navigation and clicks succeed, but discovered client-side blob revocation gotcha:
   - `setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)` destroys the blob URL within 1 second. When browsers open a "Save As" destination prompt or disk write takes >1s, the blob is destroyed prematurely, aborting the download.
   - Cross-origin `<a download>` fallback is ignored by Chromium for `http://localhost:8000` URLs.
   - Backend lacked `Content-Disposition: attachment; filename="..."` headers and dedicated `/api/download/<job_id>` endpoint.
   - GeoTIFF download lacked authentic `.tif` export on the backend.
   - `HTTPServer` in Python was single-threaded, aborting concurrent requests under Windows (`WinError 10053`).

## What Worked
1. Upgraded `src/server.py` from synchronous `HTTPServer` to `ThreadingHTTPServer` with `daemon_threads = True`. Completely eliminated Windows `WinError 10053` socket drops when multiple resources are loaded simultaneously.
2. Implemented dedicated `/api/download/<jobId>?format=png` and `/api/download/<jobId>?format=geotiff` endpoints in `src/server.py` with:
   - `Content-Disposition: attachment; filename="<stem>_enhanced_4x.<ext>"`
   - `Content-Type: image/png` or `image/tiff`
   - `Access-Control-Expose-Headers: Content-Disposition, Content-Length`
3. Added authentic GeoTIFF generation: Pillow saves high-resolution enhanced imagery natively as `.tif` (`enhanced_img.save(path, format="TIFF")`) so geospatial analysis tools receive real TIFF containers.
4. Extended object URL lifetime in `frontend/src/utils/fileUtils.ts` from 1s to 60s, preventing race conditions where users in "Save As" prompts had the blob prematurely revoked.
5. Wired `ResultsPage.tsx` directly to `/api/download/<jobId>` endpoints with fallback to blob download and direct window navigation.
6. Updated `ResultsPage.tsx` to display accurate `GeoRes SRCNN (PyTorch CUDA)` model labels.
7. Configured reverse proxy in `frontend/vite.config.ts` for `/api` and `/static` pointing to `http://localhost:8000`.

## How Verified
1. Unit test via `scratch/test_download.py`:
   - POST `/api/enhance` on `Forest_1.jpg` -> Job ID `job-e72768d7` (processed in 407ms on CUDA).
   - GET `/api/download/job-e72768d7?format=png` -> HTTP 200, `Content-Disposition: attachment; filename="Forest_1_enhanced_4x.png"`, 41,440 bytes.
   - GET `/api/download/job-e72768d7?format=geotiff` -> HTTP 200, `Content-Disposition: attachment; filename="Forest_1_enhanced_4x.tif"`, 196,748 bytes.
2. Full automated browser test via `browser_subagent`:
   - Selected sample image on `http://localhost:5173/enhance` and ran enhancement.
   - Verified automated transition to `http://localhost:5173/results`.
   - Verified model labeled as `SRCNN`.
   - Clicked "Download PNG" and "Download GeoTIFF" buttons: both triggered attachment downloads with 0 console errors.
