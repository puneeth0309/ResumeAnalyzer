import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import Register from './pages/Register'
import Login from './pages/Login'
import Protected from './pages/Protected'
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from './pages/Dashboard/Dashboard.jsx'
import AuthProvider from './context/AuthContext';
import { ResumeProvider } from "./context/ResumeContext.jsx";
// ThemeProvider removed — no theme context
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
     <AuthProvider>
       <Routes>
          <Route path="/" element={<App />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/dashboard"
            element={
              <ResumeProvider>
                <Dashboard />
              </ResumeProvider>
            }
          />
        </Routes>
  </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
