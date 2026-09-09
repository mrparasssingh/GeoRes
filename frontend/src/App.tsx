import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import EnhancePage from './pages/EnhancePage'
import ResultsPage from './pages/ResultsPage'
import HowItWorksPage from './pages/HowItWorksPage'

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/enhance" element={<EnhancePage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
