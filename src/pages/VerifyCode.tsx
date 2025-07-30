"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, RefreshCw } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { Input } from "@/components/ui/input"

const VerifyCode = () => {
  const [code, setCode] = useState("")
  const [countdown, setCountdown] = useState(120) // 2 minutes in seconds
  const { isLoading, verifyCode, resendVerification, resendCountdown } = useAuth()
  const [email, setEmail] = useState(localStorage.getItem("authEmail") ? localStorage.getItem("authEmail") : "")

  // Initialize countdown from resendCountdown if available, otherwise set to 120 seconds
  useEffect(() => {
    if (resendCountdown > 0) {
      setCountdown(resendCountdown)
    }
  }, [resendCountdown])

  // Countdown timer effect
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((prev) => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])



  // Format time as MM:SS
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60)
    const seconds = timeInSeconds % 60
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (code.length !== 6) {
      return
    }
    await verifyCode(code)
  }

  const handleResendCode = async () => {
    await resendVerification()
    setCountdown(120) // Reset countdown after resending
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-white to-beembyte-softBlue/30 dark:from-beembyte-darkBlue dark:to-secondary/80 relative overflow-hidden">
      {/* Decorative backgrounds */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Logo background */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5">
          <img
            src="/lovable-uploads/1c57582a-5db7-4f2b-a553-936b472ba1a2.png"
            alt=""
            className="w-[800px] h-[800px] dark:invert"
          />
        </div>

        {/* Blur effects */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-beembyte-blue/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl"></div>
      </div>

      {/* Return to landing */}
      <Link
        to="/landing"
        className="absolute top-6 left-6 flex items-center space-x-2 text-beembyte-darkBlue dark:text-white"
      >
        <img
          src="/lovable-uploads/1c57582a-5db7-4f2b-a553-936b472ba1a2.png"
          alt="beembyte"
          className="h-8 w-auto invert dark:invert-0"
        />
        <span className="font-bold">beembyte</span>
      </Link>

      <Card className="w-full max-w-md shadow-lg border-0 dark:bg-gray-900/70 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold text-beembyte-darkBlue dark:text-white">Verify Your Email</CardTitle>
          <CardDescription>
            {email ? (
              <>
                Enter the 6-digit code sent to <span className="font-medium">{email}</span>
              </>
            ) : (
              <>Enter the 6-digit verification code</>
            )}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center py-4">
              {/* <InputOTP
                maxLength={6}
                value={code}
                onChange={(value) => setCode(value.slice(0, 6))}
                disabled={isLoading}
                containerClassName="gap-4"
                render={({ slots }) => (
                  <InputOTPGroup className="gap-3">
                    {slots.map((slot, index) => (
                      <InputOTPSlot key={index} {...slot} index={index} className="h-14 w-14 text-xl font-bold rounded-md shadow-sm" />
                    ))}
                  </InputOTPGroup>
                )}
              /> */}
              <Input
                className="text-center text-2xl font-bold text-black"
                value={code}
                maxLength={6}
                onChange={(value) => setCode(value.target.value)}
                disabled={isLoading}
              />
            </div>

            {/* Countdown timer display */}
            <div className="text-center text-sm">
              {(countdown > 0 || resendCountdown > 0) && (
                <div className="flex justify-center items-center gap-2">
                  <span className="text-black dark:text-white font-medium">Time remaining:</span>
                  <span className="font-mono text-black dark:text-white">{formatTime(countdown > 0 ? countdown : resendCountdown)}</span>
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading || code.length !== 6}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  Verifying...
                </span>
              ) : (
                "Verify Code"
              )}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="ghost"
                disabled={isLoading || countdown > 0 || resendCountdown > 0}
                onClick={handleResendCode}
                className="text-sm text-primary flex items-center gap-1.5"
              >
                <RefreshCw size={16} className={countdown > 0 || resendCountdown > 0 ? "" : "animate-spin"} />
                {countdown > 0 || resendCountdown > 0 ? "Wait before resending" : "Resend verification code"}
              </Button>
            </div>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center">
          <Link to="/login" className="flex items-center text-sm text-primary hover:underline">
            <ArrowLeft size={16} className="mr-2" />
            Back to Login
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}

export default VerifyCode
