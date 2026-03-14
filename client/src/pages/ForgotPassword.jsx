import React, { useState } from "react"
import { Link } from "react-router-dom"
import API from "../api"
import { ToastProvider, useToast } from "../components/ToastManager"

export default function ForgotPassword() {
  return (
    <ToastProvider>
      <ForgotPasswordForm />
    </ToastProvider>
  )
}

function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const { addToast } = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const errs = {}
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailRegex.test(email)) errs.email = 'Please enter a valid email address'

    if (Object.keys(errs).length) {
      setErrors(errs)
      setLoading(false)
      return
    }

    try {
      await API.post("/auth/forgot-password", { email })
      addToast({ message: "Password reset link sent to your email!", type: "success" })
    } catch (err) {
      addToast({ message: err.response?.data?.error || "Failed to send reset link. Try again.", type: "error" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden px-6">
      <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] bg-blue-300/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[350px] h-[350px] bg-indigo-300/20 rounded-full blur-3xl animate-pulse"></div>

      <div className="relative z-10 w-full max-w-md bg-white dark:bg-slate-800 dark:text-slate-200 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 p-8 transform transition-transform hover:scale-105 duration-300">
        <h2 className="text-3xl font-extrabold text-gray-800 dark:text-white text-center mb-2 animate-fade-in">
          Forgot Password
        </h2>
        <p className="text-gray-500 dark:text-white text-center mb-6 text-sm animate-fade-in delay-100">
          Enter your registered email, and we’ll send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-white mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: '' })); }}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
            {errors.email && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.email}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-2 py-2.5 font-semibold rounded-lg text-white transition-all ${
              loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-lg"
            }`}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <p className="text-center text-gray-500 dark:text-white text-sm mt-6">
          Remembered your password?{" "}
          <Link
            to="/login"
            className="text-blue-600 hover:underline font-medium"
          >
            Back to Login
          </Link>
        </p>
      </div>
    </section>
  )
}
