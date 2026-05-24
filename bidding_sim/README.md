# Bidding War

A browser-based simulation game that teaches first-time homebuyers how to write competitive offers. Players face six real-feeling purchase scenarios — each with a different seller motivation, a field of competing buyers, and a set of offer levers — and learn through consequence rather than lecture.

---

## Game Concept

Most first-time buyers lose their first few offers without understanding why. They assumed the highest price would always win. They kept all their contingencies because they were scared to waive them. They put down 1% earnest money because that's what they were told was normal.

Bidding War simulates that learning curve without the $600,000 tuition.

**The game loop:**

1. An interactive tutorial introduces the six core offer levers one at a time — offer price, earnest money, inspection contingency, appraisal contingency, financing contingency, and closing timeline — with a live seller interest meter so the player can feel the tradeoffs before the pressure is on.

2. The player selects a financing posture (pre-qualified, pre-approved, or all cash) that follows them through every round. This is a foundational decision that most buyers underestimate.

3. Each of the six rounds presents a real listing with a subtle seller motivation hidden in the description. The player composes an offer by adjusting all six levers — three rounds have countdown timers to add pressure — and submits.

4. An animated Phaser canvas reveals all competing offers simultaneously, scoring each one against the seller's hidden weights. The seller explains their reasoning in their own voice.

5. If the player won but waived contingencies carelessly, a consequence screen surfaces the hidden repair costs, appraisal gaps, or permit liabilities they just accepted. This is the core lesson.

6. Round 6 introduces an optional backup offer mechanic. If the player lost the primary bid, they can position themselves as the backup and potentially win on a primary deal collapse.

7. The end screen delivers a six-tactic scorecard with a buyer archetype (The Strategist, The Overbidder, The Calculated Risk, The Cautious Buyer) based on the player's pattern of decisions.

**The six seller archetypes:**

| Archetype | What they want most |
|---|---|
| The Relocating Exec | Fastest possible close |
| The Long-Time Owner | Strongest financing, minimal contingencies |
| The Estate Executor | Clean as-is offer, no re-trade risk |
| The Confident Renovator | Price that respects the upgrades |
| The Investor LLC | Large earnest money, certainty of close |
| The Short-Sale Seller | Bank-satisfying offer, no complexity |

---

## How to Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

To build and preview the production bundle:

```bash
npm run build
npm run preview
```

---

## Tech Choices

- **Vite 8** — Near-instant HMR and sub-2-second production builds. No configuration needed for a single-page app this size.
- **React 19 + React Compiler** — The compiler eliminates manual `useMemo`/`useCallback` throughout the component tree; enabled via `babel-plugin-react-compiler` with zero annotation required.
- **Zustand 5** — Phase-based routing and round state fit naturally into a single flat store; no provider boilerplate, no reducer ceremony.
- **Tailwind CSS v4** — Zero config file, utility-first, styles live next to the markup. The v4 `@import "tailwindcss"` syntax removed the config overhead that slows down design iteration.
- **Framer Motion 12** — Declarative page transitions with `AnimatePresence` and enter-only animations on card reveals; no manual keyframe management.
- **Phaser 4** — Canvas-based offer reveal animation (cards slide in, winner pulses, losers fade); lazy-loaded via dynamic `import()` so it never touches the main bundle.
- **lucide-react** — Consistent icon set with a neutral aesthetic that doesn't fight the real-estate tone.

---

## Deploying

**Vercel (recommended — zero config):**

Connect the repository in the Vercel dashboard or run:

```bash
npx vercel
```

The current `vite.config.js` has no `base` path set, which is correct for Vercel.

**GitHub Pages:**

Add a `base` to `vite.config.js` matching your repository name:

```js
export default defineConfig({
  base: '/your-repo-name/',
  // ...rest of config
})
```

Then build and push the `dist/` folder to the `gh-pages` branch, or use the `gh-pages` npm package.

---

## What I'd Do With More Time

**More content and scenarios**
- Additional seller archetypes: the divorcing couple (split priorities), the builder selling new construction (standard contract, no negotiation), the iBuyer (pure algorithm, pure price)
- Procedurally varied listings so the game is replayable without the player memorizing which seller wants what
- A "hard mode" that randomizes seller weights slightly each game

**Richer mechanics**
- Inspection renegotiation flow: after winning with an inspection contingency, surface a real defect and let the player choose whether to renegotiate, accept, or walk
- Financing contingency drama: simulate a last-minute lender issue and let the player decide whether to scramble for a bridge or let the deal die
- Escalation clause resolution: show the player exactly which competing bid triggered their escalation and what the final price became

**Real market data**
- Pull actual recent comp data from a public API so asking prices and competitor behavior reflect the player's local market
- Show the player how their simulated offer would have fared in a real historical sale (e.g., "In this neighborhood last March, 7 of 9 offers went over asking by 8%+")

**Polish**
- Sound design: subtle audio cues for winning, losing, and consequence reveals
- Keyboard navigation through the offer composer for full accessibility
- `localStorage` persistence so a refresh mid-game restores state
- A shareable results card (Open Graph image generated from the end-screen scorecard)

---

## Known Issues

- **Phaser bundle size**: The Phaser 4 lazy chunk is 1.3 MB uncompressed (352 KB gzip). Phaser has no official tree-shakeable ESM build, so the full library loads on first arrival at the reveal screen. A 5-second failsafe fires `onComplete` if the canvas never initializes, keeping the game playable on slow connections.
- **Unsplash image availability**: House photos are served from Unsplash CDN URLs. If Unsplash expires or removes a photo the listing image goes blank. One URL (h1) was already replaced during development.
- **No session persistence**: Refreshing the browser mid-game resets to the start screen. All round history lives in Zustand memory.
- **Mobile offer composer**: The levers column is readable on 375px but dense. A dedicated mobile layout (single full-screen step per lever) would improve the small-screen experience.
- **Timer auto-submit on tab switch**: If the player switches browser tabs during a timed round the countdown continues and the offer may auto-submit with default values.
