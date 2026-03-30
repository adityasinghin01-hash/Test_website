'use client'
import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { saveTokens, saveUser } from '@/lib/auth'
import { getUserProfile } from '@/lib/api'

function AuthCallbackInner() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const accessToken = searchParams.get('accessToken')
    const refreshToken = searchParams.get('refreshToken')

    if (!accessToken || !refreshToken) {
      router.replace('/login')
      return
    }

    const decoded = decodeURIComponent(refreshToken)
    saveTokens(accessToken, decoded)

    const fetchAndRedirect = async () => {
      try {
        const response = await getUserProfile() as {
          user?: { email?: string; isVerified?: boolean; isAdmin?: boolean; _id?: string; id?: string }
          email?: string; isVerified?: boolean; isAdmin?: boolean; _id?: string; id?: string
        }
        const profile = response.user || response
        saveUser({
          email: profile.email,
          isVerified: profile.isVerified,
          isAdmin: profile.isAdmin,
          id: profile._id || profile.id,
        })
      } catch (e) {
        console.error('Profile fetch error:', e)
      }
      router.replace('/dashboard')
    }

    fetchAndRedirect()
  }, [router, searchParams])

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        style={{ width: '48px', height: '48px', border: '3px solid rgba(124,58,237,0.3)', borderTopColor: '#7c3aed', borderRadius: '50%' }}
      />
    </main>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <main style={{ minHeight: '100vh', backgroundColor: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '48px', height: '48px', border: '3px solid rgba(124,58,237,0.3)', borderTopColor: '#7c3aed', borderRadius: '50%' }} />
      </main>
    }>
      <AuthCallbackInner />
    </Suspense>
  )
}
