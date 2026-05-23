export const TUTORIAL_ASKING_PRICE = 600000

const tutorialSteps = [
  {
    leverId:     'price',
    title:       'Offer Price',
    description: 'Your headline number. It signals how badly you want the home — but every dollar above asking comes straight out of your pocket.',
    tradeoff:    'Overbidding wins houses, but it costs real money. Underbidding loses them.',
    defaultValue: TUTORIAL_ASKING_PRICE,
    getSellerReaction(value) {
      const pct = ((value - TUTORIAL_ASKING_PRICE) / TUTORIAL_ASKING_PRICE) * 100
      if (pct >= 8)  return { interestLevel: 5, reactionText: 'This offer stands alone. I\'m seriously considering it.' }
      if (pct >= 3)  return { interestLevel: 4, reactionText: 'Strong price. This buyer means business.' }
      if (pct >= 0)  return { interestLevel: 3, reactionText: 'At asking — fair, but I\'ll weigh it against the others.' }
      if (pct >= -3) return { interestLevel: 2, reactionText: 'Below asking. I need to see something else that compensates.' }
      return { interestLevel: 1, reactionText: 'Too low. This isn\'t going to work.' }
    },
  },
  {
    leverId:     'earnest',
    title:       'Earnest Money',
    description: 'A good-faith deposit that goes toward your down payment at closing. Sellers read it as a signal of how committed you are.',
    tradeoff:    'Higher earnest money builds trust — but if you back out improperly, you could forfeit it.',
    defaultValue: 2,
    getSellerReaction(value) {
      if (value >= 5)   return { interestLevel: 5, reactionText: 'That deposit shows they\'re all in. I believe this deal closes.' }
      if (value >= 3.5) return { interestLevel: 4, reactionText: 'Solid commitment. I know they\'re serious.' }
      if (value >= 2)   return { interestLevel: 3, reactionText: 'Standard deposit. Nothing alarming, nothing impressive.' }
      if (value >= 1.5) return { interestLevel: 2, reactionText: 'A bit thin. Makes me wonder how committed they really are.' }
      return { interestLevel: 1, reactionText: 'Minimum deposit. Not inspiring confidence at all.' }
    },
  },
  {
    leverId:     'inspection',
    title:       'Inspection Contingency',
    description: 'Gives you the right to back out — or renegotiate — if an inspector finds serious problems after your offer is accepted.',
    tradeoff:    'Waiving it makes your offer cleaner and faster. But any issues found after closing are entirely your problem.',
    defaultValue: 'standard',
    getSellerReaction(value) {
      if (value === 'waived') return { interestLevel: 5, reactionText: 'No inspection clause. This deal is clean — I like it.' }
      if (value === '3day')   return { interestLevel: 4, reactionText: 'Short window. They\'re competitive and still protecting themselves.' }
      return { interestLevel: 3, reactionText: 'Standard inspection — normal, but it leaves room for renegotiation.' }
    },
  },
  {
    leverId:     'appraisal',
    title:       'Appraisal Contingency',
    description: 'Protects you if the bank\'s appraiser values the home below your offer price — giving you a way out or a renegotiation.',
    tradeoff:    'Waiving it means you\'ll cover any gap in cash. Gap guarantees are a middle ground that shows confidence.',
    defaultValue: 'standard',
    getSellerReaction(value) {
      if (value === 'waived') return { interestLevel: 5, reactionText: 'No appraisal escape hatch. They\'ll close no matter what the bank says.' }
      if (value === 'gap')    return { interestLevel: 4, reactionText: 'Gap guarantee — they have the reserves and they\'re not bluffing.' }
      return { interestLevel: 2, reactionText: 'Standard appraisal contingency. Could stall things if the house comes in low.' }
    },
  },
  {
    leverId:     'financing',
    title:       'Financing Contingency',
    description: 'Lets you walk away without penalty if your mortgage falls through before closing.',
    tradeoff:    'Waiving it is a serious commitment. If your loan doesn\'t close, you could lose your earnest deposit.',
    defaultValue: 'standard',
    getSellerReaction(value) {
      if (value === 'waived') return { interestLevel: 5, reactionText: 'No financing contingency. This buyer\'s money is guaranteed.' }
      return { interestLevel: 2, reactionText: 'Financing contingency present. The deal still depends on bank approval.' }
    },
  },
  {
    leverId:     'closing',
    title:       'Closing Timeline',
    description: 'How many days from accepted offer to you handing over cash and getting the keys.',
    tradeoff:    'A fast close is a competitive edge with sellers who want to move on. But it requires your paperwork in perfect order.',
    defaultValue: 30,
    getSellerReaction(value) {
      if (value <= 14) return { interestLevel: 5, reactionText: 'Two weeks — this is exactly the speed I need right now.' }
      if (value <= 21) return { interestLevel: 4, reactionText: 'Fast close. I can work with this.' }
      if (value <= 30) return { interestLevel: 3, reactionText: 'Standard timeline. Fine, but it won\'t stand out.' }
      if (value <= 45) return { interestLevel: 2, reactionText: 'A bit slow. I was hoping to wrap this up sooner.' }
      return { interestLevel: 1, reactionText: 'Two months is a long wait. This timeline is a problem.' }
    },
  },
]

export default tutorialSteps
