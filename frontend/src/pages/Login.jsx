import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ChevronRight, 
  CheckCircle, 
  Users, 
  BarChart3, 
  Clock,
  Sparkles,
  Shield,
  Globe,
  ArrowRight
} from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const { login, isLoading, isAuthenticated } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [emailFocused, setEmailFocused] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Please fill in all fields')
      return
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address')
      return
    }
    
    try {
      await login(email, password, rememberMe)
      toast.success('Welcome back! Redirecting to dashboard...')
      navigate('/dashboard')
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Unable to sign in'
      toast.error(message)
    }
  }

  // Demo credentials quick fill
  const fillDemoCredentials = () => {
    setEmail('admin@demo.com')
    setPassword('Admin123!')
    toast.success('Admin credentials filled')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
      </div>

      {/* Left Side - Hero Section with Images */}
      <div className="w-1/2 hidden lg:flex items-center justify-center relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1551434678-e076c2238b1b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-700/75 via-slate-900/70 to-pink-700/70" />
        <div className="absolute inset-0 bg-black/20" />

        <div className="relative z-10 text-white max-w-lg p-12">
          {/* Logo with Animation */}
          <div className="flex items-center gap-3 mb-8 animate-fade-in">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-xl">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">TaskHub</h1>
              <p className="text-white/70 text-sm">Enterprise Task Management</p>
            </div>
          </div>

          <h2 className="text-5xl font-bold mb-6 animate-slide-up">
            Transform the way 
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> your team works</span>
          </h2>
          
          <p className="text-xl text-white/80 mb-12 animate-slide-up animation-delay-100">
            Join thousands of teams who use TaskHub to collaborate, organize, and deliver exceptional results.
          </p>

          {/* Feature Grid */}
          <div className="grid grid-cols-2 gap-6 mb-12 animate-slide-up animation-delay-200">
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-white/10 group-hover:bg-white/20 transition-all duration-300 flex items-center justify-center backdrop-blur-sm">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold">Team Collaboration</p>
                <p className="text-white/60 text-sm">Real-time updates</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-white/10 group-hover:bg-white/20 transition-all duration-300 flex items-center justify-center backdrop-blur-sm">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold">Analytics</p>
                <p className="text-white/60 text-sm">Insightful reports</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-white/10 group-hover:bg-white/20 transition-all duration-300 flex items-center justify-center backdrop-blur-sm">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold">Time Tracking</p>
                <p className="text-white/60 text-sm">Stopwatch integration</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-white/10 group-hover:bg-white/20 transition-all duration-300 flex items-center justify-center backdrop-blur-sm">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold">Enterprise Security</p>
                <p className="text-white/60 text-sm">Bank-grade encryption</p>
              </div>
            </div>
          </div>

          {/* Trusted Companies */}
          <div className="animate-slide-up animation-delay-300">
            <p className="text-white/50 text-sm mb-4">TRUSTED BY LEADING TEAMS</p>
            <div className="flex gap-6 opacity-60">
              <img src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" alt="Google" className="h-6 invert" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" alt="Netflix" className="h-6 invert" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" alt="Microsoft" className="h-6 invert" />
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center relative z-10">
        <div className="w-full max-w-md p-8">
          {/* Glass Morphism Card */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20">
            <div className="text-center mb-8">
              <div className="lg:hidden flex justify-center mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-xl">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
              <p className="text-white/70">Sign in to access your workspace</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-white/80">
                  Email Address
                </label>
                <div className={`relative transition-all duration-300 ${emailFocused ? 'transform scale-[1.02]' : ''}`}>
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-white/80">
                  Password
                </label>
                <div className={`relative transition-all duration-300 ${passwordFocused ? 'transform scale-[1.02]' : ''}`}>
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-white/30 bg-white/5 text-purple-600 focus:ring-purple-500 focus:ring-offset-0"
                  />
                  <span className="ml-2 text-sm text-white/70">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </form>

            {/* Sign Up Link */}
            <div className="mt-6 text-center">
              <p className="text-white/70">
                Don't have an account?{' '}
                <Link to="/register" className="text-purple-400 hover:text-purple-300 font-medium hover:underline transition-all">
                  Create account
                </Link>
              </p>
            </div>

            {/* Demo Credentials */}
            <div className="mt-8 pt-6 border-t border-white/20">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="h-px flex-1 bg-white/20"></div>
                <p className="text-xs text-white/50 uppercase tracking-wider">Demo Access</p>
                <div className="h-px flex-1 bg-white/20"></div>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={fillDemoCredentials}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg transition-all duration-300 group"
                >
                  <p className="text-xs text-white/70 group-hover:text-white transition-colors">Admin Demo</p>
                  <p className="text-[10px] text-white/40">admin@demo.com</p>
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-white/40">
              © 2026 TaskHub. All rights reserved. |{' '}
              <Link to="/privacy" className="hover:text-white/60 transition-colors">Privacy</Link>
              {' '}·{' '}
              <Link to="/terms" className="hover:text-white/60 transition-colors">Terms</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

