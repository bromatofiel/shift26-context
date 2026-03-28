export default function ResultsLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="space-y-4 text-center">
        <div className="space-y-3">
          <LoadingStage label="Analyse" status="active" />
          <LoadingStage label="Recherche" status="pending" />
          <LoadingStage label="Synthese" status="pending" />
        </div>
      </div>
    </div>
  )
}

function LoadingStage({
  label,
  status
}: {
  label: string
  status: 'active' | 'complete' | 'pending'
}) {
  return (
    <div className="flex items-center gap-3" role="status" aria-live="polite">
      {status === 'active' && (
        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      )}
      {status === 'complete' && (
        <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
      {status === 'pending' && (
        <div className="w-5 h-5 bg-gray-300 rounded-full" />
      )}
      <span
        className={`text-lg ${status === 'active' ? 'font-medium text-gray-900' : 'text-gray-500'}`}
        aria-label={`Etape ${label}: ${status === 'active' ? 'en cours' : status === 'complete' ? 'terminee' : 'en attente'}`}
      >
        {label}
      </span>
    </div>
  )
}
