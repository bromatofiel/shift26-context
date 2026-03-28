interface BiasScoreCardProps {
  score: number // 0-100
}

export function BiasScoreCard({ score }: BiasScoreCardProps) {
  // Color thresholds per UI-SPEC Section 1.1: 0-40 green, 41-65 orange, 66-100 red
  const color = score >= 66 ? 'red' : score >= 41 ? 'orange' : 'green'
  const colorClasses = {
    green: 'bg-green-600 text-white',
    orange: 'bg-orange-500 text-white',
    red: 'bg-red-500 text-white'
  }

  return (
    <div
      className={`rounded-xl p-6 text-center ${colorClasses[color]}`}
      role="status"
      aria-label={`Score de biais: ${score} sur 100`}
    >
      <div className="text-6xl font-bold tabular-nums">{score}</div>
      <div className="text-sm uppercase tracking-wide mt-2 opacity-90">
        Score de biais
      </div>
    </div>
  )
}

export function BiasScoreSkeleton() {
  return (
    <div className="rounded-xl p-6 text-center bg-gray-200 animate-pulse">
      <div className="h-16 w-20 mx-auto bg-gray-300 rounded mb-2" />
      <div className="h-4 w-32 mx-auto bg-gray-300 rounded" />
    </div>
  )
}
