import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const CONSENT_KEY = 'taskhub_cookie_consent'

function hasConsent() {
  if (typeof window === 'undefined') {
    return true
  }

  return window.localStorage.getItem(CONSENT_KEY) === 'accepted'
}

function acceptConsent() {
  window.localStorage.setItem(CONSENT_KEY, 'accepted')
  window.document.cookie = 'taskhub_cookie_consent=accepted; path=/; max-age=31536000; SameSite=Lax'
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(!hasConsent())
  }, [])

  if (!visible) {
    return null
  }

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 md:inset-x-auto md:right-4 md:bottom-4 md:w-[420px]">
      <div className="rounded-2xl border border-white/10 bg-slate-950/95 p-5 shadow-2xl backdrop-blur-xl">
        <p className="text-sm font-semibold text-white">Cookie consent</p>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          We use essential cookies to keep you signed in and improve your experience.
          Review our <Link to="/terms" className="text-purple-400 hover:text-purple-300">Terms of Service</Link>{' '}
          and <Link to="/privacy" className="text-purple-400 hover:text-purple-300">Privacy Policy</Link>.
        </p>
        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              acceptConsent()
              setVisible(false)
            }}
            className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-sm font-semibold text-white transition hover:shadow-lg hover:shadow-purple-500/25"
          >
            Accept Cookies
          </button>
          <span className="text-xs text-slate-400">Required on first visit</span>
        </div>
      </div>
    </div>
  )
}