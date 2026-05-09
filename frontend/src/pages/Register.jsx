import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight,
  Sparkles,
  CheckCircle,
  Rocket,
  Target,
  Zap,
  Shield,
  Users,
  BarChart3
} from 'lucide-react'

export default function Register() {
  const navigate = useNavigate()
  const { register, isLoading, isAuthenticated } = useAuthStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [focusedField, setFocusedField] = useState(null)
  
  // Password strength indicators
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    number: false,
    special: false
  })

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    setPasswordStrength({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    })
  }, [password])

  const getPasswordStrengthScore = () => {
    const strength = Object.values(passwordStrength).filter(Boolean).length
    if (strength <= 1) return { text: 'Weak', color: 'text-red-500', bg: 'bg-red-500' }
    if (strength <= 2) return { text: 'Fair', color: 'text-orange-500', bg: 'bg-orange-500' }
    if (strength <= 3) return { text: 'Good', color: 'text-yellow-500', bg: 'bg-yellow-500' }
    return { text: 'Strong', color: 'text-green-500', bg: 'bg-green-500' }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!name || !email || !password || !confirmPassword) {
      toast.error('Please fill in all fields')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    if (!agreeToTerms) {
      toast.error('Please agree to the Terms of Service')
      return
    }

    try {
      await register(name, email, password)
      toast.success('Account created successfully! Redirecting to dashboard...')
      navigate('/dashboard')
    } catch (error) {
      // Error is handled by the store
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
      </div>

      {/* Left Side - Hero Section */}
      <div className="w-1/2 hidden lg:flex items-center justify-center relative">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20"></div>
        
        {/* Background Image Overlay */}
        <div className="absolute inset-0 opacity-10">
          <img 
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
            alt="Team collaboration"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10 text-white max-w-lg p-12">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8 animate-fade-in">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-xl">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">TaskHub</h1>
              <p className="text-white/70 text-sm">Join the future of work</p>
            </div>
          </div>

          <h2 className="text-5xl font-bold mb-6 animate-slide-up">
            Start your 
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> journey</span>
            <br />with us today
          </h2>
          
          <p className="text-xl text-white/80 mb-12 animate-slide-up animation-delay-100">
            Create your free account and experience the most intuitive task management platform.
          </p>

          {/* Statistics */}
          <div className="grid grid-cols-3 gap-6 mb-12 animate-slide-up animation-delay-200">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">10K+</div>
              <div className="text-white/60 text-sm mt-1">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">500+</div>
              <div className="text-white/60 text-sm mt-1">Companies</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">1M+</div>
              <div className="text-white/60 text-sm mt-1">Tasks Completed</div>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-3 animate-slide-up animation-delay-300">
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-white/10 group-hover:bg-white/20 transition-all duration-300 flex items-center justify-center">
                <Rocket className="w-4 h-4" />
              </div>
              <p className="text-white/80">Fast and intuitive interface</p>
            </div>
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-white/10 group-hover:bg-white/20 transition-all duration-300 flex items-center justify-center">
                <Target className="w-4 h-4" />
              </div>
              <p className="text-white/80">Achieve your goals faster</p>
            </div>
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-white/10 group-hover:bg-white/20 transition-all duration-300 flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
              <p className="text-white/80">Boost team productivity</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center relative z-10 py-8">
        <div className="w-full max-w-md p-8">
          {/* Glass Morphism Card */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20">
            <div className="text-center mb-8">
              <div className="lg:hidden flex justify-center mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-xl">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
              <p className="text-white/70">Join TaskHub and start collaborating</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name Field */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-white/80">
                  Full Name
                </label>
                <div className={`relative transition-all duration-300 ${focusedField === 'name' ? 'transform scale-[1.02]' : ''}`}>
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-white/80">
                  Email Address
                </label>
                <div className={`relative transition-all duration-300 ${focusedField === 'email' ? 'transform scale-[1.02]' : ''}`}>
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-white/80">
                  Password
                </label>
                <div className={`relative transition-all duration-300 ${focusedField === 'password' ? 'transform scale-[1.02]' : ''}`}>
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    placeholder="Create a strong password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {password && (
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/60">Password strength:</span>
                      <span className={getPasswordStrengthScore().color}>
                        {getPasswordStrengthScore().text}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {Object.values(passwordStrength).map((valid, index) => (
                        <div 
                          key={index}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            valid ? getPasswordStrengthScore().bg : 'bg-white/20'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className={`flex items-center gap-1 ${passwordStrength.length ? 'text-green-400' : 'text-white/40'}`}>
                        <CheckCircle className="w-3 h-3" />
                        <span>8+ characters</span>
                      </div>
                      <div className={`flex items-center gap-1 ${passwordStrength.uppercase ? 'text-green-400' : 'text-white/40'}`}>
                        <CheckCircle className="w-3 h-3" />
                        <span>Uppercase letter</span>
                      </div>
                      <div className={`flex items-center gap-1 ${passwordStrength.number ? 'text-green-400' : 'text-white/40'}`}>
                        <CheckCircle className="w-3 h-3" />
                        <span>Number</span>
                      </div>
                      <div className={`flex items-center gap-1 ${passwordStrength.special ? 'text-green-400' : 'text-white/40'}`}>
                        <CheckCircle className="w-3 h-3" />
                        <span>Special character</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-white/80">
                  Confirm Password
                </label>
                <div className={`relative transition-all duration-300 ${focusedField === 'confirm' ? 'transform scale-[1.02]' : ''}`}>
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onFocus={() => setFocusedField('confirm')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
                )}
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-white/30 bg-white/5 text-purple-600 focus:ring-purple-500 focus:ring-offset-0"
                />
                <label htmlFor="terms" className="text-sm text-white/70">
                  I agree to the{' '}
                  <Link to="/terms" className="text-purple-400 hover:text-purple-300 transition-colors">
                    Terms of Service
                  </Link>
                  {' '}and{' '}
                  <Link to="/privacy" className="text-purple-400 hover:text-purple-300 transition-colors">
                    Privacy Policy
                  </Link>
                </label>
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
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </form>

            {/* Sign In Link */}
            <div className="mt-6 text-center">
              <p className="text-white/70">
                Already have an account?{' '}
                <Link to="/login" className="text-purple-400 hover:text-purple-300 font-medium hover:underline transition-all">
                  Sign in
                </Link>
              </p>
            </div>

            {/* Trust Badge */}
            <div className="mt-6 pt-4 text-center">
              <div className="flex items-center justify-center gap-4 text-white/40 text-xs">
                <span>🔒 Secure encryption</span>
                <span>✓ 30-day trial</span>
                <span>💳 No credit card required</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-white/40">
              © 2026 TaskHub. All rights reserved.
            </p>
          </div>
        </div>
      </div>

    </div>
  )
}