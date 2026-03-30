'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, Lock, LogIn, AlertCircle, Sparkles, Eye, EyeOff } from 'lucide-react'
import Navbar from '@/components/Navbar'
import { loginUser, googleLogin } from '@/lib/api'
import { saveTokens, saveUser } from '@/lib/auth'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: object) => void
          renderButton: (element: HTMLElement, config: object) => void
        }
      }
    }
  }
}

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

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => {
      window.google?.accounts.id.initialize({
        client_id: '674527009797-utvpn71u7uo59keg8m4osjf962je8gdf.apps.googleusercontent.com',
        callback: handleGoogleResponse,
      })
      window.google?.accounts.id.renderButton(
        document.getElementById('google-signin-btn')!,
        { theme: 'filled_black', size: 'large', width: 376, text: 'signin_with' }
      )
    }
    document.body.appendChild(script)
    return () => { document.body.removeChild(script) }
  }, [])

  const handleGoogleResponse = async (response: { credential: string }) => {
    setStatus('loading')
    setErrorMessage('')
    try {
      const data = await googleLogin(response.credential) as {
        accessToken: string
        refreshToken: string
        user: { id: string; email: string; isVerified: boolean }
      }
      saveTokens(data.accessToken, data.refreshToken)
      saveUser(data.user)
      router.push('/dashboard')
    } catch (err: unknown) {
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'Google login failed. Please try again.')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')

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

    setStatus('loading')
    try {
      const data = await loginUser(formData) as {
        accessToken: string
        refreshToken: string
        user: { id: string; email: string; isVerified: boolean }
      }
      saveTokens(data.accessToken, data.refreshToken)
      saveUser(data.user)
      router.push('/dashboard')
    } catch (err: unknown) {
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'Login failed. Please try again.')
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
              Welcome <span style={gradientText}>Back</span>
            </h1>
            <p style={{ fontSize: '15px', color: '#475569' }}>
              Sign in to your Spinx account
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
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  style={{
                    position: 'absolute', right: '14px', top: '50%',
                    transform: 'translateY(-50%)', background: 'none',
                    border: 'none', cursor: 'pointer', color: '#475569',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div style={{ textAlign: 'right', marginTop: '-8px' }}>
              <Link href="/forgot-password" style={{ fontSize: '13px', color: '#7c3aed', textDecoration: 'none' }}>
                Forgot password?
              </Link>
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
                <><LogIn size={16} /> Sign In</>
              )}
            </motion.button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
              <span style={{ fontSize: '13px', color: '#475569' }}>or</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
            </div>

            <div id="google-signin-btn" style={{ display: 'flex', justifyContent: 'center' }} />

            <p style={{ textAlign: 'center', fontSize: '14px', color: '#475569', margin: '0' }}>
              Don't have an account?{' '}
              <Link href="/signup" style={{ color: '#7c3aed', textDecoration: 'none', fontWeight: 600 }}>
                Sign up
              </Link>
            </p>
          </motion.form>
        </div>
      </section>
    </main>
  )
}
