"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, RefreshCw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { authApi } from "@/services/authApi"
import { handleApiErrors } from "@/utils/apiResponse"
import { toast } from "@/components/ui/sonner"

const VerifyOtp = () => {
  const [code, setCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    const storedEmail = localStorage.getItem("forgotPasswordEmail")
    if (storedEmail) {
      setEmail(storedEmail)
    } else {
      // Redirect back if no email found
      navigate("/forgot-password")
    }
  }, [navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (code.length !== 6) {
      toast.error("Please enter a 6-digit code")
      return
    }

    setIsLoading(true)
    try {
      const response = await authApi.verifyOtp({
        code,
        type: "forgot_password"
      })

      if (response.success) {
        toast.success(response.message)
        localStorage.removeItem("forgotPasswordEmail")
        navigate("/reset-password")
      } else {
        toast.error(response.message || "Failed to verify code")
      }
    } catch (error) {
      console.error("OTP verification error:", error)
      toast.error("An unexpected error occurred. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (!email) {
      toast.error("Email not found. Please start over.")
      navigate("/forgot-password")
      return
    }

    setIsLoading(true)
    try {
      const response = await authApi.forgotPassword({ email })
      if (response.success) {
        toast.success("Verification code resent successfully!")
      } else {
        const errorResponse = {
          ...response,
          message: typeof response.message === 'string' ? response.message : "Failed to resend code"
        }
        handleApiErrors(errorResponse)
      }
    } catch (error) {
      console.error("Resend code error:", error)
      toast.error("An unexpected error occurred. Please try again later.")
    } finally {
      setIsLoading(false)
    }
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
          <CardTitle className="text-2xl font-bold text-beembyte-darkBlue dark:text-white">Verify Code</CardTitle>
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
              <Input
                className="text-center text-2xl font-bold text-black tracking-widest"
                value={code}
                maxLength={6}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                disabled={isLoading}
                placeholder="000000"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading || code.length !== 6}
              className="w-full bg-primary hover:bg-beembyte-lightBlue"
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
                disabled={isLoading}
                onClick={handleResendCode}
                className="text-sm text-beembyte-blue flex items-center gap-1.5"
              >
                <RefreshCw size={16} />
                Resend verification code
              </Button>
            </div>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center">
          <Link to="/forgot-password" className="flex items-center text-sm text-beembyte-blue hover:underline">
            <ArrowLeft size={16} className="mr-2" />
            Back to Email
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}

export default VerifyOtp
