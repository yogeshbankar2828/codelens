import { useState, useCallback } from 'react'
import client from '../api/client'

export const useSearch = () => {
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const search = useCallback(async (query, repoFullName) => {
    if (!query.trim() || !repoFullName) return
    setLoading(true)
    setError(null)
    setResults(null)
    try {
      const { data } = await client.post('/search', { query, repoFullName, topK: 5 })
      setResults(data.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Search failed')
    } finally {
      setLoading(false)
    }
  }, [])

  const indexRepo = useCallback(async (repoFullName) => {
    const { data } = await client.post('/search/index', { repoFullName })
    return data
  }, [])

  return { results, loading, error, search, indexRepo }
}
