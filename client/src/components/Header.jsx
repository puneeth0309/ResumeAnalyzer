import React, { useState, useRef, useEffect } from "react";
import Modal from "./Modal";
import logoSrc from "../assets/logo.png";
import { FiLogOut, FiUser, FiHelpCircle, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { motion } from "framer-motion";

export default function Header({ user, onLogout }) {
  const [logoOpen, setLogoOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [whatOpen, setWhatOpen] = useState(false);
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
  const menuRef = useRef(null);
  const wrapperRef = useRef(null);
  useEffect(() => {
    function handleDocClick(e) {
      if (!userMenuOpen) return;
      if (wrapperRef.current && wrapperRef.current.contains(e.target)) return;
      setUserMenuOpen(false);
    }
    document.addEventListener('click', handleDocClick);
    return () => document.removeEventListener('click', handleDocClick);
  }, [userMenuOpen]);
  const userInitial = user && user.name ? user.name.charAt(0).toUpperCase() : "?";


  return (
    <header className="
        bg-gradient-to-r from-blue-600 to-blue-500
        dark:from-slate-900 dark:to-slate-800
        text-white px-6 py-4 flex justify-between items-center
        shadow-md backdrop-blur-sm border-b border-blue-400/20 dark:border-slate-700/40
      ">
      
      <div className="flex items-center gap-4">
        <motion.button
          type="button"
          aria-label="Open logo"
          onClick={() => setLogoOpen(true)}
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.9 }}
          className="w-12 h-12 rounded-full overflow-hidden bg-white/20 dark:bg-white/5 
            flex items-center justify-center border border-white/20 backdrop-blur-md"
        >
          <img src={logoSrc} alt="logo" className="w-9 h-9 object-contain" />
        </motion.button>

        <div className="flex flex-col">
          <h1 className="text-lg font-semibold leading-tight">
            Welcome, <span className="font-bold">{user ? user.name : "..."}</span>
          </h1>
          <p className="text-xs opacity-80">
            Empowering your career — smart resume insights 🚀
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div ref={wrapperRef} className="relative">
          <div className="flex items-center gap-2 pr-2 border-r border-white/30">
            <motion.button
              type="button"
              aria-haspopup="menu"
              aria-expanded={userMenuOpen}
              aria-label="User menu"
              onClick={() => setUserMenuOpen(v => !v)}
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.9 }}
              className="w-12 h-12 rounded-full bg-white/20 dark:bg-white/5 flex items-center justify-center border border-white/20 backdrop-blur-md text-2xl font-bold text-white/90"
            >
              {userInitial}
            </motion.button>
          </div>

          {userMenuOpen && (
            <motion.div
              ref={menuRef}
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-md shadow-lg border border-gray-200 dark:border-slate-700 z-50 text-gray-800 dark:text-slate-200 overflow-hidden"
            >
              <button
                type="button"
                onClick={() => { setWhatOpen(true); setUserMenuOpen(false); }}
                className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-800 dark:text-slate-200 flex items-center gap-3"
              >
                <FiHelpCircle className="text-lg text-gray-700 dark:text-slate-200" />
                <span>What this do</span>
              </button>
              <button
                type="button"
                onClick={() => { setConfirmLogoutOpen(true); setUserMenuOpen(false); }}
                className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-slate-800 flex items-center gap-3 text-gray-800 dark:text-slate-200"
              >
                <FiLogOut className="text-lg text-gray-700 dark:text-slate-200" />
                <span>Logout</span>
              </button>
            </motion.div>
          )}
        </div>

        <motion.button
          onClick={() => { setConfirmLogoutOpen(true); }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
          className="hidden"
        />
      </div>

      <Modal
        open={logoOpen}
        title="App Logo"
        onClose={() => setLogoOpen(false)}
        className="max-w-sm"
      >
        <div className="flex items-center justify-center p-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-40 h-40 rounded-full overflow-hidden shadow-xl"
          >
            <img
              src={logoSrc}
              alt="main logo"
              className="w-full h-full object-cover hover:scale-105 transition duration-300"
            />
          </motion.div>
        </div>
      </Modal>

      <Modal open={whatOpen} title="What this does" onClose={() => setWhatOpen(false)}>
        <div className="p-4 text-gray-800 dark:text-slate-200">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4 justify-center">
              {[
                { id: 1, title: 'Upload', label: 'Resume uploaded', color: '#2563eb' },
                { id: 2, title: 'Parse', label: 'Extract skills', color: '#06b6d4' },
                { id: 3, title: 'Score', label: 'Compute fit', color: '#f59e0b' },
                { id: 4, title: 'AI', label: 'AI reasoning', color: '#ef4444' },
              ].map((step, i) => (
                <div key={step.id} className="flex items-center gap-4">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex flex-col items-center"
                  >
                    <div style={{ width: 64, height: 64 }} className="rounded-full flex items-center justify-center shadow-inner" aria-hidden>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" fill="${step.color}" opacity="0.12" />
                        {step.id === 1 && <path d="M12 5v8" stroke={step.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>}
                        {step.id === 1 && <path d="M8 9l4-4 4 4" stroke={step.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>}
                        {step.id === 2 && <rect x="7" y="6" width="10" height="2" rx="1" fill={step.color} />}
                        {step.id === 2 && <rect x="7" y="10" width="10" height="2" rx="1" fill={step.color} />}
                        {step.id === 3 && <path d="M4 14h6v6H4zM14 10h6v10h-6z" fill={step.color} />}
                        {step.id === 4 && <path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8" stroke={step.color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />}
                      </svg>
                    </div>
                    <div className="text-center mt-2">
                      <div className="text-sm font-semibold">{step.title}</div>
                      <div className="text-xs text-gray-600 dark:text-slate-300">{step.label}</div>
                    </div>
                  </motion.div>
                  {i < 3 && (
                    <motion.div className="w-12 h-1 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-slate-700 dark:to-slate-600 rounded-full" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: i * 0.08, duration: 0.6 }} />
                  )}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <motion.div initial={{ x: -8, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="p-3 rounded border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-900">
                <h5 className="font-semibold">Upload & Parse</h5>
                <p className="text-xs text-gray-600 dark:text-slate-300">When you upload a resume, the parser extracts structured data (name, contacts) and a skills list using lightweight NLP. Files are stored securely.</p>
              </motion.div>
              <motion.div initial={{ x: 8, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="p-3 rounded border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-900">
                <h5 className="font-semibold">Scoring & Matching</h5>
                <p className="text-xs text-gray-600 dark:text-slate-300">The server computes similarity scores between resume skills and job requirements. Top matches are selected for deeper analysis.</p>
              </motion.div>
              <motion.div initial={{ x: -8, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="p-3 rounded border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-900">
                <h5 className="font-semibold">AI Reasoning</h5>
                <p className="text-xs text-gray-600 dark:text-slate-300">Selected jobs are sent to the AI service which returns JSON-formatted reasoning: fit_skills, missing_skills and a short human-readable explanation.</p>
              </motion.div>
              <motion.div initial={{ x: 8, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="p-3 rounded border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-900">
                <h5 className="font-semibold">Save & View</h5>
                <p className="text-xs text-gray-600 dark:text-slate-300">Results are stored in the matches table and returned to the UI where you can review reasoning, fit score, and suggested improvements.</p>
              </motion.div>
            </div>
          </div>
        </div>
      </Modal>
      <Modal
        open={confirmLogoutOpen}
        title="Confirm Logout"
        onClose={() => setConfirmLogoutOpen(false)}
      >
        <div className="p-4 text-gray-800 dark:text-slate-200">
          <p>Are you sure you want to logout?</p>
          <div className="mt-6 flex justify-end gap-4"> 
            <button
              type="button"
              onClick={() => setConfirmLogoutOpen(false)}
              className="px-4 py-2 rounded bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 transition"
            >
              Cancel
            </button> 
            <button
              type="button"
              onClick={() => {
                setConfirmLogoutOpen(false);
                if (typeof onLogout === 'function') {
                  try {
                    onLogout();
                  } catch (err) {
                  }
                } else {
                  try { localStorage.removeItem('token'); } catch (e) {}
                  try { window.location.href = '/login'; } catch (e) {}
                }
              }}
              className="px-4 py-2 rounded bg-red-500 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-900 transition"
            >
              Logout
            </button>
          </div>
          </div>
        </Modal>

    </header>
  )
}
