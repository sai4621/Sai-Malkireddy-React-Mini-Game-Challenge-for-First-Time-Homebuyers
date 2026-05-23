// weights: { price, speed, cleanOffer, earnestMoney, financingStrength }
// Each weight is 0–1; they sum to 1.0.
//
// The scoring engine multiplies each offer attribute by the corresponding weight
// and sums to produce a seller score. Higher = more likely to accept.
//
// NOTE on 'sentimentalist': many jurisdictions bar sellers from factoring
// personal letters into their decision (Fair Housing Act compliance). This
// archetype was redesigned to weight offer *quality signals* — financing
// strength and a clean offer — as proxies for a "right buyer" judgment.

const sellers = [
  {
    archetype: 'relocator',
    displayName: 'The Relocating Exec',
    houseId: 'h1',
    weights: {
      price: 0.20,
      speed: 0.40,
      cleanOffer: 0.20,
      earnestMoney: 0.10,
      financingStrength: 0.10,
    },
    reasoning:
      'My company covers moving costs only through the end of the month. Every week ' +
      'in escrow costs me money and stress I can\'t afford. A 21-day close beats a ' +
      'higher number that drags to 45. Show me a tight timeline and I\'m done.',
    lesson:
      'A tight, committed closing date can beat a higher price when the seller is racing against the calendar.',
  },
  {
    archetype: 'sentimentalist',
    displayName: 'The Long-Time Owner',
    houseId: 'h2',
    weights: {
      price: 0.15,
      speed: 0.10,
      cleanOffer: 0.35,
      earnestMoney: 0.10,
      financingStrength: 0.30,
    },
    reasoning:
      'I can\'t consider a personal letter — my agent told me it opens fair-housing ' +
      'liability. But I can see who\'s serious: a fully pre-approved buyer with a clean ' +
      'offer and real earnest money tells me they\'ve done their homework and won\'t ' +
      'walk away over small things. That\'s what I\'m looking for.',
    lesson:
      'When personal letters are off the table, strong pre-approval and a clean offer become your character reference.',
  },
  {
    archetype: 'estate',
    displayName: 'The Estate Executor',
    houseId: 'h3',
    weights: {
      price: 0.30,
      speed: 0.20,
      cleanOffer: 0.35,
      earnestMoney: 0.10,
      financingStrength: 0.05,
    },
    reasoning:
      'I have attorneys, beneficiaries, and a probate court on my timeline. We cannot ' +
      'negotiate repairs, cannot provide disclosures, and cannot absorb an inspection ' +
      'contingency that lets a buyer re-trade after we\'ve signed. A clean, as-is offer ' +
      'with no contingencies lets me close and distribute the estate. That\'s the offer I\'ll take.',
    lesson:
      'Estate sales reward buyers who waive contingencies and come in clean — the executor cannot repair, negotiate, or delay.',
  },
  {
    archetype: 'patient',
    displayName: 'The Confident Renovator',
    houseId: 'h4',
    weights: {
      price: 0.55,
      speed: 0.05,
      cleanOffer: 0.15,
      earnestMoney: 0.15,
      financingStrength: 0.10,
    },
    reasoning:
      'I spent four years and $190,000 on this house. I\'ve turned down two lowball ' +
      'offers and I\'ll turn down more. I\'m not in a hurry — I have a place to stay. ' +
      'Bring me a number that respects what I built, or don\'t come at all.',
    lesson:
      'A patient seller doesn\'t fear time — only a price that acknowledges the upgrades, backed by an escalation clause, signals you\'re serious.',
  },
  {
    archetype: 'flipperFoe',
    displayName: 'The Investor LLC',
    houseId: 'h5',
    weights: {
      price: 0.35,
      speed: 0.20,
      cleanOffer: 0.20,
      earnestMoney: 0.15,
      financingStrength: 0.10,
    },
    reasoning:
      'I\'ve closed twelve deals. I can read a flaky buyer from the first offer. ' +
      'Inspection contingencies on a renovated property are a re-trade waiting to happen. ' +
      'Show me earnest money that hurts if you back out, conventional or cash financing, ' +
      'and a clean contract. Price matters — but certainty is what wins the deal.',
    lesson:
      'Investors speak in certainty: large earnest money and clean financing signals you\'re committed, not just curious.',
  },
  {
    archetype: 'distressed',
    displayName: 'The Short-Sale Seller',
    houseId: 'h6',
    weights: {
      price: 0.25,
      speed: 0.25,
      cleanOffer: 0.25,
      earnestMoney: 0.10,
      financingStrength: 0.15,
    },
    reasoning:
      'It\'s not my decision — the bank has to approve the price and every term. They ' +
      'need the offer to cover the lender\'s minimum net and they need to know it won\'t ' +
      'fall through in month two of their review process. My hands are tied. A strong, ' +
      'clean offer is the only thing I can put in front of them.',
    lesson:
      'Short sales are bank-driven: the offer must satisfy the lender\'s floor, and clean as-is terms matter more than personal appeal.',
  },
]

export default sellers
