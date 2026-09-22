import { useState, useCallback } from 'react'
import client from '../api/client'

export const useReview = () => {
  const [review, setReview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchReview = useCallback(async (pullRequestId) => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await client.get(`/reviews/${pullRequestId}`)
      setReview(data.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load review')
    } finally {
      setLoading(false)
    }
  }, [])

  const triggerAnalysis = useCallback(async (owner, repo, prNumber) => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await client.post('/prs/analyze', { owner, repo, prNumber })
      return data.data
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to queue analysis')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const pollStatus = useCallback(async (pullRequestId) => {
    const { data } = await client.get(`/reviews/status/${pullRequestId}`)
    return data.data.analysisStatus
  }, [])

  const explainCode = useCallback(async (code, language) => {
    const { data } = await client.post('/reviews/explain', { code, language })
    return data.data.explanation
  }, [])

  return { review, loading, error, fetchReview, triggerAnalysis, pollStatus, explainCode }
}
