'use client'
import { useEffect, useRef } from 'react'

interface Star {
  x: number
  y: number
  radius: number
  color: string
  alpha: number
  alphaSpeed: number
  vx: number
  vy: number
}

export default function GalaxyBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    let animId: number
    let stars: Star[] = []

    const colors = ['#7c3aed', '#06b6d4', '#ffffff', '#a78bfa', '#67e8f9']

    function initStars() {
      const w = canvas.width = window.innerWidth
      const h = canvas.height = window.innerHeight
      stars = []
      const count = Math.floor((w * h) / 3000)
      for (let i = 0; i < count; i++) {
        const r = Math.random()
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          radius: r < 0.6 ? Math.random() * 1.2 + 0.3 : Math.random() * 2.5 + 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: Math.random() * 0.6 + 0.3,
          alphaSpeed: (Math.random() * 0.004 + 0.001) * (Math.random() > 0.5 ? 1 : -1),
          vx: (Math.random() - 0.5) * 0.08,
          vy: (Math.random() - 0.5) * 0.08,
        })
      }
    }

    function drawStar(star: Star) {
      const grd = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.radius * 3)
      grd.addColorStop(0, star.color + 'ff')
      grd.addColorStop(0.4, star.color + '88')
      grd.addColorStop(1, star.color + '00')

      ctx.beginPath()
      ctx.arc(star.x, star.y, star.radius * 3, 0, Math.PI * 2)
      ctx.fillStyle = grd
      ctx.globalAlpha = star.alpha * 0.4
      ctx.fill()

      ctx.beginPath()
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
      ctx.fillStyle = star.color
      ctx.globalAlpha = star.alpha
      ctx.fill()
    }

    function animate() {
      const w = canvas.width
      const h = canvas.height
      ctx.clearRect(0, 0, w, h)
      ctx.globalAlpha = 1

      for (const star of stars) {
        star.x += star.vx
        star.y += star.vy
        star.alpha += star.alphaSpeed
        if (star.alpha > 0.95 || star.alpha < 0.1) star.alphaSpeed *= -1

        if (star.x < -5) star.x = w + 5
        if (star.x > w + 5) star.x = -5
        if (star.y < -5) star.y = h + 5
        if (star.y > h + 5) star.y = -5

        drawStar(star)
      }

      ctx.globalAlpha = 1
      animId = requestAnimationFrame(animate)
    }

    initStars()
    animate()

    const onResize = () => { initStars() }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        pointerEvents: 'none',
        background: '#0a0a0f',
      }}
    />
  )
}
