import { useRef, useState, useCallback, useEffect } from 'react'
import { Upload, Image as ImageIcon, X, FileText } from 'lucide-react'
import { isValidImageFile, formatBytes, getFileFormat, getImagePreview } from '../utils/fileUtils'

interface UploadZoneProps {
  onFileSelect: (file: File, previewUrl: string | null) => void
  onError: (msg: string) => void
  selectedFile: File | null
  previewUrl: string | null
  onClear: () => void
}

export default function UploadZone({ onFileSelect, onError, selectedFile, previewUrl, onClear }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const handleFile = useCallback(async (file: File) => {
    const { valid, error } = isValidImageFile(file)
    if (!valid) {
      onError(error ?? 'Invalid file.')
      return
    }
    // For PNG/JPG: use data URL for preview display
    // For GeoTIFF: getImagePreview returns null, so pass null (EnhancePage creates objectUrl separately)
    const preview = await getImagePreview(file)
    onFileSelect(file, preview)
  }, [onFileSelect, onError])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(true)
  }

  const handleDragLeave = () => setDragging(false)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  // Keyboard accessible drop zone
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click()
  }

  return (
    <div className="w-full">
      {!selectedFile ? (
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload satellite image — click or drag and drop"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          onKeyDown={handleKeyDown}
          className="relative w-full flex flex-col items-center justify-center gap-4 rounded-2xl cursor-pointer transition-all duration-200 select-none"
          style={{
            minHeight: 220,
            border: `2px dashed ${dragging ? '#0d9490' : 'rgba(15,18,51,0.18)'}`,
            background: dragging ? 'rgba(13,148,144,0.04)' : 'rgba(240,244,255,0.5)',
            padding: '40px 24px',
          }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center transition-transform"
            style={{
              background: dragging ? 'rgba(13,148,144,0.12)' : 'rgba(15,18,51,0.06)',
              transform: dragging ? 'scale(1.08)' : 'scale(1)',
            }}
          >
            <Upload size={28} style={{ color: dragging ? '#0d9490' : '#1e2461' }} />
          </div>

          <div className="text-center">
            <p className="font-semibold text-base mb-1" style={{ color: '#0f1233' }}>
              Drag & drop your satellite image here
            </p>
            <p className="text-sm" style={{ color: '#6b7280' }}>
              or{' '}
              <span style={{ color: '#0d9490', fontWeight: 600 }}>browse to choose a file</span>
            </p>
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {['.tif', '.tiff', '.png', '.jpg'].map((ext) => (
              <span key={ext} className="badge badge-navy" style={{ fontSize: '11px' }}>{ext}</span>
            ))}
            <span className="badge badge-teal" style={{ fontSize: '11px' }}>Max 100 MB</span>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept=".tif,.tiff,.png,.jpg,.jpeg,image/tiff,image/png,image/jpeg"
            className="hidden"
            onChange={handleInputChange}
            id="file-upload-input"
          />
        </div>
      ) : (
        <div
          className="w-full rounded-2xl overflow-hidden"
          style={{ border: '1.5px solid rgba(13,148,144,0.2)', background: 'white' }}
        >
          {/* Preview area */}
          <div
            className="relative flex items-center justify-center"
            style={{ height: 200, background: '#f0f4ff' }}
          >
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Uploaded satellite image preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-3 py-8">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(13,148,144,0.1)' }}
                >
                  <FileText size={24} style={{ color: '#0d9490' }} />
                </div>
                <p className="text-sm font-medium" style={{ color: '#1e2461' }}>GeoTIFF — preview not available</p>
                <p className="text-xs" style={{ color: '#9ca3af' }}>Binary raster format — will be processed by the AI pipeline</p>
              </div>
            )}

            {/* Clear button */}
            <button
              onClick={(e) => { e.stopPropagation(); onClear() }}
              className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{ background: 'rgba(255,255,255,0.9)', color: '#0f1233', backdropFilter: 'blur(4px)', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
              aria-label="Remove selected file"
              title="Remove file"
            >
              <X size={15} />
            </button>

            {/* Format badge */}
            <div className="absolute top-3 left-3">
              <span className="badge badge-teal">{getFileFormat(selectedFile.name)}</span>
            </div>
          </div>

          {/* File info */}
          <div className="px-5 py-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(13,148,144,0.1)' }}>
              <ImageIcon size={18} style={{ color: '#0d9490' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate" style={{ color: '#0f1233' }}>{selectedFile.name}</p>
              <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>{formatBytes(selectedFile.size)}</p>
            </div>
            <button
              onClick={() => inputRef.current?.click()}
              className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
              style={{ color: '#0d9490', background: 'rgba(13,148,144,0.08)' }}
            >
              Change
            </button>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept=".tif,.tiff,.png,.jpg,.jpeg,image/tiff,image/png,image/jpeg"
            className="hidden"
            onChange={handleInputChange}
          />
        </div>
      )}
    </div>
  )
}
