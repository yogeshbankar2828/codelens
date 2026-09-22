import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import client from '../api/client'
import Spinner from '../components/Spinner'

/**
 * /auth/callback?token=...
 * GitHub OAuth redirects here after successful login.
 * Store the JWT and fetch user profile.
 */
export default function AuthCallbackPage() {
  const [params] = useSearchParams()
  const { setUser } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const token = params.get('token')
    const error = params.get('error')

    if (error || !token) {
      navigate('/login?error=1')
      return
    }

    localStorage.setItem('cl_token', token)

    // Fetch user profile with the new token
    client.get('/auth/me')
      .then(res => {
        setUser(res.data.user)
        navigate('/dashboard')
      })
      .catch(() => {
        localStorage.removeItem('cl_token')
        navigate('/login?error=1')
      })
  }, [])

  return <Spinner text="Finishing sign-in…" size="lg" />
}
