import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Satellite, Menu, X, Zap } from 'lucide-react'
import { AnimatedBackground } from './core/animated-background'
import { Magnetic } from './core/magnetic'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/enhance', label: 'Enhance' },
  { to: '/results', label: 'Results' },
  { to: '/how-it-works', label: 'How It Works' },
]

export default function Navbar() {
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled
          ? 'rgba(255,255,255,0.95)'
          : 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: scrolled ? '1px solid rgba(15,18,51,0.08)' : '1px solid transparent',
        boxShadow: scrolled ? '0 2px 20px rgba(15,18,51,0.06)' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #0f1233 0%, #0d9490 100%)' }}
            >
              <Satellite size={18} className="text-white" />
            </div>
            <div>
              <div className="font-bold text-lg leading-tight" style={{ color: '#0f1233', letterSpacing: '-0.02em' }}>
                GeoSRM
              </div>
              <div className="text-xs leading-tight" style={{ color: '#0f766e', fontWeight: 600 }}>
                AI Super-Resolution
              </div>
            </div>
          </Link>

          {/* Desktop Nav with AnimatedBackground */}
          <nav className="hidden md:flex items-center p-1 rounded-xl bg-slate-100/70 border border-slate-200/60 backdrop-blur-md">
            <AnimatedBackground
              defaultValue={location.pathname}
              value={location.pathname}
              className="rounded-lg bg-white shadow-xs border border-slate-200/80"
              transition={{ type: 'spring', bounce: 0.12, duration: 0.35 }}
              enableHover
            >
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  data-id={link.to}
                  to={link.to}
                  className="px-3.5 py-1.5 text-sm font-semibold transition-colors duration-150"
                  style={{
                    color: location.pathname === link.to ? '#0f766e' : '#475569',
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </AnimatedBackground>
          </nav>

          {/* CTA with Magnetic */}
          <div className="hidden md:flex items-center gap-3">
            <Magnetic intensity={0.25} range={70}>
              <Link to="/enhance" className="btn-primary" style={{ padding: '8px 18px', fontSize: '13px' }}>
                <Zap size={14} />
                Enhance Image
              </Link>
            </Magnetic>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-lg transition-colors"
            style={{ color: '#0f1233' }}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div
          className="md:hidden animate-slide-down"
          style={{
            background: 'rgba(255,255,255,0.98)',
            borderTop: '1px solid rgba(15,18,51,0.06)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div className="px-4 py-3 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="px-4 py-3 rounded-lg text-sm font-medium transition-all"
                style={{
                  color: location.pathname === link.to ? '#0f766e' : '#334155',
                  background: location.pathname === link.to ? 'rgba(15,118,110,0.1)' : 'transparent',
                }}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 pb-1">
              <Link to="/enhance" className="btn-primary w-full" style={{ justifyContent: 'center' }}>
                <Zap size={14} />
                Enhance Image
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
