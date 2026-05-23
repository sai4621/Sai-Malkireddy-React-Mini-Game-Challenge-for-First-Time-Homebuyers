import useGameStore from './store/gameStore'
import StartScreen from './components/StartScreen'
import PreapprovalScreen from './components/PreapprovalScreen'
import HouseIntroCard from './components/HouseIntroCard'
import OfferComposer from './components/OfferComposer'
import RevealScreen from './components/RevealScreen'
import BackupOfferScreen from './components/BackupOfferScreen'
import ConsequenceScreen from './components/ConsequenceScreen'
import EndScreen from './components/EndScreen'

export default function App() {
  const phase = useGameStore((s) => s.phase)

  return (
    <>
      {phase === 'start'         && <StartScreen />}
      {phase === 'preapproval'   && <PreapprovalScreen />}
      {phase === 'house-intro'   && <HouseIntroCard />}
      {phase === 'compose'       && <OfferComposer />}
      {phase === 'reveal'        && <RevealScreen />}
      {phase === 'backup-offer'  && <BackupOfferScreen />}
      {phase === 'consequence'   && <ConsequenceScreen />}
      {phase === 'end'           && <EndScreen />}
    </>
  )
}
