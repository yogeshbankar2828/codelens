import { Code2, Github, Zap, ShieldCheck, BarChart3, Search } from 'lucide-react'

export default function LoginPage() {
  const handleGitHubLogin = () => {
    window.location.href = '/api/auth/github'
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left: Login panel */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-8 py-12">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-10">
            <Code2 className="w-8 h-8 text-sky-400" />
            <span className="text-2xl font-bold text-gray-900">
              Code<span className="text-sky-400">Lens</span>
            </span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h1>
          <p className="text-gray-600 mb-8">
            Sign in with GitHub to analyze your pull requests with AI.
          </p>

          <button
            onClick={handleGitHubLogin}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-900 font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
          >
            <Github className="w-5 h-5" />
            Continue with GitHub
          </button>

          <p className="text-xs text-gray-600 mt-6 text-center">
            By signing in, you authorize CodeLens to read your repositories and pull requests.
            <br />
            <a href="/privacy-policy" className="text-sky-600 hover:underline mt-1 inline-block">Privacy Policy</a>
          </p>
        </div>
      </div>

      {/* Right: Feature showcase */}
      <div className="hidden lg:flex w-1/2 bg-white border-l border-gray-200 flex-col items-center justify-center px-12 py-12">
        <div className="max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">AI-Powered Code Review</h2>
          <p className="text-gray-600 mb-8">
            Automatically analyze every pull request for bugs, security vulnerabilities, code quality, and complexity.
          </p>

          <div className="space-y-4">
            {[
              { icon: Bug2, color: 'text-orange-400', bg: 'bg-orange-900/20', title: 'Bug Detection', desc: 'Catch logic errors and null pointer issues before they reach production.' },
              { icon: ShieldCheck, color: 'text-red-400', bg: 'bg-red-900/20', title: 'Security Analysis', desc: 'Detect injection attacks, exposed secrets, and insecure dependencies.' },
              { icon: BarChart3, color: 'text-sky-400', bg: 'bg-sky-900/20', title: 'Quality Scoring', desc: 'Get 0-100 scores for overall quality, bugs, and security.' },
              { icon: Search, color: 'text-purple-400', bg: 'bg-purple-900/20', title: 'AI Code Search', desc: 'Ask questions about your codebase — powered by embeddings + Gemini.' },
            ].map(({ icon: Icon, color, bg, title, desc }) => (
              <div key={title} className="flex items-start gap-4">
                <div className={`p-2 rounded-lg ${bg} flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{title}</p>
                  <p className="text-sm text-gray-600">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Mini icon for the feature list
const Bug2 = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M8 2l1.88 1.88M14.12 3.88 16 2M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"/>
    <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6z"/>
    <path d="M12 20v-9M6.53 9C4.6 8.8 3 7.1 3 5M6 13H2M20 13h-4M17.47 9c1.93-.2 3.53-1.9 3.53-4M15 11h.01"/>
  </svg>
)
