'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, CheckCircle, AlertCircle, Sparkles } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { subscribeNewsletter } from '@/lib/api'

const glass: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  border: '1px solid rgba(255,255,255,0.1)',
}

const gradientText: React.CSSProperties = {
  background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
}

export default function NewsletterPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMessage('')
    try {
      await subscribeNewsletter({ email })
      setStatus('success')
      setEmail('')
    } catch (err: unknown) {
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong.')
    }
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'transparent' }}>
      <Navbar />
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '100px 24px 60px',
      }}>
        <div style={{ width: '100%', maxWidth: '480px' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ textAlign: 'center', marginBottom: '40px' }}
          >
            <span style={{
              ...glass,
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '8px 20px', borderRadius: '999px',
              fontSize: '13px', color: '#06b6d4', fontWeight: 500, marginBottom: '20px',
              border: '1px solid rgba(6,182,212,0.3)',
            }}>
              <Mail size={13} /> Stay Updated
            </span>
            <h1 style={{ fontSize: 'clamp(36px, 6vw, 56px)', fontWeight: 900, color: '#f1f5f9', marginBottom: '12px', lineHeight: 1.1 }}>
              Spinx <span style={gradientText}>Newsletter</span>
            </h1>
            <p style={{ fontSize: '16px', color: '#475569', lineHeight: 1.6 }}>
              Get the latest updates, stories, and cosmic insights delivered to your inbox.
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            {status === 'success' ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  ...glass,
                  borderRadius: '24px', padding: '48px 32px', textAlign: 'center',
                  border: '1px solid rgba(6,182,212,0.3)',
                }}
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.6 }}
                  style={{ marginBottom: '20px' }}
                >
                  <CheckCircle size={64} color="#06b6d4" style={{ margin: '0 auto' }} />
                </motion.div>
                <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#f1f5f9', marginBottom: '8px' }}>You're Subscribed!</h2>
                <p style={{ color: '#475569', marginBottom: '24px' }}>Cosmic updates are on their way to your inbox.</p>
                <button
                  onClick={() => setStatus('idle')}
                  style={{
                    ...glass, padding: '12px 28px', borderRadius: '999px',
                    color: '#f1f5f9', fontSize: '14px', cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  Subscribe Another
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
                onSubmit={handleSubmit}
                style={{
                  ...glass, borderRadius: '24px', padding: '36px 32px',
                  display: 'flex', flexDirection: 'column', gap: '20px',
                }}
              >
                {status === 'error' && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '14px', borderRadius: '12px',
                    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                    color: '#f87171', fontSize: '14px',
                  }}>
                    <AlertCircle size={16} /> {errorMessage}
                  </div>
                )}
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#475569', marginBottom: '8px', fontWeight: 500 }}>
                    <Mail size={13} /> Email Address
                  </label>
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                    required placeholder="aditya@example.com"
                    style={{
                      width: '100%', padding: '14px 16px', borderRadius: '12px',
                      background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)',
                      color: '#f1f5f9', fontSize: '15px', outline: 'none',
                      boxSizing: 'border-box', fontFamily: 'Inter, sans-serif',
                      transition: 'border-color 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  />
                </div>
                <p style={{
                  textAlign: 'center', fontSize: '13px', color: '#475569', margin: '0',
                }}>
                  ✨ No spam, ever. Unsubscribe anytime with one click.
                </p>
                <motion.button
                  type="submit"
                  disabled={status === 'loading'}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    padding: '16px', borderRadius: '14px',
                    background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
                    color: '#ffffff', fontWeight: 700, fontSize: '15px',
                    border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                    opacity: status === 'loading' ? 0.7 : 1,
                  }}
                >
                  {status === 'loading' ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }}
                    />
                  ) : (
                    <><Sparkles size={16} /> Subscribe to the Cosmos</>
                  )}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </section>
      <Footer />
    </main>
  )
}
