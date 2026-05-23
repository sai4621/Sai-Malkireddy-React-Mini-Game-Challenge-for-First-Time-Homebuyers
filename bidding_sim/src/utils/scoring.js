// ─── Normalization constants ─────────────────────────────────────────────────
//
// Price: a range of ±15% around asking maps linearly to [0, 1].
//   85% of asking  → 0.0  (weak)
//  100% of asking  → 0.5  (neutral)
//  115% of asking  → 1.0  (strong)
//
// Speed: closing timeline in days maps linearly to [0, 1], inverted.
//   60 days → 0.0  (slow)
//   14 days → 1.0  (fast)
//
// Earnest money: normalized against 5% of offer price as the "strong" ceiling.
//   0%  → 0.0
//   5%+ → 1.0
//
const PRICE_FLOOR        = 0.85
const PRICE_CEILING      = 1.15
const CLOSING_FAST_DAYS  = 14
const CLOSING_SLOW_DAYS  = 60
const EARNEST_STRONG_PCT = 0.05

// How much each financing type strengthens an offer in the seller's eyes.
// Pre-qualification is a soft bank opinion; pre-approval is a conditional
// commitment; cash eliminates lender risk entirely.
const FINANCING_STRENGTH = {
  cash:          1.00,
  preapproved:   0.70,
  prequalified:  0.35,
}

// How much each contingency detracts from the cleanOffer score.
// Removal = cleanest possible offer from the seller's perspective.
// The four values sum to 1.0 so a buyer who keeps all of them scores 0.
const CONTINGENCY_COST = {
  'inspection':   0.35,
  'financing':    0.25,
  'appraisal':    0.20,
  'sale-of-home': 0.20,
}

function clamp(v, lo, hi) {
  return Math.min(Math.max(v, lo), hi)
}

// Map competitor financingType → posture string used throughout scoring.
// Competitors using 'conventional' are assumed to be pre-approved (the game
// only fields serious, market-ready buyers as competitors).
function postureFromFinancingType(financingType) {
  if (financingType === 'cash') return 'cash'
  if (financingType === 'conventional') return 'preapproved'
  return 'prequalified'
}

// Resolve escalation clauses before scoring so prices reflect real competition.
// Each escalating offer's effective price becomes:
//   min(highest_competing_price + increment, cap)
// but never less than the offer's own base price.
function resolveEscalations(entries) {
  return entries.map((current, i) => {
    if (!current.offer.escalationClause) return current

    const { cap, increment } = current.offer.escalationClause
    const highestCompeting = Math.max(
      ...entries.filter((_, j) => j !== i).map((e) => e.offer.price),
    )
    const escalatedPrice  = Math.min(highestCompeting + increment, cap)
    const effectivePrice  = Math.max(current.offer.price, escalatedPrice)

    return { ...current, offer: { ...current.offer, price: effectivePrice } }
  })
}

// ─── scoreOffer ───────────────────────────────────────────────────────────────
/**
 * Returns a 0–100 score representing how attractive this offer looks to the
 * given seller.  Each lever is normalized to [0, 1], multiplied by the
 * seller's weight for that lever, and summed.  Because weights sum to ~1,
 * the raw sum is already in [0, 1]; we scale it to [0, 100].
 *
 * @param {object} offer           - currentOffer shape from gameStore
 * @param {object} seller          - seller archetype from sellers.js
 * @param {object} house           - house from houses.js
 * @param {string} financingPosture - 'cash' | 'preapproved' | 'prequalified'
 * @returns {number} integer 0–100
 */
export function scoreOffer(offer, seller, house, financingPosture) {
  // ── 1. Price ────────────────────────────────────────────────────────────────
  const priceRatio = offer.price / house.askingPrice
  const priceNorm  = clamp(
    (priceRatio - PRICE_FLOOR) / (PRICE_CEILING - PRICE_FLOOR),
    0, 1,
  )

  // ── 2. Speed ────────────────────────────────────────────────────────────────
  const closingDays = offer.closingDays ?? 30
  const speedNorm   = clamp(
    (CLOSING_SLOW_DAYS - closingDays) / (CLOSING_SLOW_DAYS - CLOSING_FAST_DAYS),
    0, 1,
  )

  // ── 3. Clean offer ──────────────────────────────────────────────────────────
  // A prequalified buyer cannot meaningfully waive their financing contingency:
  // they have no lender commitment, so a savvy listing agent treats the waiver
  // as unenforceable and mentally adds it back.  We mirror that here.
  const effectiveContingencies = [...(offer.contingencies ?? [])]
  const waivedFinancing = !effectiveContingencies.includes('financing')
  if (waivedFinancing && financingPosture === 'prequalified') {
    effectiveContingencies.push('financing')
  }

  let cleanBase = 1.0
  for (const c of effectiveContingencies) {
    cleanBase -= CONTINGENCY_COST[c] ?? 0.10
  }
  const cleanNorm = clamp(cleanBase, 0, 1)

  // ── 4. Earnest money ────────────────────────────────────────────────────────
  const earnestPct  = (offer.earnestMoney ?? 0) / offer.price
  const earnestNorm = clamp(earnestPct / EARNEST_STRONG_PCT, 0, 1)

  // ── 5. Financing strength ───────────────────────────────────────────────────
  const finStrengthNorm = FINANCING_STRENGTH[financingPosture] ?? 0.35

  // ── Weighted sum → 0–100 ────────────────────────────────────────────────────
  const w   = seller.weights
  const raw =
    priceNorm       * w.price            +
    speedNorm       * w.speed            +
    cleanNorm       * w.cleanOffer       +
    earnestNorm     * w.earnestMoney     +
    finStrengthNorm * w.financingStrength

  return Math.round(raw * 100)
}

