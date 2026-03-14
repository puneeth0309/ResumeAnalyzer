import React, { useState } from "react"
import { useNavigate, useParams, Link } from "react-router-dom"
import API from "../api"
import PasswordInput from "../components/PasswordInput"
import { ToastProvider, useToast } from "../components/ToastManager"

export default function ResetPassword() {
  return (
    <ToastProvider>
      <ResetPasswordForm />
    </ToastProvider>
  )
}

function ResetPasswordForm() {
  const [form, setForm] = useState({ password: "", confirmPassword: "" })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { token } = useParams()
  const { addToast } = useToast()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors(prev => ({ ...prev, [e.target.name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const errs = {}
    if (!form.password || form.password.length < 8) errs.password = 'Password must be at least 8 characters long'
    if (!/[0-9]/.test(form.password) || !/[A-Za-z]/.test(form.password)) errs.password = 'Password must include letters and numbers'
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match'

    if (Object.keys(errs).length) {
      setErrors(errs)
      setLoading(false)
      return
    }

    try {
      await API.post(`/auth/reset-password/${token}`, { password: form.password })
      addToast({ message: "Password reset successful! Redirecting...", type: "success" })
      setTimeout(() => navigate("/login"), 1500)
    } catch (err) {
      addToast({ message: err.response?.data?.error || "Failed to reset password.", type: "error" })
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
          Reset Password
        </h2>
        <p className="text-gray-500 dark:text-white text-center mb-6 text-sm animate-fade-in delay-100">
          Enter your new password below to regain access to your account.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-white mb-1">
              New Password
            </label>
            <PasswordInput
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter new password"
              required
              showStrength
            />
            {errors.password && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-white mb-1">
              Confirm Password
            </label>
            <PasswordInput
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm new password"
              required
            />
            {errors.confirmPassword && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.confirmPassword}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-2 py-2.5 font-semibold rounded-lg text-white transition-all ${
              loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-lg"
            }`}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <p className="text-center text-gray-500 dark:text-white text-sm mt-6">
          Back to{" "}
          <Link to="/login" className="text-blue-600 hover:underline font-medium">
            Login
          </Link>
        </p>
      </div>
    </section>
  )
}
