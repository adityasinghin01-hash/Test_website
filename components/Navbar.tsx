'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Sparkles, LogIn, LogOut, UserCircle } from 'lucide-react'
import { isLoggedIn, clearAuth, getAccessToken, getRefreshToken } from '@/lib/auth'
import { logoutUser } from '@/lib/api'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/blog', label: 'Blog' },
  { href: '/waitlist', label: 'Waitlist' },
  { href: '/newsletter', label: 'Newsletter' },
  { href: '/contact', label: 'Contact' },
]

const glassStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  borderBottom: '1px solid rgba(255,255,255,0.1)',
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    setLoggedIn(isLoggedIn())
  }, [])

  const handleLogout = async () => {
    const token = getRefreshToken()
    if (token) {
      try { await logoutUser(token) } catch {}
    }
    clearAuth()
    setLoggedIn(false)
    window.location.href = '/'
  }

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        ...(scrolled ? glassStyle : { background: 'transparent' }),
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <motion.div whileHover={{ rotate: 180, scale: 1.1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }}>
              <Sparkles style={{ width: '24px', height: '24px', color: '#7c3aed' }} />
            </motion.div>
            <span style={{
              fontSize: '20px',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>Spinx</span>
          </Link>

          {/* Desktop Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }} className="hidden md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  textDecoration: 'none',
                  color: pathname === link.href ? '#06b6d4' : '#475569',
                  position: 'relative',
                  transition: 'color 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                {link.label}
                {pathname === link.href && (
                  <motion.div
                    layoutId="nav-indicator"
                    style={{
                      position: 'absolute',
                      bottom: '-4px',
                      left: 0,
                      right: 0,
                      height: '1px',
                      background: '#06b6d4',
                    }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Auth Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} className="hidden md:flex">
            {loggedIn ? (
              <>
                <Link href="/profile" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '8px 18px', borderRadius: '999px',
                  background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)',
                  color: '#a78bfa', fontSize: '13px', fontWeight: 600,
                  textDecoration: 'none',
                }}>
                  <UserCircle size={13} /> Profile
                </Link>
                <motion.button
                  onClick={handleLogout}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '8px 18px', borderRadius: '999px',
                    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                    color: '#f87171', fontSize: '13px', fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                  }}
                >
                  <LogOut size={13} /> Sign Out
                </motion.button>
              </>
            ) : (
              <Link href="/login" style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '8px 18px', borderRadius: '999px',
                background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
                color: '#ffffff', fontSize: '13px', fontWeight: 600,
                textDecoration: 'none',
              }}>
                <LogIn size={13} /> Sign In
              </Link>
            )}
          </div>

          {/* Mobile Button */}
          <button
            className="flex md:hidden"
            onClick={() => setIsOpen(!isOpen)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569' }}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ ...glassStyle, borderTop: '1px solid rgba(255,255,255,0.1)' }}
          >
            <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    textDecoration: 'none',
                    color: pathname === link.href ? '#06b6d4' : '#475569',
                    transition: 'color 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  {link.label}
                </Link>
              ))}
              {loggedIn && (
                <Link
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    textDecoration: 'none',
                    color: pathname === '/profile' ? '#a78bfa' : '#475569',
                    transition: 'color 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  Profile
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