// ─── determineWinner ──────────────────────────────────────────────────────────
/**
 * Scores all offers, resolves escalation clauses, and returns the winner.
 *
 * @param {object}   playerOffer        - currentOffer from gameStore
 * @param {Array}    competitorEntries  - [{ archetype, name, offer }]
 * @param {object}   seller             - seller archetype
 * @param {object}   house              - house being bid on
 * @param {string}   financingPosture   - player's financing posture
 *
 * @returns {{ winnerId, allScores, reasoning }}
 *   winnerId   — 'player' or a competitor archetype string
 *   allScores  — [{ id, name, score, offerPrice }] sorted highest first
 *   reasoning  — seller.reasoning string (shown on reveal screen)
 */
export function determineWinner(playerOffer, competitorEntries, seller, house, financingPosture) {
  const allEntries = [
    { id: 'player', name: 'You', offer: playerOffer, posture: financingPosture },
    ...competitorEntries.map((c) => ({
      id:     c.archetype,
      name:   c.name,
      offer:  c.offer,
      posture: postureFromFinancingType(c.offer.financingType),
    })),
  ]

  // Prices may shift here if any offer has an escalation clause
  const resolved = resolveEscalations(allEntries)

  const allScores = resolved
    .map(({ id, name, offer, posture }) => ({
      id,
      name,
      score:      scoreOffer(offer, seller, house, posture),
      offerPrice: offer.price,
    }))
    .sort((a, b) => b.score - a.score)  // highest first for easy display

  // Ties go to the first entry in sorted order; player-favorable because
  // the player entry is listed first and sort is stable in V8.
  const winner = allScores[0]

  return {
    winnerId:  winner.id,
    allScores,
    reasoning: seller.reasoning,
  }
}

// ─── evaluateConsequences ─────────────────────────────────────────────────────
/**
 * Surfaces hidden costs that only appear after closing.  Called with the
 * winning offer; returns costs the player didn't know about at offer time.
 *
 * Two consequence paths:
 *   1. Inspection waived → all of the house's hidden issues become buyer's cost.
 *   2. Appraisal waived + offer > asking by >$10k → appraisal gap is out of pocket.
 *
 * @param {object} winningOffer  - the offer that won
 * @param {object} house         - house from houses.js
 * @returns {{ hiddenCosts: number, consequenceText: string | null }}
 */
export function evaluateConsequences(winningOffer, house) {
  const contingencies = winningOffer.contingencies ?? []
  const narratives    = []
  let   hiddenCosts   = 0

  // ── Inspection waived ───────────────────────────────────────────────────────
  if (!contingencies.includes('inspection') && !contingencies.includes('inspection-3day') && house.hiddenIssues?.length > 0) {
    const total = house.hiddenIssues.reduce((sum, h) => sum + h.repairCost, 0)
    hiddenCosts += total

    const issueList = house.hiddenIssues
      .map((h) => `${h.issue} ($${h.repairCost.toLocaleString()})`)
      .join('; ')

    narratives.push(
      `Three months after closing, you discovered problems a standard inspection would have flagged: ${issueList}.`,
    )
  }

  // ── Appraisal waived with significant overpay ───────────────────────────────
  // The appraisal gap is the difference between what you paid and what the
  // bank's appraiser said the home is worth (proxied here by asking price).
  // With no appraisal contingency you had to cover it in cash at the table.
  const appraisalGap = winningOffer.price - house.askingPrice
  if (!contingencies.includes('appraisal') && appraisalGap > 10000) {
    hiddenCosts += appraisalGap
    narratives.push(
      `The home appraised at the list price of $${house.askingPrice.toLocaleString()}. ` +
      `Because you waived your appraisal contingency, you covered the ` +
      `$${appraisalGap.toLocaleString()} gap in cash at closing.`,
    )
  }

  if (hiddenCosts === 0) {
    return { hiddenCosts: 0, consequenceText: null }
  }

  return {
    hiddenCosts,
    consequenceText:
      narratives.join(' ') +
      ` Total unexpected costs: $${hiddenCosts.toLocaleString()}.`,
  }
}
