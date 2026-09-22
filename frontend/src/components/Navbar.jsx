import { Link, useNavigate } from 'react-router-dom'
import { Code2, Search, LogOut, User, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

export default function Navbar() {
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <nav className="border-b border-gray-200 bg-gray-50/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2 font-bold text-xl text-gray-900">
          <Code2 className="w-6 h-6 text-sky-400" />
          <span>Code<span className="text-sky-400">Lens</span></span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
          <Link to="/dashboard" className="hover:text-gray-900 transition-colors">Dashboard</Link>
          <Link to="/search" className="hover:text-gray-900 transition-colors flex items-center gap-1">
            <Search className="w-4 h-4" /> AI Search
          </Link>
        </div>

        {/* User menu */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 hover:bg-gray-100 rounded-lg px-3 py-2 transition-colors"
            >
              <img
                src={user.avatarUrl || `https://avatars.dicebear.com/api/initials/${user.username}.svg`}
                alt={user.username}
                className="w-7 h-7 rounded-full"
              />
              <span className="text-sm text-gray-700 hidden sm:block">{user.username}</span>
              <span className="text-xs bg-sky-900 text-sky-300 px-1.5 py-0.5 rounded hidden sm:block">
                {user.role}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-xl py-1 z-50">
                <div className="px-4 py-2 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">{user.username}</p>
                  <p className="text-xs text-gray-500">{user.email || 'No email'}</p>
                </div>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-red-400 hover:bg-gray-100 transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Sign out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
