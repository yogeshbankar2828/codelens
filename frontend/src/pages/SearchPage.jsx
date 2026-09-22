import { useState } from 'react'
import { Search, Database, Loader2 } from 'lucide-react'
import Navbar from '../components/Navbar'
import { useSearch } from '../hooks/useSearch'
import { useRepos } from '../hooks/usePRs'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [selectedRepo, setSelectedRepo] = useState('')
  const [indexing, setIndexing] = useState(false)
  const [indexMsg, setIndexMsg] = useState('')
  const { results, loading, error, search, indexRepo } = useSearch()
  const { repos } = useRepos()

  const handleSearch = (e) => {
    e.preventDefault()
    if (selectedRepo) search(query, selectedRepo)
  }

  const handleIndex = async () => {
    if (!selectedRepo) return
    setIndexing(true)
    setIndexMsg('')
    try {
      await indexRepo(selectedRepo)
      setIndexMsg(`✅ Indexing queued for ${selectedRepo}. This may take a few minutes.`)
    } catch {
      setIndexMsg('❌ Failed to queue indexing.')
    } finally {
      setIndexing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">AI Code Search</h1>
          <p className="text-gray-600">Ask anything about your repository. Powered by Gemini + vector embeddings.</p>
        </div>

        {/* Repo selector + Index button */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <select
            value={selectedRepo}
            onChange={e => setSelectedRepo(e.target.value)}
            className="flex-1 bg-white border border-gray-300 text-gray-800 rounded-lg px-4 py-2.5 focus:outline-none focus:border-sky-500"
          >
            <option value="">Select a repository…</option>
            {repos.map(r => (
              <option key={r.fullName} value={r.fullName}>{r.fullName}</option>
            ))}
          </select>
          <button
            onClick={handleIndex}
            disabled={!selectedRepo || indexing}
            className="btn-secondary flex items-center gap-2 disabled:opacity-50"
          >
            {indexing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
            Index Repo
          </button>
        </div>

        {indexMsg && (
          <p className="text-sm text-gray-600 mb-4">{indexMsg}</p>
        )}

        {/* Search box */}
        <form onSubmit={handleSearch} className="flex gap-3 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="e.g. Where is the authentication middleware? How does the queue work?"
              className="w-full bg-white border border-gray-300 text-gray-800 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-sky-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim() || !selectedRepo}
            className="btn-primary disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="card border-red-800 text-red-400 mb-6">{error}</div>
        )}

        {/* Results */}
        {results && (
          <div className="space-y-6">
            {/* AI Answer */}
            <div className="card border-sky-800">
              <p className="text-xs text-sky-400 font-semibold uppercase tracking-wider mb-3">AI Answer</p>
              <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{results.answer}</p>
            </div>

            {/* Source files */}
            {results.sources?.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-3">Relevant Code Sources</p>
                <div className="space-y-4">
                  {results.sources.map((src, i) => (
                    <div key={i} className="card">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-sm text-sky-300">{src.filePath}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">{src.language}</span>
                          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                            similarity: {1 - parseFloat(src.distance) > 0 ? (1 - parseFloat(src.distance)).toFixed(2) : 'n/a'}
                          </span>
                        </div>
                      </div>
                      <SyntaxHighlighter
                        language={src.language || 'text'}
                        style={oneDark}
                        customStyle={{ borderRadius: '0.5rem', margin: 0, fontSize: '0.8rem' }}
                      >
                        {src.snippet}
                      </SyntaxHighlighter>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {!results && !loading && !error && (
          <div className="text-center py-16 text-gray-600">
            <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Select a repo, index it once, then ask any question about the code.</p>
          </div>
        )}
      </div>
    </div>
  )
}
