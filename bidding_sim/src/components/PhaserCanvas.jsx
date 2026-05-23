import { useEffect, useRef } from 'react'

/**
 * Lazy-loads Phaser and runs the RevealScene animation.
 * If Phaser fails to load for any reason, onComplete fires immediately
 * so the rest of RevealScreen is never blocked.
 */
export default function PhaserCanvas({ offers, onComplete }) {
  const containerRef = useRef(null)
  const gameRef      = useRef(null)
  const firedRef     = useRef(false)

  function fire() {
    if (!firedRef.current) {
      firedRef.current = true
      onComplete?.()
    }
  }

  useEffect(() => {
    const el = containerRef.current
    if (!el) { fire(); return }

    const canvasWidth = Math.min(el.offsetWidth || 700, 800)
    let destroyed = false

    import('../phaser/revealGame')
      .then(({ createRevealGame }) => {
        if (destroyed || !containerRef.current) { fire(); return }
        try {
          const game = createRevealGame(containerRef.current, canvasWidth, offers, fire)
          gameRef.current = game
        } catch (e) {
          console.warn('[PhaserCanvas] game creation failed:', e)
          fire()
        }
      })
      .catch((e) => {
        console.warn('[PhaserCanvas] load failed:', e)
        fire()
      })

    // Hard failsafe — unblock RevealScreen after 5s no matter what
    const timeout = setTimeout(fire, 5000)

    return () => {
      destroyed = true
      clearTimeout(timeout)
      if (gameRef.current) {
        try { gameRef.current.destroy(true) } catch {}
        gameRef.current = null
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      ref={containerRef}
      className="w-full overflow-hidden rounded-2xl bg-[#fafaf9]"
      style={{ height: 270 }}
    />
  )
}
