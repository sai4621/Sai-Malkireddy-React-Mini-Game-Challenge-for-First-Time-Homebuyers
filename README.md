# Bidding War 🏠

A React mini game that teaches first-time homebuyers how to win a competitive offer.


---

## Game Concept

Bidding War teaches first-time homebuyers how to actually win a competitive offer, which has various factors to be considered. The game centers on the six real-world tactics buyers use to win houses: getting pre-approved, structuring a competitive offer, leveraging earnest money or cash, managing contingencies, staying responsive, and positioning backup offers. New buyers might believe they lose houses because they were outbid on dollars. In reality, they lose because they didn't deploy these levers strategically.

### The Mechanic

Each round, the player composes an offer on a house using six levers: offer price, earnest money, inspection contingency, financing contingency, closing timeline, and an optional escalation clause. They submit against 2 to 4 simulated competing buyers, each with their own strategies. The seller picks a winner based on weighted preferences, not just the highest number. After each round, the player sees every offer, the seller's reasoning, and the consequences of their choices three months later.

### The Learning Outcome

Players leave understanding that contingencies have real costs. Also, that sellers weigh multiple things together. They learn to read listings for clues about seller motivation and tailor offers accordingly. These are actual skills experienced buyers use.

### Why It's Fun

The tension is real. Waiving an inspection might win the house but cost you $24k three months later. Each round introduces a new seller archetype and competing buyer pattern, so the player is constantly recalibrating. The reveal screen is where the drama lives. Your offer was $35k under the FOMO buyer's, but you won because you read the seller right. That moment is the game.


## How to Run Locally

This project lives in the `bidding_sim` directory.

```bash
cd bidding_sim
npm install
npm run dev
```

The dev server will start at `http://localhost:5173`.

To build for production:

```bash
npm run build
npm run preview
```

**Requirements:** Node.js 18 or higher.

---

## Tech Choices

- **Vite + React** for fast dev iteration and simple deployment.
- **Zustand** for state management. Chosen over Redux because the game state is small enough that the full Redux was overkill, but complex enough that prop drilling would have hurt.
- **Tailwind CSS** for styling. Fast to iterate on, keeps component files self-contained, no separate stylesheets.
- **Framer Motion** for the offer reveal animations. The staggered slide-in of competing offers of each round, and Framer Motion handles that cleanly.
- **Phaser 3** for an animated reveal scene. Mounted inside a React component, with React owning all game state and Phaser handling visual theater.
- **Lucide React** for icons.

The architecture pattern is: React owns state and UI chrome. Phaser only runs in one specific moment where animation creates drama. Everything else stays in standard React components.

---

## What I'd Do With More Time

- **More seller archetypes and houses.** The current six rounds teach the core tactics but the game could support more rounds with better variation in market conditions.
- **Real market data integration.** Pulling actual listings  would make the game feel like practice for the actual market.
- **More Phaser integration** Add more features with phaser to make it feel more like a game. 
Animated section with charecters could make it more fun for a general user base.
- **Persistence.** Right now everything resets on refresh. A local storage save would let players come back to a long session.


---

## Known Issues


- The offer composer's live summary panel can briefly render stale values during very rapid slider drags. Not visible at normal speeds.
- The "responsiveness" timed round assumes the player is actively engaging. If a player tabs away, the timer keeps running.
- Some house images load slowly on first paint. Preloading the next round's image during the reveal screen somewhat stops this this but doesn't fully eliminate it.
- The seller weight tuning is balanced for teaching, not realism. A real-world seller would have more complex and less known preferences.

---

## Repository Structure

```
homebuyers-mini-game/
├── README.md           (this file)
└── bidding_sim/        (the Vite project)
    ├── src/
    │   ├── components/   (React UI components)
    │   ├── phaser/       (Phaser scenes for animated reveals)
    │   ├── data/         (game content: houses, sellers, competitors, rounds)
    │   ├── store/        (Zustand state store)
    │   └── utils/        (scoring logic)
    ├── vercel.json       (SPA rewrite config)
    └── package.json
```