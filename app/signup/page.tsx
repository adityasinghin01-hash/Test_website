'use client'
import { useState, useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, Lock, UserPlus, AlertCircle, CheckCircle, Sparkles, Eye, EyeOff } from 'lucide-react'
import ReCAPTCHA from 'react-google-recaptcha'
import Navbar from '@/components/Navbar'
import { signupUser } from '@/lib/api'

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
}
const gradientText: React.CSSProperties = {
  background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
}

export default function SignupPage() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const recaptchaRef = useRef<ReCAPTCHA>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')

    if (formData.name.trim().length < 2) {
      setStatus('error')
      setErrorMessage('Please enter your full name.')
      return
    }

    if (!formData.email.includes('@')) {
      setStatus('error')
      setErrorMessage('Please enter a valid email address.')
      return
    }
    if (formData.password.length < 6) {
      setStatus('error')
      setErrorMessage('Password must be at least 6 characters.')
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setStatus('error')
      setErrorMessage('Passwords do not match.')
      return
    }

    const recaptchaToken = recaptchaRef.current?.getValue()
    if (!recaptchaToken) {
      setStatus('error')
      setErrorMessage('Please complete the reCAPTCHA verification.')
      return
    }

    setStatus('loading')
    try {
      await signupUser({ name: formData.name, email: formData.email, password: formData.password, recaptchaToken })
      setStatus('success')
    } catch (err: unknown) {
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'Signup failed. Please try again.')
      recaptchaRef.current?.reset()
    }
  }

  if (status === 'success') {
    return (
      <main style={{ minHeight: '100vh', backgroundColor: 'transparent' }}>
        <Navbar />
        <section style={{
          minHeight: '100vh', display: 'flex',
          alignItems: 'center', justifyContent: 'center', padding: '100px 24px 60px',
        }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              ...glass, borderRadius: '24px', padding: '48px 32px',
              textAlign: 'center', maxWidth: '440px', width: '100%',
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
            <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#f1f5f9', marginBottom: '8px' }}>
              Account Created!
            </h2>
            <p style={{ color: '#475569', marginBottom: '8px', lineHeight: 1.6 }}>
              We sent a verification email to <strong style={{ color: '#f1f5f9' }}>{formData.email}</strong>.
            </p>
            <p style={{ color: '#475569', lineHeight: 1.6 }}>
              Click the link in the email to verify your account and you&apos;ll be taken straight to your dashboard. No login needed.
            </p>
          </motion.div>
        </section>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'transparent' }}>
      <Navbar />
      <section style={{
        minHeight: '100vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center', padding: '100px 24px 60px',
      }}>
        <div style={{ width: '100%', maxWidth: '440px' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ textAlign: 'center', marginBottom: '40px' }}
          >
            <motion.div
              whileHover={{ rotate: 180, scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              style={{ display: 'inline-block', marginBottom: '16px' }}
            >
              <Sparkles style={{ width: '40px', height: '40px', color: '#7c3aed' }} />
            </motion.div>
            <h1 style={{ fontSize: '36px', fontWeight: 900, color: '#f1f5f9', marginBottom: '8px', lineHeight: 1.1 }}>
              Join <span style={gradientText}>Spinx</span>
            </h1>
            <p style={{ fontSize: '15px', color: '#475569' }}>
              Create your account and explore the cosmos
            </p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
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
                <UserPlus size={13} /> Full Name
              </label>
              <input
                type="text" name="name" value={formData.name}
                onChange={handleChange} placeholder="Aditya Singh"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#475569', marginBottom: '8px', fontWeight: 500 }}>
                <Mail size={13} /> Email Address
              </label>
              <input
                type="email" name="email" value={formData.email}
                onChange={handleChange} required placeholder="aditya@example.com"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#475569', marginBottom: '8px', fontWeight: 500 }}>
                <Lock size={13} /> Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password" value={formData.password}
                  onChange={handleChange} required placeholder="••••••••"
                  style={{ ...inputStyle, paddingRight: '48px' }}
                />
                <button type="button" onClick={() => setShowPassword(p => !p)}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#475569' }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#475569', marginBottom: '8px', fontWeight: 500 }}>
                <Lock size={13} /> Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  name="confirmPassword" value={formData.confirmPassword}
                  onChange={handleChange} required placeholder="••••••••"
                  style={{ ...inputStyle, paddingRight: '48px' }}
                />
                <button type="button" onClick={() => setShowConfirm(p => !p)}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#475569' }}>
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey="6Lfv25wsAAAAAD9Dtmb4Mh6GkhORHT3IsKX8mw_2"
                theme="dark"
              />
            </div>

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
                <><UserPlus size={16} /> Create Account</>
              )}
            </motion.button>

            <p style={{ textAlign: 'center', fontSize: '14px', color: '#475569', margin: '0' }}>
              Already have an account?{' '}
              <Link href="/login" style={{ color: '#7c3aed', textDecoration: 'none', fontWeight: 600 }}>
                Sign in
              </Link>
            </p>
          </motion.form>
        </div>
      </section>
    </main>
  )
}
