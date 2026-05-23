import { create } from 'zustand'

const initialOffer = {
  price: 0,
  earnestMoney: 0,
  contingencies: [],
  closingDays: 30,
  escalationClause: null,
  personalLetter: false,
}

const useGameStore = create((set, get) => ({
  phase: 'start',
  financingPosture: null,
  currentRound: 0,
  rounds: [],
  currentOffer: { ...initialOffer },
  totalHiddenCosts: 0,
  housesWon: 0,
  backupMode: false,

  setPhase: (phase) => set({ phase }),

  setFinancingPosture: (posture) => set({ financingPosture: posture }),

  setBackupMode: (v) => set({ backupMode: v }),

  updateOffer: (updates) =>
    set((state) => ({ currentOffer: { ...state.currentOffer, ...updates } })),

  submitOffer: (result) =>
    set((state) => ({
      rounds: [...state.rounds, { round: state.currentRound, offer: state.currentOffer, ...result }],
      housesWon: result.won ? state.housesWon + 1 : state.housesWon,
      totalHiddenCosts: state.totalHiddenCosts + (result.hiddenCosts ?? 0),
    })),

  advanceRound: () =>
    set((state) => ({
      currentRound: state.currentRound + 1,
      currentOffer: { ...initialOffer },
    })),

  resetGame: () =>
    set({
      phase: 'start',
      financingPosture: null,
      currentRound: 0,
      rounds: [],
      currentOffer: { ...initialOffer },
      totalHiddenCosts: 0,
      housesWon: 0,
      backupMode: false,
    }),
}))

export default useGameStore
