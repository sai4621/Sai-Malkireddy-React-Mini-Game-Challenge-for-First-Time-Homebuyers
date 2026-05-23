// generateOffer(house) → offer object.
// Each archetype uses controlled variance (±small %) so rounds feel distinct.
// Offer shape matches the currentOffer shape in gameStore, plus a label field.

function rand(min, max) {
  return min + Math.random() * (max - min)
}

function pct(base, min, max) {
  return Math.round(base * rand(min, max))
}

const competitors = [
  {
    archetype: 'cashBuyer',
    name: 'Meridian Capital Group',
    description: 'An all-cash buyer — no appraisal risk, no financing contingency, fast close.',
    generateOffer(house) {
      const price = pct(house.askingPrice, 0.99, 1.03)
      return {
        price,
        earnestMoney: Math.round(price * 0.05),
        contingencies: [],
        closingDays: Math.round(rand(14, 18)),
        escalationClause: null,
        personalLetter: false,
        financingType: 'cash',
      }
    },
  },

  {
    archetype: 'family',
    name: 'The Ortega Family',
    description: 'A growing family buying their forever home — emotionally invested, conventionally financed.',
    generateOffer(house) {
      const price = pct(house.askingPrice, 0.96, 1.01)
      return {
        price,
        earnestMoney: Math.round(price * 0.02),
        contingencies: ['inspection', 'financing', 'appraisal'],
        closingDays: Math.round(rand(35, 45)),
        escalationClause: null,
        personalLetter: true,
        financingType: 'conventional',
      }
    },
  },

  {
    archetype: 'fomoBuyer',
    name: 'The Nguyens',
    description: 'Fear-of-missing-out buyers who\'ve lost three prior offers and are swinging big.',
    generateOffer(house) {
      const price = pct(house.askingPrice, 1.04, 1.10)
      const cap = Math.round(house.askingPrice * rand(1.12, 1.16))
      return {
        price,
        earnestMoney: Math.round(price * 0.03),
        contingencies: [],
        closingDays: Math.round(rand(21, 30)),
        escalationClause: { cap, increment: 2000 },
        personalLetter: true,
        financingType: 'conventional',
      }
    },
  },

  {
    archetype: 'lowballer',
    name: 'Sterling Value Partners',
    description: 'A value-seeking buyer who always opens low and loads up on contingencies.',
    generateOffer(house) {
      const price = pct(house.askingPrice, 0.86, 0.92)
      return {
        price,
        earnestMoney: Math.round(price * 0.01),
        contingencies: ['inspection', 'financing', 'appraisal', 'sale-of-home'],
        closingDays: Math.round(rand(45, 60)),
        escalationClause: null,
        personalLetter: false,
        financingType: 'fha',
      }
    },
  },

  {
    archetype: 'sophisticated',
    name: 'The Whitmore Trust',
    description: 'An experienced buyer — pre-approved, strategic escalation, clean but keeps financing.',
    generateOffer(house) {
      const price = pct(house.askingPrice, 1.01, 1.05)
      const cap = Math.round(house.askingPrice * rand(1.07, 1.10))
      return {
        price,
        earnestMoney: Math.round(price * 0.04),
        contingencies: ['financing'],
        closingDays: Math.round(rand(21, 28)),
        escalationClause: { cap, increment: 2500 },
        personalLetter: false,
        financingType: 'conventional',
      }
    },
  },
]

export default competitors
