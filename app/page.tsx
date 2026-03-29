'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Zap, Globe, Shield } from 'lucide-react'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const features = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Built on cutting-edge infrastructure for blazing performance across the galaxy.',
  },
  {
    icon: Globe,
    title: 'Universal Access',
    description: 'Connect from anywhere in the universe. Spinx is always online, always ready.',
  },
  {
    icon: Shield,
    title: 'Secure by Design',
    description: 'Military-grade security protecting your data across every dimension.',
  },
  {
    icon: Sparkles,
    title: 'AI Powered',
    description: 'Intelligent systems that learn and adapt to your needs in real time.',
  },
]

const glass = {
  background: 'rgba(255,255,255,0.05)',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  border: '1px solid rgba(255,255,255,0.1)',
}

const gradientText = {
  background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
}

export default function HomePage() {
  return (
    <main style={{ position: 'relative', minHeight: '100vh', backgroundColor: 'transparent' }}>

      <Navbar />

      {/* Hero Section */}
      <section style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 24px',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ textAlign: 'center', maxWidth: '900px', width: '100%' }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ marginBottom: '24px' }}
          >
            <span style={{
              ...glass,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 20px',
              borderRadius: '999px',
              fontSize: '14px',
              color: '#7c3aed',
              fontWeight: 500,
              border: '1px solid rgba(124,58,237,0.3)',
            }}>
              <Sparkles size={14} />
              Welcome to the future
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
              fontSize: 'clamp(48px, 8vw, 96px)',
              fontWeight: 900,
              lineHeight: 1.1,
              marginBottom: '24px',
              color: '#f1f5f9',
            }}
          >
            Welcome to{' '}
            <span style={gradientText}>Spinx</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
              fontSize: '18px',
              color: '#475569',
              maxWidth: '600px',
              margin: '0 auto 40px',
              lineHeight: 1.7,
            }}
          >
            A next-generation platform built for the cosmos. Explore, connect,
            and launch into the future with Spinx.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <Link href="/waitlist" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '16px 32px',
              borderRadius: '999px',
              background: '#7c3aed',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '16px',
              textDecoration: 'none',
              boxShadow: '0 0 20px rgba(124,58,237,0.5)',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            }}>
              Join Waitlist <ArrowRight size={18} />
            </Link>
            <Link href="/blog" style={{
              ...glass,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '16px 32px',
              borderRadius: '999px',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '16px',
              textDecoration: 'none',
            }}>
              Read Blog <ArrowRight size={18} />
            </Link>
          </motion.div>

          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                style={{
                  position: 'absolute',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: i % 2 === 0 ? '#7c3aed' : '#06b6d4',
                  left: `${10 + i * 11}%`,
                  top: `${20 + (i % 3) * 20}%`,
                }}
                animate={{ y: [0, -25, 0], opacity: [0.2, 0.8, 0.2] }}
                transition={{ duration: 4 + i * 0.7, repeat: Infinity, ease: [0.45, 0, 0.55, 1], delay: i * 0.4 }}
              />
            ))}
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section style={{ position: 'relative', zIndex: 10, padding: '96px 24px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ textAlign: 'center', marginBottom: '64px' }}
          >
            <h2 style={{
              fontSize: 'clamp(32px, 5vw, 56px)',
              fontWeight: 800,
              color: '#f1f5f9',
              marginBottom: '16px',
            }}>
              Why <span style={gradientText}>Spinx?</span>
            </h2>
            <p style={{ fontSize: '18px', color: '#475569', maxWidth: '500px', margin: '0 auto' }}>
              Everything you need to launch into the next dimension.
            </p>
          </motion.div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '24px',
          }}>
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.7, delay: i * 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
                whileHover={{ scale: 1.04, y: -6, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
                style={{
                  ...glass,
                  borderRadius: '20px',
                  padding: '28px',
                  cursor: 'default',
                  transition: 'box-shadow 0.4s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'rgba(124,58,237,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                  boxShadow: '0 0 20px rgba(124,58,237,0.3)',
                }}>
                  <feature.icon size={24} color="#7c3aed" />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#f1f5f9', marginBottom: '8px' }}>
                  {feature.title}
                </h3>
                <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6 }}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ position: 'relative', zIndex: 10, padding: '96px 24px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
              ...glass,
              borderRadius: '32px',
              padding: '80px 48px',
              border: '1px solid rgba(124,58,237,0.3)',
              boxShadow: '0 0 40px rgba(124,58,237,0.2)',
            }}
          >
            <h2 style={{
              fontSize: 'clamp(32px, 5vw, 56px)',
              fontWeight: 800,
              color: '#f1f5f9',
              marginBottom: '16px',
            }}>
              Ready to <span style={gradientText}>Launch?</span>
            </h2>
            <p style={{ fontSize: '18px', color: '#475569', marginBottom: '32px' }}>
              Join thousands of explorers already on the waitlist.
            </p>
            <Link href="/waitlist" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '16px 40px',
              borderRadius: '999px',
              background: '#7c3aed',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '16px',
              textDecoration: 'none',
              boxShadow: '0 0 20px rgba(124,58,237,0.5)',
            }}>
              Get Early Access <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
