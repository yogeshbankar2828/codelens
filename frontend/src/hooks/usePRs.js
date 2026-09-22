import { useState, useEffect } from 'react'
import client from '../api/client'

export const usePRs = (owner, repo, state = 'open') => {
  const [prs, setPrs] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchPRs = async () => {
    if (!owner || !repo) return
    setLoading(true)
    setError(null)
    try {
      const { data } = await client.get('/prs', { params: { owner, repo, state } })
      setPrs(data.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch PRs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPRs() }, [owner, repo, state])

  return { prs, loading, error, refetch: fetchPRs }
}

export const useRepos = () => {
  const [repos, setRepos] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    client.get('/prs/repos/list')
      .then(res => setRepos(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return { repos, loading }
}
