import { Bug, ShieldAlert, Gauge, Zap, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

const ScoreRing = ({ score, label, color }) => (
  <div className="flex flex-col items-center gap-1">
    <div className={`relative w-16 h-16 rounded-full flex items-center justify-center border-4 ${color}`}>
      <span className="text-lg font-bold text-gray-900">{score}</span>
    </div>
    <span className="text-xs text-gray-600">{label}</span>
  </div>
)

const SeverityBadge = ({ severity }) => {
  const map = {
    critical: 'badge-critical',
    high: 'badge-high',
    medium: 'badge-medium',
    low: 'badge-low',
  }
  return <span className={map[severity?.toLowerCase()] || 'badge-low'}>{severity}</span>
}

const IssueList = ({ title, icon: Icon, iconColor, items, renderItem }) => {
  const [open, setOpen] = useState(true)
  if (!items || items.length === 0) return null

  return (
    <div className="card mt-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <Icon className={`w-5 h-5 ${iconColor}`} />
          <span className="font-semibold text-gray-900">{title}</span>
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{items.length}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          {items.map((item, i) => renderItem(item, i))}
        </div>
      )}
    </div>
  )
}

export default function ReviewPanel({ review }) {
  if (!review) return null

  const overallColor =
    review.overallScore >= 80 ? 'border-green-500' :
    review.overallScore >= 60 ? 'border-yellow-500' :
    'border-red-500'

  return (
    <div>
      {/* Summary */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">AI Review Summary</h2>
        <p className="text-gray-700 leading-relaxed">{review.summary}</p>

        {/* Score rings */}
        <div className="flex flex-wrap gap-6 mt-5 justify-center sm:justify-start">
          <ScoreRing score={review.overallScore} label="Overall" color={overallColor} />
          <ScoreRing score={review.bugScore} label="Bugs" color="border-orange-500" />
          <ScoreRing score={review.securityScore} label="Security" color="border-red-500" />
          <ScoreRing score={review.qualityScore} label="Quality" color="border-sky-500" />
        </div>
      </div>

      {/* Bugs */}
      <IssueList
        title="Bugs"
        icon={Bug}
        iconColor="text-orange-400"
        items={review.bugs}
        renderItem={(bug, i) => (
          <div key={i} className="bg-gray-100/60 rounded-lg p-3 border border-gray-300">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <span className="font-mono text-xs text-gray-600">{bug.file}{bug.line ? `:${bug.line}` : ''}</span>
              <SeverityBadge severity={bug.severity} />
            </div>
            <p className="text-sm text-gray-800 mt-2">{bug.description}</p>
            <p className="text-xs text-sky-400 mt-1.5">💡 {bug.suggestion}</p>
          </div>
        )}
      />

      {/* Security Issues */}
      <IssueList
        title="Security Issues"
        icon={ShieldAlert}
        iconColor="text-red-400"
        items={review.securityIssues}
        renderItem={(issue, i) => (
          <div key={i} className="bg-gray-100/60 rounded-lg p-3 border border-gray-300">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <span className="font-mono text-xs text-gray-600">{issue.file}</span>
                {issue.cwe && <span className="ml-2 text-xs text-gray-500">{issue.cwe}</span>}
              </div>
              <SeverityBadge severity={issue.severity} />
            </div>
            <p className="text-sm text-gray-800 mt-2">{issue.description}</p>
            <p className="text-xs text-sky-400 mt-1.5">💡 {issue.suggestion}</p>
          </div>
        )}
      />

      {/* Code Quality */}
      <IssueList
        title="Code Quality"
        icon={Gauge}
        iconColor="text-sky-400"
        items={review.codeQuality}
        renderItem={(item, i) => (
          <div key={i} className="bg-gray-100/60 rounded-lg p-3 border border-gray-300">
            <span className="font-mono text-xs text-gray-600">{item.file}</span>
            <p className="text-sm text-gray-800 mt-1">{item.issue}</p>
            <p className="text-xs text-sky-400 mt-1.5">💡 {item.suggestion}</p>
          </div>
        )}
      />

      {/* Complexity */}
      {review.complexity && review.complexity.score && (
        <div className="card mt-4">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 h-5 text-yellow-400" />
            <span className="font-semibold text-gray-900">Complexity</span>
            <span className="text-sm text-gray-600">Score: {review.complexity.score}/10</span>
          </div>
          <p className="text-sm text-gray-700">{review.complexity.suggestion}</p>
          {review.complexity.hotspots?.length > 0 && (
            <div className="mt-3 space-y-2">
              {review.complexity.hotspots.map((h, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <span className="font-mono text-xs text-yellow-400 mt-0.5">{h.file}</span>
                  <span className="text-gray-600">— {h.reason}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
