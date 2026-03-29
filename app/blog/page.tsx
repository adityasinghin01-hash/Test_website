'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, BookOpen, Calendar, User, Tag } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { getBlogPosts, BlogPost } from '@/lib/api'

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

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [slowLoad, setSlowLoad] = useState(false)

  useEffect(() => {
    const fetchPosts = async () => {
      setStatus('loading')
      setSlowLoad(false)
      const slowTimer = setTimeout(() => setSlowLoad(true), 5000)
      try {
        const data = await getBlogPosts(page, 6)
        clearTimeout(slowTimer)
        setPosts(data.posts)
        setTotalPages(data.totalPages)
        setStatus('success')
      } catch (err: unknown) {
        clearTimeout(slowTimer)
        setStatus('error')
        setErrorMessage(err instanceof Error ? err.message : 'Failed to load posts.')
      }
    }
    fetchPosts()
  }, [page])

  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'transparent' }}>
      <Navbar />
      <section style={{ padding: '120px 24px 80px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ textAlign: 'center', marginBottom: '64px' }}
          >
            <span style={{
              ...glass,
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '8px 20px', borderRadius: '999px',
              fontSize: '13px', color: '#7c3aed', fontWeight: 500, marginBottom: '20px',
              border: '1px solid rgba(124,58,237,0.3)',
            }}>
              <BookOpen size={13} /> Spinx Blog
            </span>
            <h1 style={{ fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 900, color: '#f1f5f9', marginBottom: '16px', lineHeight: 1.1 }}>
              Latest <span style={gradientText}>Stories</span>
            </h1>
            <p style={{ fontSize: '18px', color: '#475569', maxWidth: '500px', margin: '0 auto' }}>
              Insights, updates and explorations from the Spinx universe.
            </p>
          </motion.div>

          {status === 'loading' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 0', gap: '16px' }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                style={{ width: '40px', height: '40px', border: '3px solid rgba(124,58,237,0.3)', borderTopColor: '#7c3aed', borderRadius: '50%' }}
              />
              {slowLoad && (
                <p style={{ color: '#475569', fontSize: '14px' }}>
                  ⚡ Waking up the server... this takes ~30s on first load
                </p>
              )}
            </div>
          )}

          {status === 'error' && (
            <div style={{ textAlign: 'center', padding: '80px 0', color: '#f87171' }}>{errorMessage}</div>
          )}

          {status === 'success' && posts.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ textAlign: 'center', padding: '80px 0' }}
            >
              <BookOpen size={64} color="#475569" style={{ margin: '0 auto 16px' }} />
              <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#f1f5f9', marginBottom: '8px' }}>No posts yet</h2>
              <p style={{ color: '#475569' }}>Check back soon for new content from the cosmos.</p>
            </motion.div>
          )}

          {status === 'success' && posts.length > 0 && (
            <>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                gap: '24px',
                marginBottom: '48px',
              }}>
                {posts.map((post, i) => (
                  <motion.article
                    key={post._id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: i * 0.12, ease: [0.25, 0.46, 0.45, 0.94] }}
                    whileHover={{ scale: 1.03, y: -5, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
                    style={{
                      ...glass,
                      borderRadius: '20px',
                      padding: '28px',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'border-color 0.4s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  >
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                      {post.tags.slice(0, 3).map(tag => (
                        <span key={tag} style={{
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          padding: '4px 10px', borderRadius: '999px',
                          background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)',
                          fontSize: '12px', color: '#7c3aed',
                        }}>
                          <Tag size={10} /> {tag}
                        </span>
                      ))}
                    </div>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#f1f5f9', marginBottom: '12px', lineHeight: 1.3 }}>
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6, marginBottom: '20px', flex: 1 }}>
                        {post.excerpt}
                      </p>
                    )}
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)',
                      marginTop: 'auto',
                    }}>
                      <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#475569' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <User size={11} /> {post.author}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={11} /> {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <Link href={`/blog/${post.slug}`} style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        fontSize: '13px', fontWeight: 600, color: '#06b6d4', textDecoration: 'none',
                      }}>
                        Read <ArrowRight size={13} />
                      </Link>
                    </div>
                  </motion.article>
                ))}
              </div>

              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    style={{
                      ...glass, padding: '10px 24px', borderRadius: '999px',
                      color: '#f1f5f9', fontSize: '14px', cursor: page === 1 ? 'not-allowed' : 'pointer',
                      opacity: page === 1 ? 0.4 : 1, fontFamily: 'Inter, sans-serif',
                    }}
                  >Previous</button>
                  <span style={{
                    ...glass, padding: '10px 24px', borderRadius: '999px',
                    color: '#475569', fontSize: '14px',
                  }}>{page} / {totalPages}</span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    style={{
                      ...glass, padding: '10px 24px', borderRadius: '999px',
                      color: '#f1f5f9', fontSize: '14px', cursor: page === totalPages ? 'not-allowed' : 'pointer',
                      opacity: page === totalPages ? 0.4 : 1, fontFamily: 'Inter, sans-serif',
                    }}
                  >Next</button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
      <Footer />
    </main>
  )
}
