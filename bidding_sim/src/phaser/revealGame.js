import { Scene, Game, AUTO } from 'phaser'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', maximumFractionDigits: 0,
  }).format(n)

function clamp(min, val, max) {
  return Math.min(max, Math.max(min, Math.round(val)))
}

// ─── Scene ────────────────────────────────────────────────────────────────────

class RevealScene extends Scene {
  constructor() {
    super({ key: 'RevealScene' })
    // Set by createRevealGame before game starts
    this.offersData = []
    this.onComplete = null
  }

  create() {
    try {
      this._buildCards()
    } catch (e) {
      console.warn('[RevealScene]', e)
      this.onComplete?.()
    }
  }

  _buildCards() {
    const W = this.scale.width
    const H = this.scale.height
    const n = this.offersData.length

    if (n === 0) { this.onComplete?.(); return }

    const PAD = 14
    const GAP = n > 3 ? 8 : 12
    const cW  = Math.floor((W - PAD * 2 - GAP * (n - 1)) / n)
    const cH  = Math.min(210, H - 44)

    this._cW = cW
    this._cH = cH
    this._cards = []

    this.offersData.forEach((offer, i) => {
      const targetX = PAD + i * (cW + GAP) + cW / 2
      const container = this._makeCard(offer, cW, cH)
      container.setPosition(W + cW + 20, H / 2)

      this.tweens.add({
        targets:    container,
        x:          targetX,
        duration:   300,
        delay:      i * 130,
        ease:       'Back.easeOut',
        easeParams: [1.2],
      })

      this._cards.push({ container, offer })
    })

    // Trigger reveal after last card lands + brief pause
    const landedMs = (n - 1) * 130 + 300 + 250
    this.time.delayedCall(landedMs, () => {
      try { this._reveal() } catch { this.onComplete?.() }
    })
  }

  _makeCard(offer, cW, cH) {
    const c = this.add.container(0, 0)

    // ── Background ────────────────────────────────────────────────────────────
    const bgColor = offer.isWinner ? 0xecfdf5 : offer.isPlayer ? 0xeff6ff : 0xffffff
    const bg = this.add.graphics()
    bg.fillStyle(bgColor, 1)
    bg.fillRoundedRect(-cW / 2, -cH / 2, cW, cH, 8)
    c.add(bg)

    // ── Border ────────────────────────────────────────────────────────────────
    const bdrColor  = offer.isWinner ? 0x10b981 : offer.isPlayer ? 0x3b82f6 : 0xdde3ea
    const bdrWidth  = (offer.isWinner || offer.isPlayer) ? 2 : 1
    const bdr = this.add.graphics()
    bdr.lineStyle(bdrWidth, bdrColor, 1)
    bdr.strokeRoundedRect(-cW / 2, -cH / 2, cW, cH, 8)
    c.add(bdr)

    // ── Name ──────────────────────────────────────────────────────────────────
    const nfs = clamp(8, cW / 12, 13)
    const nameObj = this.add.text(0, -cH / 2 + 10, offer.name, {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize:   `${nfs}px`,
      fontStyle:  offer.isPlayer ? 'bold' : 'normal',
      color:      offer.isPlayer ? '#1d4ed8' : '#334155',
      align:      'center',
      wordWrap:   { width: cW - 8 },
    }).setOrigin(0.5, 0)
    c.add(nameObj)

    // ── Score bar ─────────────────────────────────────────────────────────────
    const barW = cW - 18
    const barY = 10

    const barBg = this.add.graphics()
    barBg.fillStyle(0xe2e8f0, 1)
    barBg.fillRoundedRect(-barW / 2, barY, barW, 4, 2)
    c.add(barBg)

    const fillColor = offer.isWinner ? 0x10b981 : offer.isPlayer ? 0x60a5fa : 0x94a3b8
    const barFill = this.add.graphics()
    barFill.fillStyle(fillColor, 1)
    barFill.fillRoundedRect(-barW / 2, barY, Math.max(3, barW * offer.score / 100), 4, 2)
    c.add(barFill)

    const sfs = clamp(7, cW / 18, 10)
    const scoreNum = this.add.text(0, barY + 8, String(offer.score), {
      fontFamily: 'monospace',
      fontSize:   `${sfs}px`,
      color:      '#94a3b8',
      align:      'center',
    }).setOrigin(0.5, 0)
    c.add(scoreNum)

    // ── Price ─────────────────────────────────────────────────────────────────
    const pfs = clamp(8, cW / 13, 12)
    const priceObj = this.add.text(0, cH / 2 - 10, fmt(offer.price), {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize:   `${pfs}px`,
      fontStyle:  'bold',
      color:      '#0f172a',
      align:      'center',
      wordWrap:   { width: cW - 8 },
    }).setOrigin(0.5, 1)
    c.add(priceObj)

    return c
  }

  _reveal() {
    const { _cW, _cH } = this

    this._cards.forEach(({ container, offer }) => {
      if (offer.isWinner) {
        // Multi-layer soft glow behind the card
        for (let l = 3; l >= 1; l--) {
          const g = this.add.graphics()
          g.fillStyle(0x10b981, 0.05 * l)
          g.fillRoundedRect(-_cW / 2 - l * 5, -_cH / 2 - l * 5, _cW + l * 10, _cH + l * 10, 8 + l * 2)
          container.addAt(g, 0)
        }

        // Scale pulse
        this.tweens.add({
          targets:  container,
          scaleX:   1.07,
          scaleY:   1.07,
          duration: 130,
          yoyo:     true,
          repeat:   2,
          ease:     'Sine.easeInOut',
        })

        // WINNER badge after pulse settles (~130 * 5 = 650ms)
        this.time.delayedCall(700, () => {
          const bW     = clamp(36, _cW - 12, 58)
          const badge  = this.add.graphics()
          badge.fillStyle(0x10b981, 1)
          badge.fillRoundedRect(-bW / 2, -7, bW, 14, 3)
          const bLabel = this.add.text(0, 0, 'WINNER', {
            fontFamily: 'system-ui, sans-serif',
            fontSize:   '7px',
            fontStyle:  'bold',
            color:      '#ffffff',
          }).setOrigin(0.5, 0.5)
          const badgeC = this.add.container(0, -_cH / 2 - 9, [badge, bLabel])
          container.add(badgeC)
        })
      } else {
        // Fade out losers
        this.tweens.add({
          targets:  container,
          alpha:    0.38,
          duration: 250,
          ease:     'Linear',
        })
      }
    })

    // Signal React after badge appears and everything settles
    this.time.delayedCall(1000, () => this.onComplete?.())
  }
}

// ─── Factory ──────────────────────────────────────────────────────────────────

export function createRevealGame(container, canvasWidth, offers, onComplete) {
  const scene = new RevealScene()
  scene.offersData = offers
  scene.onComplete  = onComplete

  return new Game({
    type:            AUTO,
    width:           canvasWidth,
    height:          270,
    backgroundColor: '#fafaf9',
    parent:          container,
    banner:          false,
    audio:           { noAudio: true },
    scene:           scene,
  })
}
