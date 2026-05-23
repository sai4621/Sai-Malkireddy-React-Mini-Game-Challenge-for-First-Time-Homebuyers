// Round 0 is the preapproval gate — no house, no competitors.
// Rounds 1–6 each pair a house + seller + 2–3 competing buyer archetypes.
//
// focusTactic: the one competitive tactic the player is coached on before
//   composing their offer. Maps to a tactic explainer card in the UI.
//
// timerSeconds: null means no timer (player can think). Low numbers add pressure.

const rounds = [
  {
    roundNumber: 0,
    houseId: null,
    sellerArchetype: null,
    competitors: [],
    focusTactic: 'financing-posture',
    timerSeconds: null,
    briefing:
      'Before you can make an offer on any home, you need to understand what your ' +
      'financing looks like to a seller. Pre-qualified, pre-approved, and cash all ' +
      'send very different signals. Choose your financing posture — it will follow ' +
      'you through every round.',
  },
  {
    roundNumber: 1,
    houseId: 'h1',
    sellerArchetype: 'relocator',
    competitors: ['cashBuyer', 'family'],
    focusTactic: 'closing-speed',
    timerSeconds: 90,
    briefing:
      'The sellers have already left the state. Every day the house sits empty costs ' +
      'them money. Read the listing carefully — what does this seller actually need? ' +
      'You have 90 seconds to compose your offer.',
  },
  {
    roundNumber: 2,
    houseId: 'h2',
    sellerArchetype: 'sentimentalist',
    competitors: ['family', 'sophisticated'],
    focusTactic: 'financing-strength',
    timerSeconds: null,
    briefing:
      'This owner has lived here for three decades. Personal letters are legally off ' +
      'the table in many markets — but the way you present your financing tells a story ' +
      'about who you are as a buyer. What signals can you send with your offer terms?',
  },
  {
    roundNumber: 3,
    houseId: 'h3',
    sellerArchetype: 'estate',
    competitors: ['cashBuyer', 'lowballer'],
    focusTactic: 'contingency-waiver',
    timerSeconds: 75,
    briefing:
      'An estate sale means no one is home who can answer questions, fix problems, or ' +
      'negotiate repairs. The executor has one job: close quickly and cleanly. ' +
      'Waiving your inspection contingency is a powerful signal here — but understand ' +
      'exactly what you\'re giving up before you do it.',
  },
  {
    roundNumber: 4,
    houseId: 'h4',
    sellerArchetype: 'patient',
    competitors: ['fomoBuyer', 'sophisticated'],
    focusTactic: 'escalation-clause',
    timerSeconds: null,
    briefing:
      'This renovated home has been sitting for 47 days — not because it\'s overpriced ' +
      'by accident, but because the seller is waiting for someone who gets it. ' +
      'A flat offer at asking might be ignored. An escalation clause shows you\'re ' +
      'serious without blindly overpaying.',
  },
  {
    roundNumber: 5,
    houseId: 'h5',
    sellerArchetype: 'flipperFoe',
    competitors: ['cashBuyer', 'sophisticated'],
    focusTactic: 'earnest-money',
    timerSeconds: 60,
    briefing:
      'The LLC selling this property has been burned by buyers who backed out after ' +
      'the inspection re-trade. Earnest money is skin in the game — a larger deposit, ' +
      'especially marked as non-refundable after due diligence, sends a message no ' +
      'cover letter can match. You have 60 seconds.',
  },
  {
    roundNumber: 6,
    houseId: 'h6',
    sellerArchetype: 'distressed',
    competitors: ['family', 'fomoBuyer', 'lowballer'],
    focusTactic: 'full-tactics',
    timerSeconds: null,
    briefing:
      'A short sale with a three-way competitive field. Everything you\'ve learned ' +
      'applies here: financing posture, closing speed, contingency decisions, earnest ' +
      'money, and escalation. The bank reviewing this offer doesn\'t know you — your ' +
      'offer terms are the only language it speaks.',
  },
]

export default rounds
