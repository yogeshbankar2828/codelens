import { useState, useEffect } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { ArrowLeft, GitPullRequest, ExternalLink, Play, Loader2, RefreshCw } from 'lucide-react'
import Navbar from '../components/Navbar'
import ReviewPanel from '../components/ReviewPanel'
import Spinner from '../components/Spinner'
import { useReview } from '../hooks/useReview'

export default function PRDetailPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const owner = searchParams.get('owner')
  const repo = searchParams.get('repo')
  const prNumber = searchParams.get('prNumber')

  const { review, loading, error, fetchReview, triggerAnalysis, pollStatus } = useReview()
  const [analysisStatus, setAnalysisStatus] = useState(null)
  const [triggering, setTriggering] = useState(false)
  const [polling, setPolling] = useState(false)

  useEffect(() => {
    if (id) fetchReview(id)
  }, [id])

  // Poll for completion when processing
  useEffect(() => {
    if (analysisStatus !== 'processing' && analysisStatus !== 'pending') return
    setPolling(true)
    const interval = setInterval(async () => {
      const status = await pollStatus(id)
      setAnalysisStatus(status)
      if (status === 'completed') {
        fetchReview(id)
        clearInterval(interval)
        setPolling(false)
      } else if (status === 'failed') {
        clearInterval(interval)
        setPolling(false)
      }
    }, 5000)
    return () => clearInterval(interval)
  }, [analysisStatus, id])

  const handleTrigger = async () => {
    if (!owner || !repo || !prNumber) return
    setTriggering(true)
    try {
      await triggerAnalysis(owner, repo, parseInt(prNumber))
      setAnalysisStatus('pending')
    } catch {}
    finally { setTriggering(false) }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Back button */}
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        {/* Header */}
        <div className="card mb-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-3">
              <GitPullRequest className="w-6 h-6 text-sky-400 mt-0.5" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Pull Request Review</h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  {owner}/{repo} {prNumber ? `• #${prNumber}` : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {polling && (
                <span className="flex items-center gap-1.5 text-sm text-sky-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing…
                </span>
              )}
              <button
                onClick={() => fetchReview(id)}
                className="btn-secondary flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Refresh
              </button>
              {!review && owner && repo && prNumber && (
                <button
                  onClick={handleTrigger}
                  disabled={triggering || polling}
                  className="btn-primary flex items-center gap-2 disabled:opacity-50"
                >
                  {triggering ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  Run Analysis
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        {loading && <Spinner text="Loading review…" />}

        {error && !loading && (
          <div className="card border-yellow-800 text-center py-10">
            <p className="text-yellow-400 mb-4">{error}</p>
            {owner && repo && prNumber && (
              <button onClick={handleTrigger} disabled={triggering} className="btn-primary">
                {triggering ? 'Queueing…' : '▶ Run AI Analysis'}
              </button>
            )}
          </div>
        )}

        {review && !loading && <ReviewPanel review={review} />}
      </div>
    </div>
  )
}
