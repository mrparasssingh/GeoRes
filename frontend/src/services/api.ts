/**
 * Real API service — used when DEMO_MODE = false.
 * Connect to FastAPI backend at API_BASE_URL.
 */
import { API_BASE_URL } from '../utils/constants'
import type { EnhancementJob, EnhancementOptions } from './mockApi'

export async function realEnhanceImage(
  file: File,
  options: EnhancementOptions,
): Promise<{ jobId: string }> {
  const form = new FormData()
  form.append('file', file)
  form.append('scale', String(options.scale))
  form.append('model', options.model)
  form.append('channels', options.channels)

  const res = await fetch(`${API_BASE_URL}/api/enhance`, {
    method: 'POST',
    body: form,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Unknown error' }))
    throw new Error(err.detail ?? `HTTP ${res.status}`)
  }

  return res.json()
}

export async function pollJobStatus(jobId: string): Promise<EnhancementJob> {
  const res = await fetch(`${API_BASE_URL}/api/jobs/${jobId}`)
  if (!res.ok) throw new Error(`Job not found: ${jobId}`)
  return res.json()
}

export async function getResult(jobId: string): Promise<EnhancementJob> {
  const res = await fetch(`${API_BASE_URL}/api/results/${jobId}`)
  if (!res.ok) throw new Error(`Result not found: ${jobId}`)
  return res.json()
}
