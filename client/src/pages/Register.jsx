import React, { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import API from "../api"
import PasswordInput from "../components/PasswordInput"
import { ToastProvider, useToast } from "../components/ToastManager"

export default function Register() {
  return (
    <ToastProvider>
      <RegisterForm />
    </ToastProvider>
  )
}

function RegisterForm() {
  const [form, setForm] = useState({ name: "", email: "", password: "" })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { addToast } = useToast()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors(prev => ({ ...prev, [e.target.name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const errs = {}
    if (!form.name || form.name.trim().length < 3) errs.name = 'Full name must be at least 3 characters'
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!form.email || !emailRegex.test(form.email)) errs.email = 'Enter a valid email address'
    const pwd = form.password || ''
    if (pwd.length < 8) errs.password = 'Password must be at least 8 characters'
    if (!/[0-9]/.test(pwd) || !/[A-Za-z]/.test(pwd)) errs.password = 'Password must include letters and numbers'

    if (Object.keys(errs).length) {
      setErrors(errs)
      setLoading(false)
      return
    }

    try {
      await API.post("/auth/register", form)
      addToast({ message: "Registration successful! Redirecting...", type: "success" })
      setTimeout(() => navigate("/login"), 1500)
    } catch (err) {
      addToast({ message: err.response?.data?.error || "Registration failed", type: "error" })
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
          Create Your Account
        </h2>
        <p className="text-gray-500 dark:text-white text-center mb-6 text-sm animate-fade-in delay-100">
          Join the <span className="text-blue-600 font-medium">AI Resume Evaluator</span> and get job matches powered by intelligence.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 dark:text-white mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 transition"
            />
            {errors.name && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.name}</p>}
          </div>

          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 dark:text-white mb-1">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 transition"
            />
            {errors.email && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-white mb-1">Password</label>
            <PasswordInput
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Create a password"
              required
              showStrength
            />
            {errors.password && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-2 py-2.5 font-semibold rounded-lg text-white transition-all ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 shadow-lg"
            }`}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="text-center text-gray-500 dark:text-white text-sm mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline font-medium">
            Login here
          </Link>
        </p>
      </div>
    </section>
  )
}
