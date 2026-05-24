import { ArrowRight } from 'lucide-react'
import useGameStore from '../store/gameStore'

export default function StartScreen() {
  const setPhase = useGameStore((s) => s.setPhase)

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center px-6 py-20">
      <div className="w-full max-w-2xl flex flex-col items-center text-center">

        {/* Eyebrow */}
        <p className="text-xs font-semibold tracking-[0.18em] uppercase text-blue-700 mb-8">
          First-time homebuyer simulation
        </p>

        {/* Title */}
        <h1 className="text-[clamp(4rem,12vw,7rem)] font-bold tracking-tight leading-none text-slate-900 mb-6">
          Bidding<br />War
        </h1>

        {/* Subtitle */}
        <p className="text-xl text-slate-500 leading-relaxed max-w-md mb-14">
          Master the six tactics that turn good buyers into winning buyers.
        </p>

        {/* How it works */}
        <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm px-8 py-7 mb-12 text-left">
          <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-slate-400 mb-5">
            How it works
          </p>
          <ol className="space-y-4">
            {[
              'Each round you receive a real listing with clues buried in the description about what the seller actually wants: speed, certainty, price, or something else entirely.',
              'You compose a competitive offer (price, earnest money, contingencies, and closing timeline), then watch it scored against real competing buyers with their own strategies.',
              'Six rounds, six seller archetypes, six chances to learn what separates a winning offer from a beautiful second place.',
            ].map((sentence, i) => (
              <li key={i} className="flex gap-4">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <p className="text-[15px] text-slate-600 leading-relaxed">{sentence}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* CTA */}
        <button
          type="button"
          onClick={() => setPhase('tutorial')}
          className="inline-flex items-center gap-3 bg-slate-900 text-white text-base font-semibold px-10 py-4 rounded-xl hover:bg-slate-800 active:scale-[0.98] transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-700 focus-visible:ring-offset-2"
        >
          Start
          <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
        </button>

      </div>
    </div>
  )
}
