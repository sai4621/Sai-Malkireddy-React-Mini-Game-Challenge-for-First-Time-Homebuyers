import useGameStore from './store/gameStore'

const PHASES = ['start', 'preapproval', 'house-intro', 'compose', 'reveal', 'consequence', 'end']

function App() {
  const phase = useGameStore((s) => s.phase)
  const setPhase = useGameStore((s) => s.setPhase)

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Bidding War — phase: {phase}</h1>

      {phase === 'start' && <div data-phase="start">Start placeholder</div>}
      {phase === 'preapproval' && <div data-phase="preapproval">Pre-approval placeholder</div>}
      {phase === 'house-intro' && <div data-phase="house-intro">House intro placeholder</div>}
      {phase === 'compose' && <div data-phase="compose">Compose offer placeholder</div>}
      {phase === 'reveal' && <div data-phase="reveal">Reveal placeholder</div>}
      {phase === 'consequence' && <div data-phase="consequence">Consequence placeholder</div>}
      {phase === 'end' && <div data-phase="end">End placeholder</div>}

      <div className="mt-6 flex flex-wrap gap-2">
        {PHASES.map((p) => (
          <button
            key={p}
            onClick={() => setPhase(p)}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  )
}

export default App
