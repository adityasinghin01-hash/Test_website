'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { User, Mail, Shield, LogOut, UserCircle, Calendar, Star } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { getUserProfile, logoutUser } from '@/lib/api'
import { getAccessToken, getRefreshToken, clearAuth } from '@/lib/auth'

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

interface ProfileData {
  email?: string
  isVerified?: boolean
  isAdmin?: boolean
  createdAt?: string
  _id?: string
  id?: string
  [key: string]: unknown
}

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  useEffect(() => {
    const token = getAccessToken()
    if (!token) {
      router.push('/login')
      return
    }
    const fetchProfile = async () => {
      try {
        const response = await getUserProfile() as any
        setProfile(response.user as ProfileData)
        setStatus('success')
      } catch {
        setStatus('error')
      }
    }
    fetchProfile()
  }, [router])

  const handleLogout = async () => {
    const refreshToken = getRefreshToken()
    if (refreshToken) {
      try { await logoutUser(refreshToken) } catch {}
    }
    clearAuth()
    router.push('/')
  }

  const formatDate = (iso?: string) => {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    })
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'transparent' }}>
      <Navbar />
      <section style={{ padding: '120px 24px 80px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ marginBottom: '40px' }}
          >
            <span style={{
              ...glass,
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '8px 20px', borderRadius: '999px',
              fontSize: '13px', color: '#7c3aed', fontWeight: 500, marginBottom: '20px',
              border: '1px solid rgba(124,58,237,0.3)',
            }}>
              <UserCircle size={13} /> Profile
            </span>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              <h1 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 900, color: '#f1f5f9', lineHeight: 1.1 }}>
                Your <span style={gradientText}>Profile</span>
              </h1>
              <motion.button
                onClick={handleLogout}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '12px 24px', borderRadius: '999px',
                  background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                  color: '#f87171', fontSize: '14px', fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                }}
              >
                <LogOut size={15} /> Sign Out
              </motion.button>
            </div>
          </motion.div>

          {status === 'loading' && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                style={{ width: '36px', height: '36px', border: '3px solid rgba(124,58,237,0.3)', borderTopColor: '#7c3aed', borderRadius: '50%' }}
              />
            </div>
          )}

          {status === 'error' && (
            <div style={{
              ...glass, borderRadius: '20px', padding: '28px',
              textAlign: 'center', color: '#f87171',
            }}>
              Failed to load profile. Please try again.
            </div>
          )}

          {status === 'success' && profile && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  style={{ ...glass, borderRadius: '20px', padding: '28px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '12px',
                      background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Mail size={20} color="#7c3aed" />
                    </div>
                    <span style={{ fontSize: '13px', color: '#475569', fontWeight: 500 }}>Email</span>
                  </div>
                  <p style={{ fontSize: '15px', color: '#f1f5f9', fontWeight: 600, wordBreak: 'break-all' }}>
                    {profile.email || '—'}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  style={{ ...glass, borderRadius: '20px', padding: '28px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '12px',
                      background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Shield size={20} color="#06b6d4" />
                    </div>
                    <span style={{ fontSize: '13px', color: '#475569', fontWeight: 500 }}>Verified</span>
                  </div>
                  <p style={{ fontSize: '15px', fontWeight: 600, color: profile.isVerified ? '#4ade80' : '#f87171' }}>
                    {profile.isVerified ? '✓ Email Verified' : '✗ Not Verified'}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  style={{ ...glass, borderRadius: '20px', padding: '28px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '12px',
                      background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Star size={20} color="#7c3aed" />
                    </div>
                    <span style={{ fontSize: '13px', color: '#475569', fontWeight: 500 }}>Role</span>
                  </div>
                  <p style={{ fontSize: '15px', fontWeight: 600, color: profile.isAdmin ? '#a78bfa' : '#f1f5f9' }}>
                    {profile.isAdmin ? '★ Admin' : 'Explorer'}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  style={{ ...glass, borderRadius: '20px', padding: '28px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '12px',
                      background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Calendar size={20} color="#06b6d4" />
                    </div>
                    <span style={{ fontSize: '13px', color: '#475569', fontWeight: 500 }}>Member Since</span>
                  </div>
                  <p style={{ fontSize: '15px', color: '#f1f5f9', fontWeight: 600 }}>
                    {formatDate(profile.createdAt)}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  style={{ ...glass, borderRadius: '20px', padding: '28px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '12px',
                      background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <User size={20} color="#7c3aed" />
                    </div>
                    <span style={{ fontSize: '13px', color: '#475569', fontWeight: 500 }}>User ID</span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#f1f5f9', fontWeight: 600, wordBreak: 'break-all' }}>
                    {profile.id || profile._id || '—'}
                  </p>
                </motion.div>
              </div>
            </>
          )}
        </div>
      </section>
      <Footer />
    </main>
  )
}
