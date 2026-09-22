import { GitPullRequest, Plus, Minus, Clock, CheckCircle2, Loader2, AlertCircle, ArrowRight, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import client from '../api/client'

const statusConfig = {
  not_analyzed: { icon: Clock, color: 'text-gray-500', bg: 'bg-gray-100', label: 'Not Analyzed' },
  pending: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Pending' },
  processing: { icon: Loader2, color: 'text-sky-600', bg: 'bg-sky-100', label: 'Analyzing…', spin: true },
  completed: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100', label: 'Reviewed' },
  failed: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100', label: 'Failed' },
}

export default function PRCard({ pr, owner, repo, onAnalyzeSuccess }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const s = statusConfig[pr.analysisStatus] || statusConfig.not_analyzed
  const StatusIcon = s.icon

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    try {
      await client.post('/prs/analyze', { owner, repo, prNumber: pr.githubPrId })
      if (onAnalyzeSuccess) onAnalyzeSuccess()
    } catch (error) {
      console.error("Analysis failed", error)
      alert("Failed to queue analysis. Please try again.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="card hover:border-gray-300 transition-colors group">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <GitPullRequest className="w-5 h-5 text-sky-400 mt-0.5 flex-shrink-0" />
          <div className="min-w-0">
            <p className="font-medium text-gray-900 truncate group-hover:text-sky-300 transition-colors">
              {pr.title}
            </p>
            <p className="text-sm text-gray-500 mt-0.5">
              #{pr.githubPrId} by{' '}
              <span className="text-gray-600">{pr.author}</span>
              {' · '}
              <span>{pr.headBranch}</span>
              {' → '}
              <span>{pr.baseBranch}</span>
            </p>
          </div>
        </div>

        {/* Analysis status badge */}
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${s.bg} ${s.color}`}>
          <StatusIcon className={`w-3.5 h-3.5 ${s.spin ? 'animate-spin' : ''}`} />
          {s.label}
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
        <span className="flex items-center gap-1 text-green-400">
          <Plus className="w-3 h-3" />{pr.additions}
        </span>
        <span className="flex items-center gap-1 text-red-400">
          <Minus className="w-3 h-3" />{pr.deletions}
        </span>
        <span>{pr.changedFiles} files</span>
        <div className="ml-auto flex items-center gap-2">
          {pr.id ? (
            <Link
              to={`/prs/${pr.id}?owner=${owner}&repo=${repo}`}
              className="flex items-center gap-1 text-sky-600 hover:text-sky-500 font-medium bg-sky-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              View Review <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="flex items-center gap-1 text-white bg-sky-600 hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium px-3 py-1.5 rounded-lg transition-colors"
            >
              {isAnalyzing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              Analyze with AI
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
