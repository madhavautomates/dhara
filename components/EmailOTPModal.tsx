'use client'

import { useState } from 'react'
import { Mail, Lock, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'

interface EmailOTPProps {
  onSuccess: () => void
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

export default function EmailOTPAuth({ onSuccess }: EmailOTPProps) {
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendTimer, setResendTimer] = useState(0)

  const startResendTimer = () => {
    setResendTimer(60)
    const interval = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) { clearInterval(interval); return 0 }
        return t - 1
      })
    }, 1000)
  }

  const handleGoogle = async () => {
    setGoogleLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/checkout`,
      },
    })
    if (error) {
      setError(error.message)
      setGoogleLoading(false)
    }
    // on success the browser redirects — no need to setGoogleLoading(false)
  }

  const sendOTP = async () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address')
      return
    }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    })
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    setStep('otp')
    startResendTimer()
  }

  const verifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter the 6-digit OTP')
      return
    }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email',
    })
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    onSuccess()
  }

  return (
    <div className="rounded-2xl border border-sky-100 bg-sky-50 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100">
          {step === 'email' ? (
            <Mail className="h-5 w-5 text-sky-600" />
          ) : (
            <Lock className="h-5 w-5 text-sky-600" />
          )}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">
            {step === 'email' ? 'Login to place order' : 'Verify your email'}
          </h3>
          <p className="text-xs text-gray-500">
            {step === 'email'
              ? 'Sign in with Google or use email OTP'
              : `Code sent to ${email}`}
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      {step === 'email' ? (
        <div className="space-y-3">
          {/* Google Sign In */}
          <Button
            variant="outline"
            className="w-full bg-white hover:bg-gray-50 font-medium"
            loading={googleLoading}
            onClick={handleGoogle}
          >
            {!googleLoading && <GoogleIcon />}
            Continue with Google
          </Button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">or use email OTP</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          {/* Email OTP */}
          <div>
            <Label htmlFor="otp-email">Email Address</Label>
            <Input
              id="otp-email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendOTP()}
              className="mt-1 bg-white"
            />
          </div>
          <Button className="w-full" loading={loading} onClick={sendOTP}>
            <Mail className="h-4 w-4 mr-2" />
            Send OTP
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <Label htmlFor="otp-code">6-Digit OTP</Label>
            <Input
              id="otp-code"
              type="text"
              placeholder="123456"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              onKeyDown={(e) => e.key === 'Enter' && verifyOTP()}
              className="mt-1 bg-white text-center text-xl tracking-[0.5em] font-bold"
            />
          </div>
          <Button className="w-full" loading={loading} onClick={verifyOTP}>
            <Lock className="h-4 w-4 mr-2" />
            Verify & Continue
          </Button>
          <div className="flex items-center justify-between">
            <button
              className="text-xs text-gray-500"
              onClick={() => { setStep('email'); setOtp(''); setError('') }}
            >
              Change email
            </button>
            {resendTimer > 0 ? (
              <span className="text-xs text-gray-400">Resend in {resendTimer}s</span>
            ) : (
              <button
                className="flex items-center gap-1 text-xs text-sky-600 hover:underline"
                onClick={() => { setOtp(''); setError(''); sendOTP() }}
              >
                <RefreshCw className="h-3 w-3" />
                Resend OTP
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
