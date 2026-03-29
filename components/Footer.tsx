'use client'

import Link from 'next/link'
import { Sparkles } from 'lucide-react'

const footerLinks = [
  { href: '/blog', label: 'Blog' },
  { href: '/waitlist', label: 'Waitlist' },
  { href: '/newsletter', label: 'Newsletter' },
  { href: '/contact', label: 'Contact' },
]

export default function Footer() {
  return (
    <footer style={{
      position: 'relative',
      zIndex: 10,
      marginTop: '80px',
      background: 'rgba(255,255,255,0.03)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      borderTop: '1px solid rgba(255,255,255,0.1)',
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '48px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <Sparkles style={{ width: '20px', height: '20px', color: '#7c3aed' }} />
          <span style={{
            fontSize: '18px',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>Spinx</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                fontSize: '14px',
                color: '#475569',
                textDecoration: 'none',
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <p style={{ fontSize: '14px', color: '#475569' }}>
          © {new Date().getFullYear()} Spinx. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
