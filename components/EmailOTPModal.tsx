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

export default function EmailOTPAuth({ onSuccess }: EmailOTPProps) {
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
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
              ? 'We\'ll send a one-time code to your email'
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
