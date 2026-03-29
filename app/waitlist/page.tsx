'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Rocket, CheckCircle, AlertCircle, User, Mail, Sparkles } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { joinWaitlist } from '@/lib/api'

const glass: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  border: '1px solid rgba(255,255,255,0.1)',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '14px 16px',
  borderRadius: '12px',
  background: 'rgba(255,255,255,0.07)',
  border: '1px solid rgba(255,255,255,0.15)',
  color: '#f1f5f9',
  fontSize: '15px',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'Inter, sans-serif',
  transition: 'border-color 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
}

const gradientText: React.CSSProperties = {
  background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
}

export default function WaitlistPage() {
  const [formData, setFormData] = useState({ name: '', email: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [position, setPosition] = useState<number | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')

    if (formData.name.trim().length < 2) {
      setStatus('error')
      setErrorMessage('Name must be at least 2 characters.')
      return
    }

    setStatus('loading')
    try {
      const data = await joinWaitlist(formData) as { position: number }
      setPosition(data.position)
      setStatus('success')
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
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 20px',
              borderRadius: '999px',
              fontSize: '13px',
              color: '#7c3aed',
              fontWeight: 500,
              marginBottom: '20px',
            }}>
              <Rocket size={13} /> Early Access
            </span>
            <h1 style={{ fontSize: 'clamp(36px, 6vw, 56px)', fontWeight: 900, color: '#f1f5f9', marginBottom: '12px', lineHeight: 1.1 }}>
              Join the <span style={gradientText}>Waitlist</span>
            </h1>
            <p style={{ fontSize: '16px', color: '#475569', lineHeight: 1.6 }}>
              Be among the first to explore the Spinx universe.
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
                  borderRadius: '24px',
                  padding: '48px 32px',
                  textAlign: 'center',
                  border: '1px solid rgba(124,58,237,0.3)',
                }}
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.6 }}
                  style={{ marginBottom: '20px' }}
                >
                  <CheckCircle size={64} color="#7c3aed" style={{ margin: '0 auto' }} />
                </motion.div>
                <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#f1f5f9', marginBottom: '8px' }}>You're In!</h2>
                <p style={{ color: '#475569', marginBottom: '24px' }}>Welcome to the Spinx universe, {formData.name}.</p>
                {position && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    style={{
                      display: 'inline-flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      padding: '20px 40px',
                      borderRadius: '16px',
                      background: 'rgba(124,58,237,0.1)',
                      border: '1px solid rgba(124,58,237,0.3)',
                      marginBottom: '20px',
                    }}
                  >
                    <span style={{ fontSize: '13px', color: '#475569', marginBottom: '4px' }}>Your position</span>
                    <span style={{ fontSize: '52px', fontWeight: 900, ...gradientText }}>#{position}</span>
                    <span style={{ fontSize: '13px', color: '#475569', marginTop: '4px' }}>in the galaxy queue</span>
                  </motion.div>
                )}
                <p style={{ fontSize: '13px', color: '#475569' }}>Check your email for confirmation.</p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
                onSubmit={handleSubmit}
                style={{
                  ...glass,
                  borderRadius: '24px',
                  padding: '36px 32px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
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
                    <User size={13} /> Full Name
                  </label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Aditya Singh" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#475569', marginBottom: '8px', fontWeight: 500 }}>
                    <Mail size={13} /> Email Address
                  </label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="aditya@example.com" style={inputStyle} />
                </div>
                <motion.button
                  type="submit"
                  disabled={status === 'loading'}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    padding: '16px', borderRadius: '14px',
                    background: '#7c3aed', color: '#ffffff',
                    fontWeight: 700, fontSize: '15px', border: 'none', cursor: 'pointer',
                    boxShadow: '0 0 24px rgba(124,58,237,0.4)',
                    opacity: status === 'loading' ? 0.7 : 1,
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  {status === 'loading' ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }}
                    />
                  ) : (
                    <><Sparkles size={16} /> Secure My Spot</>
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
