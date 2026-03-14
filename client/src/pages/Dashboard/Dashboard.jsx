import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import ResumeUpload from './ResumeUpload'
import JobMatches from './JobMatches'
import Profile from './Profile'

import Header from '../../components/Header'
import AnimatedTabs from '../../components/AnimatedTabs'
import { ToastProvider } from '../../components/ToastManager'
import Modal from '../../components/Modal'
import LoadingSpinner from '../../components/LoadingSpinner'

import { AuthContext } from '../../context/AuthContext'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("activeTab") || "resume"
  })

  const [showModal, setShowModal] = useState(false)
  const [modalContent, setModalContent] = useState(null)
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()
  const { user, logout } = useContext(AuthContext)

  const handleLogout = () => {
    localStorage.removeItem("activeTab")
    localStorage.removeItem("selectedResume")
    logout()
    navigate('/login')
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    localStorage.setItem("activeTab", tab)
  }

  const openModal = (content) => {
    setModalContent(content)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setModalContent(null)
  }

  const renderContent = () => {
    if (loading) return <LoadingSpinner message="Loading content..." />

    switch (activeTab) {
      case 'resume':
        return (
          <ResumeUpload
            setActiveTab={setActiveTab}
            openModal={openModal}
            setLoading={setLoading}
          />
        )
      case 'jobs':
        return (
          <JobMatches
            setActiveTab={setActiveTab}
            openModal={openModal}
            setLoading={setLoading}
          />
        )
      case 'profile':
        return <Profile openModal={openModal} setLoading={setLoading} />
      default:
        return (
          <ResumeUpload
            setActiveTab={setActiveTab}
            openModal={openModal}
            setLoading={setLoading}
          />
        )
    }
  }

  return (
    <ToastProvider>
      <div className="flex flex-col h-screen bg-white dark:bg-slate-900 dark:text-slate-200">
        <Header user={user} onLogout={handleLogout} />

        <div className="max-w-4xl mx-auto w-full px-4 mt-4 flex justify-center">
          <AnimatedTabs
            tabs={[
              { key: 'resume', label: 'Resume Upload' },
              { key: 'jobs', label: 'Job Matches' },
              { key: 'profile', label: 'Profile' }
            ]}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            center
          />
        </div>

        <main className="flex-1 p-6 overflow-y-auto bg-gray-50 dark:bg-slate-900 dark:text-slate-200">
          {renderContent()}
        </main>

        <Modal
          open={showModal}
          onClose={closeModal}
          title={modalContent?.title || ''}
          className="max-w-lg"
          footer={modalContent?.footer || null}
        >
          {modalContent?.body || null}
        </Modal>
      </div>
    </ToastProvider>
  )
}
