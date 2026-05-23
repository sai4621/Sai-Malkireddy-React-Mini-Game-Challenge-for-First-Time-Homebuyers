import { AnimatePresence, motion } from 'framer-motion'
import useGameStore from './store/gameStore'
import StartScreen from './components/StartScreen'
import PreapprovalScreen from './components/PreapprovalScreen'
import HouseIntroCard from './components/HouseIntroCard'
import OfferComposer from './components/OfferComposer'
import RevealScreen from './components/RevealScreen'
import BackupOfferScreen from './components/BackupOfferScreen'
import ConsequenceScreen from './components/ConsequenceScreen'
import EndScreen from './components/EndScreen'

const SCREENS = {
  'start':        StartScreen,
  'preapproval':  PreapprovalScreen,
  'house-intro':  HouseIntroCard,
  'compose':      OfferComposer,
  'reveal':       RevealScreen,
  'backup-offer': BackupOfferScreen,
  'consequence':  ConsequenceScreen,
  'end':          EndScreen,
}

export default function App() {
  const phase = useGameStore((s) => s.phase)
  const Screen = SCREENS[phase]

  return (
    <AnimatePresence mode="wait">
      {Screen && (
        <motion.div
          key={phase}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
        >
          <Screen />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
