'use client'

import { useAuth } from './AuthProvider'
import { LogOut } from 'lucide-react'
import Link from 'next/link'

export default function Header() {
  const { user, logout } = useAuth()

  return (
    <header className="bg-black border-b border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
            <img 
              src="/images/logo/LGOMARCA.png" 
              alt="Destrava Logo" 
              className="h-8 w-auto"
            />
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-300 hover:text-white transition-colors">
              Início
            </Link>
            <a href="https://instagram.com" className="text-gray-300 hover:text-white transition-colors">
              Instagram
            </a>
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user && (
              <>
                <span className="text-gray-300 text-sm">
                  Olá, {user.name}
                </span>
                {user.role === 'admin' && (
                  <Link 
                    href="/admin" 
                    className="text-primary-500 hover:text-primary-400 transition-colors text-sm"
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="flex items-center space-x-1 text-gray-300 hover:text-white transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-sm">Sair</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
