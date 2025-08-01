"use client"

import type React from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"
import Landing from "./pages/Landing"
import Login from "./pages/Login"
import Register from "./pages/Register"
import ForgotPassword from "./pages/ForgotPassword"
import VerifyOtp from "./pages/VerifyOtp"
import ResetPassword from "./pages/ResetPassword"
import AboutUs from "./pages/AboutUs"
import Careers from "./pages/Careers"
import Terms from "./pages/Terms"
import HelpCenter from "./pages/HelpCenter"
import Index from "./pages/Index"
import { Layout } from "./components/layout/Layout"
import Profile from "./pages/Profile"

import TaskHistory from "./pages/TaskHistory"
import TaskDetail from "./pages/TaskDetail"
import CreateTask from "./pages/CreateTask"
import Chat from "./pages/Chat"
import Notifications from "./pages/Notifications"
import WaitingScreen from "./pages/WaitingScreen"
import Wallet from "./pages/Wallet"
import PriceEstimate from "./pages/PriceEstimate"
import NotFound from "./pages/NotFound"
import VerifyCode from "./pages/VerifyCode"
import Feed from "./pages/Feed"
import { SingleFeed } from "./pages/SingleFeed"
import { useAuthGuard } from "@/hooks/useAuthGuard"
import SuggestedUsers from "./pages/SuggestedUsers"
import Messages from "./pages/Messages"
import UserProfile from "./pages/UserProfile"

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthGuard(true)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    // useAuthGuard will handle the redirect, so we can return null or a loading state
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return <>{children}</>
}

// Auth Route Component (only redirects from login/register, not landing)
const AuthRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Simple check without calling useAuthGuard to avoid auth verification
  const hasAuthCookie = document.cookie.includes("authToken=")

  console.log("🔍 AuthRoute check:", { hasAuthCookie });

  if (hasAuthCookie) {
    console.log("🔍 User has auth cookie, redirecting to feed");
    return <Navigate to="/feed" replace />
  }

  return <>{children}</>
}

// Root Route Component - simple redirect to landing
const RootRoute: React.FC = () => {
  // Simple check without triggering auth verification
  const hasAuthCookie = document.cookie.includes("authToken=")

  console.log("🔍 RootRoute check:", { hasAuthCookie });

  // If authenticated, go to feed, otherwise go to landing
  const redirectTo = hasAuthCookie ? "/feed" : "/landing";
  console.log("🔍 RootRoute redirecting to:", redirectTo);

  return <Navigate to={redirectTo} replace />
}

function App() {
  return (
    <div className="app h-screen">
      <Routes>
        {/* Root route - simple redirect to landing or dashboard */}
        <Route path="/" element={<RootRoute />} />

        {/* Landing page - accessible to everyone */}
        <Route path="/landing" element={<Landing />} />

        {/* Auth Routes - redirect authenticated users to dashboard */}
        <Route
          path="/login"
          element={
            <AuthRoute>
              <Login />
            </AuthRoute>
          }
        />
        <Route
          path="/register"
          element={
            <AuthRoute>
              <Register />
            </AuthRoute>
          }
        />
        <Route
          path="/verify-code"
          element={
            <AuthRoute>
              <VerifyCode />
            </AuthRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <AuthRoute>
              <ForgotPassword />
            </AuthRoute>
          }
        />
        <Route
          path="/verify-otp"
          element={
            <AuthRoute>
              <VerifyOtp />
            </AuthRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <AuthRoute>
              <ResetPassword />
            </AuthRoute>
          }
        />

        {/* Public routes accessible to everyone */}
        <Route path="/about" element={<AboutUs />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/help" element={<HelpCenter />} />
        {/* Feed is now public - no authentication required */}

        {/* Protected Routes */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Index />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/feed"
          element={
            <ProtectedRoute>
              <Layout>
                <Feed />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/feed/:postId"
          element={
            <ProtectedRoute>
              <Layout>
                <SingleFeed />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:userId"
          element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/task-history"
          element={
            <ProtectedRoute>
              <Layout>
                <TaskHistory />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/task/:taskId"
          element={
            <ProtectedRoute>
              <Layout>
                <TaskDetail />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-task"
          element={
            <ProtectedRoute>
              <Layout>
                <CreateTask />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat/:taskId"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Layout>
                <Notifications />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/waiting/:taskId"
          element={
            <ProtectedRoute>
              <Layout>
                <WaitingScreen />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/wallet"
          element={
            <ProtectedRoute>
              <Layout>
                <Wallet />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/price-estimate"
          element={
            <ProtectedRoute>
              <Layout>
                <PriceEstimate />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/suggested-users"
          element={
            <ProtectedRoute>
              <Layout>
                <SuggestedUsers />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <Layout>
                <Messages />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/messages/:userId"
          element={
            <ProtectedRoute>
              <Layout>
                <Messages />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/user/:userId"
          element={
            <ProtectedRoute>
              <Layout>
                <UserProfile />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </div>
  )
}

export default App
