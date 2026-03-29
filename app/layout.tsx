import type { Metadata } from 'next'
import './globals.css'
import GalaxyBackground from '@/components/GalaxyBackground'
import SmoothScroll from '@/components/SmoothScroll'

export const metadata: Metadata = {
  title: 'Spinx — Explore the Galaxy',
  description: 'Spinx is a next-generation platform. Join the waitlist, read our blog, and connect with us.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{
        backgroundColor: '#0a0a0f',
        color: '#f1f5f9',
        fontFamily: 'Inter, sans-serif',
        margin: 0,
        padding: 0,
        overflowX: 'hidden',
      }}>
        <SmoothScroll>
          <GalaxyBackground />
          {children}
        </SmoothScroll>
      </body>
    </html>
  )
}
