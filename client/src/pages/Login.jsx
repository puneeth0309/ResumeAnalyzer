import React, { useContext, useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import API from "../api"
import { AuthContext } from "../context/AuthContext"
import PasswordInput from "../components/PasswordInput"
import { ToastProvider, useToast } from "../components/ToastManager"

export default function Login() {
  return (
    <ToastProvider>
      <LoginForm />
    </ToastProvider>
  )
}

function LoginForm() {
  const [form, setForm] = useState({ email: "", password: "" })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { setUser } = useContext(AuthContext)
  const { addToast } = useToast()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors(prev => ({ ...prev, [e.target.name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const errs = {}
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!form.email || !emailRegex.test(form.email)) errs.email = 'Please enter a valid email address'

    if (Object.keys(errs).length) {
      setErrors(errs)
      setLoading(false)
      return
    }

    try {
      const res = await API.post("/auth/login", form)
      const token = res.data.token
      localStorage.setItem("token", token)
      setUser(res.data.user)
      addToast({ message: "Login successful! Redirecting...", type: "success" })
      setTimeout(() => navigate("/dashboard"), 1000)
    } catch (err) {
      addToast({ message: err.response?.data?.error || "Invalid credentials", type: "error" })
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
          Welcome Back,
        </h2>
        <p className="text-gray-500 dark:text-white text-center mb-6 text-sm animate-fade-in delay-100">
          Log in to continue to your <span className="font-medium text-blue-600">AI Resume Evaluator</span>
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
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
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-semibold text-gray-700 dark:text-white">Password</label>
              <Link
                to="/forgot-password"
                className="text-xs text-blue-600 hover:underline font-medium"
              >
                Forgot Password?
              </Link>
            </div>
            <PasswordInput
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
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
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-gray-500 dark:text-white text-sm mt-6">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-600 hover:underline font-medium">
            Register here
          </Link>
        </p>
      </div>
    </section>
  )
}
