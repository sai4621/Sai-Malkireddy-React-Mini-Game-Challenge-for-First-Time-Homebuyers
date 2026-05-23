import useGameStore from './store/gameStore'
import StartScreen from './components/StartScreen'
import PreapprovalScreen from './components/PreapprovalScreen'
import HouseIntroCard from './components/HouseIntroCard'
import OfferComposer from './components/OfferComposer'

export default function App() {
  const phase = useGameStore((s) => s.phase)

  return (
    <>
      {phase === 'start'       && <StartScreen />}
      {phase === 'preapproval' && <PreapprovalScreen />}
      {phase === 'house-intro' && <HouseIntroCard />}
      {phase === 'compose'     && <OfferComposer />}
      {phase === 'reveal'      && <Placeholder label="Reveal" />}
      {phase === 'consequence' && <Placeholder label="Consequence" />}
      {phase === 'end'         && <Placeholder label="End" />}
    </>
  )
}

function Placeholder({ label }) {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <p className="text-slate-400 text-sm font-medium tracking-wide">{label} — coming soon</p>
    </div>
  )
}
