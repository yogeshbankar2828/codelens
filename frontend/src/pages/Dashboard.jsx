import { useState } from 'react'
import { GitBranch, RefreshCw, Filter, Sparkles, AlertCircle } from 'lucide-react'
import Navbar from '../components/Navbar'
import PRCard from '../components/PRCard'
import Spinner from '../components/Spinner'
import { useAuth } from '../hooks/useAuth'
import { usePRs, useRepos } from '../hooks/usePRs'

export default function Dashboard() {
  const { user } = useAuth()
  const { repos, loading: loadingRepos } = useRepos()
  const [selectedRepo, setSelectedRepo] = useState('')
  const [filterState, setFilterState] = useState('open')

  const [owner, repo] = selectedRepo ? selectedRepo.split('/') : ['', '']
  const { prs, loading: loadingPRs, error, refetch } = usePRs(owner, repo, filterState)

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top welcome & stats */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              Welcome back, {user?.username} <Sparkles className="w-5 h-5 text-sky-400" />
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Select a repository to inspect pull requests and view automated AI code reviews.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={refetch}
              disabled={!selectedRepo || loadingPRs}
              className="btn-secondary flex items-center gap-2 disabled:opacity-50 text-sm"
            >
              <RefreshCw className={`w-4 h-4 ${loadingPRs ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>
        </div>

        {/* Filters and Repo Selection */}
        <div className="flex flex-col sm:flex-row gap-4 my-6">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
              Connected Repository
            </label>
            <div className="relative">
              <select
                value={selectedRepo}
                onChange={(e) => setSelectedRepo(e.target.value)}
                className="w-full bg-white border border-gray-300 text-gray-800 rounded-lg px-4 py-2.5 focus:outline-none focus:border-sky-500 font-mono text-sm"
              >
                <option value="">-- Choose a repository --</option>
                {repos.map((r) => (
                  <option key={r.fullName} value={r.fullName}>
                    {r.fullName} {r.isPrivate ? '(Private)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="w-full sm:w-48">
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
              PR State
            </label>
            <div className="relative">
              <select
                value={filterState}
                onChange={(e) => setFilterState(e.target.value)}
                className="w-full bg-white border border-gray-300 text-gray-800 rounded-lg px-4 py-2.5 focus:outline-none focus:border-sky-500 text-sm"
              >
                <option value="open">Open</option>
                <option value="closed">Closed / Merged</option>
                <option value="all">All</option>
              </select>
            </div>
          </div>
        </div>

        {/* Status / Content */}
        {loadingRepos ? (
          <Spinner text="Loading your GitHub repositories..." />
        ) : !selectedRepo ? (
          <div className="card text-center py-16 border-dashed border-gray-200">
            <GitBranch className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-700">No repository selected</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
              Choose a repository from the dropdown above to view open pull requests and automated reviews.
            </p>
          </div>
        ) : loadingPRs ? (
          <Spinner text={`Fetching pull requests for ${selectedRepo}...`} />
        ) : error ? (
          <div className="card border-red-900/50 bg-red-950/20 text-red-400 flex items-center gap-3 p-4">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        ) : prs.length === 0 ? (
          <div className="card text-center py-16">
            <p className="text-gray-600">No {filterState} pull requests found for {selectedRepo}.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
              {prs.length} Pull Request{prs.length === 1 ? '' : 's'}
            </p>
            {prs.map((pr) => (
              <PRCard key={pr.githubPrId} pr={pr} owner={owner} repo={repo} onAnalyzeSuccess={refetch} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
