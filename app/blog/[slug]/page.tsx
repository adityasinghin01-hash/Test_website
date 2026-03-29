'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Calendar, User, Tag, BookOpen } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { getBlogPostBySlug, BlogPost } from '@/lib/api'

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

export default function BlogPostPage() {
  const params = useParams()
  const slug = params.slug as string

  const [post, setPost] = useState<BlogPost | null>(null)
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!slug) return
    const fetchPost = async () => {
      setStatus('loading')
      try {
        const data = await getBlogPostBySlug(slug)
        setPost(data.post)
        setStatus('success')
      } catch (err: unknown) {
        setStatus('error')
        setErrorMessage(err instanceof Error ? err.message : 'Failed to load post.')
      }
    }
    fetchPost()
  }, [slug])

  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'transparent' }}>
      <Navbar />
      <section style={{ padding: '120px 24px 80px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>

          {/* Back Link */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            style={{ marginBottom: '32px' }}
          >
            <Link
              href="/blog"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                color: '#475569', textDecoration: 'none', fontSize: '14px',
                transition: 'color 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <ArrowLeft size={16} />
              Back to Blog
            </Link>
          </motion.div>

          {/* Loading */}
          {status === 'loading' && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                style={{
                  width: '40px', height: '40px',
                  border: '3px solid rgba(124,58,237,0.3)',
                  borderTopColor: '#7c3aed',
                  borderRadius: '50%',
                }}
              />
            </div>
          )}

          {/* Error */}
          {status === 'error' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ textAlign: 'center', padding: '80px 0' }}
            >
              <BookOpen size={64} color="#475569" style={{ margin: '0 auto 16px' }} />
              <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#f1f5f9', marginBottom: '8px' }}>
                Post Not Found
              </h2>
              <p style={{ color: '#f87171', marginBottom: '24px' }}>{errorMessage}</p>
              <Link
                href="/blog"
                style={{
                  ...glass,
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '12px 24px', borderRadius: '999px',
                  color: '#f1f5f9', textDecoration: 'none', fontSize: '14px',
                }}
              >
                <ArrowLeft size={16} />
                Back to Blog
              </Link>
            </motion.div>
          )}

          {/* Post */}
          {status === 'success' && post && (
            <motion.article
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {/* Tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      padding: '4px 12px', borderRadius: '999px',
                      background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)',
                      fontSize: '12px', color: '#7c3aed',
                    }}
                  >
                    <Tag size={10} />
                    {tag}
                  </span>
                ))}
              </div>

              {/* Title */}
              <h1 style={{
                fontSize: 'clamp(32px, 5vw, 48px)',
                fontWeight: 900,
                color: '#f1f5f9',
                lineHeight: 1.15,
                marginBottom: '24px',
              }}>
                {post.title}
              </h1>

              {/* Meta */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '20px',
                fontSize: '13px', color: '#475569',
                marginBottom: '40px', paddingBottom: '24px',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <User size={14} />
                  {post.author}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={14} />
                  {new Date(post.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>

              {/* Content */}
              <div style={{
                ...glass,
                borderRadius: '24px',
                padding: 'clamp(24px, 4vw, 48px)',
              }}>
                <div
                  style={{
                    color: '#94a3b8',
                    fontSize: '16px',
                    lineHeight: 1.8,
                    wordBreak: 'break-word',
                  }}
                  dangerouslySetInnerHTML={{ __html: post.content || '<p>No content available.</p>' }}
                />
              </div>

              {/* Bottom Nav */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginTop: '40px', paddingTop: '24px',
                borderTop: '1px solid rgba(255,255,255,0.1)',
              }}>
                <Link
                  href="/blog"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    color: '#475569', textDecoration: 'none', fontSize: '14px',
                    transition: 'color 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  <ArrowLeft size={16} />
                  All Posts
                </Link>
                <Link
                  href="/contact"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    padding: '10px 24px', borderRadius: '999px',
                    background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
                    color: '#ffffff', fontSize: '14px', fontWeight: 600,
                    textDecoration: 'none',
                    boxShadow: '0 0 20px rgba(124,58,237,0.3)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  Get in Touch
                </Link>
              </div>
            </motion.article>
          )}
        </div>
      </section>
      <Footer />
    </main>
  )
}
