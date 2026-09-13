import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'

// Route-level code splitting to eliminate monolithic JS bundles on initial load
const HomePage = lazy(() => import('./pages/HomePage'))
const EnhancePage = lazy(() => import('./pages/EnhancePage'))
const ResultsPage = lazy(() => import('./pages/ResultsPage'))
const HowItWorksPage = lazy(() => import('./pages/HowItWorksPage'))

function PageFallback() {
  return (
    <div
      className="pt-24 min-h-[50vh] flex flex-col items-center justify-center gap-3"
      role="status"
      aria-label="Loading page"
    >
      <div className="w-8 h-8 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" />
      <span className="text-xs font-mono text-slate-400">Loading module…</span>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      {/* HTML5 main landmark for assistive technologies & accessibility audit */}
      <main id="main-content" className="flex-1">
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/enhance" element={<EnhancePage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
    </BrowserRouter>
  )
}
