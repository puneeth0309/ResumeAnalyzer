import React, { useContext, useEffect, useState } from "react";
import API from "../../api";
import { ResumeContext } from "../../context/ResumeContext.jsx";
import ResumeListItem from '../../components/ResumeListItem';
import JobMatchCard from '../../components/JobMatchCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import Toast from '../../components/Toast';
import { ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function JobMatches() {
  const { selectedResume, setSelectedResume } = useContext(ResumeContext);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedPanel, setExpandedPanel] = useState(null); 
  const [resumes, setResumes] = useState([]);
  const [matchData, setMatchData] = useState(null);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '' });

  const showSlowLoadingToast = (message) => {
    const timer = setTimeout(() => {
      setToast({ open: true, message });
    }, 1500); 
    return timer;
  };

  useEffect(() => {
    let mounted = true;
    let slowToastTimer;
    async function fetchResumes() {
      try {
        setLoadingResumes(true);
        slowToastTimer = showSlowLoadingToast("Loading resumes is taking longer than usual...");
        const res = await API.get("/resume/history");
        if (!mounted) return;
        setResumes(res.data);
      } catch (err) {
        if (!mounted) return;
        setResumes([]);
        setToast({ open: true, message: 'Failed to fetch resumes' });
      } finally {
        if (mounted) {
          setLoadingResumes(false);
          clearTimeout(slowToastTimer);
        }
      }
    }
    fetchResumes();
    return () => { mounted = false; clearTimeout(slowToastTimer); }
  }, []);

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 767px)');
    const onChange = (e) => setIsMobile(e.matches);
    setIsMobile(mql.matches);
    if (mql.addEventListener) mql.addEventListener('change', onChange);
    else mql.addListener(onChange);
    return () => {
      if (mql.removeEventListener) mql.removeEventListener('change', onChange);
      else mql.removeListener(onChange);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    let slowToastTimer;
    async function fetchMatches() {
      if (!selectedResume?.id) return;
      try {
        setLoadingMatches(true);
        slowToastTimer = showSlowLoadingToast("Matching jobs is taking longer than usual...");
        const res = await API.post("/get/job-matches", { resume_id: selectedResume.id });
        if (!mounted) return;
        setMatchData(res.data);
      } catch (err) {
        if (!mounted) return;
        setMatchData(null);
        setToast({ open: true, message: 'Failed to fetch job matches' });
      } finally {
        if (mounted) {
          setLoadingMatches(false);
          clearTimeout(slowToastTimer);
        }
      }
    }
    fetchMatches();
    return () => { mounted = false; clearTimeout(slowToastTimer); }
  }, [selectedResume]);

  const handleSelectResume = (resume) => {
    setSelectedResume(resume);
    setMatchData(null);
    if (isMobile) setExpandedPanel('matches');
  };

  const listItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } }
  };

  const panelVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { opacity: 1, height: 'auto' },
    exit: { opacity: 0, height: 0 }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-6 dark:text-slate-200">

      <div className="md:hidden mb-2">
        <button
          type="button"
          onClick={() => setExpandedPanel(expandedPanel === 'resumes' ? null : 'resumes')}
          className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-slate-700 dark:to-slate-800 rounded-lg shadow hover:scale-105 transition-transform duration-200"
        >
          <div>
            <h3 className="text-lg font-semibold">Uploaded Resumes</h3>
            <p className="text-xs text-gray-500 dark:text-gray-300">{resumes.length} saved</p>
          </div>
          {expandedPanel === 'resumes' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {(expandedPanel === 'resumes' || !isMobile) && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={panelVariants}
            className="md:block bg-white dark:bg-slate-800 dark:text-slate-200 p-4 rounded-lg shadow-md overflow-y-auto md:max-h-[600px]"
          >
            <h3 className="text-lg font-semibold mb-4 border-b border-gray-200 dark:border-slate-700 pb-2">Uploaded Resumes</h3>
            {loadingResumes ? (
              <LoadingSpinner message="Loading resumes..." />
            ) : resumes.length === 0 ? (
              <p className="text-gray-500 text-sm dark:text-gray-300">No resumes uploaded yet.</p>
            ) : (
              <motion.ul initial="hidden" animate="visible" variants={containerVariants} className="divide-y">
                {resumes.map((r) => (
                  <motion.li key={r.id} variants={listItemVariants}>
                    <ResumeListItem
                      resume={r}
                      selected={selectedResume?.id === r.id}
                      onSelect={handleSelectResume}
                      hoverEffect
                    />
                  </motion.li>
                ))}
              </motion.ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="md:hidden mt-4 mb-2">
        <button
          type="button"
          onClick={() => setExpandedPanel(expandedPanel === 'matches' ? null : 'matches')}
          className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-green-50 to-green-100 dark:from-slate-700 dark:to-slate-800 rounded-lg shadow hover:scale-105 transition-transform duration-200"
        >
          <div>
            <h3 className="text-lg font-semibold">Job Matches</h3>
          </div>
          {expandedPanel === 'matches' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {(expandedPanel === 'matches' || !isMobile) && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={panelVariants}
            className="md:col-span-2 md:block bg-white dark:bg-slate-800 dark:text-slate-200 p-6 rounded-lg shadow-md overflow-y-auto md:max-h-[600px]"
          >
            {!selectedResume ? (
              <p className="text-center mt-20 text-red-600 dark:text-red-400">No resume selected. Select one from the left panel.</p>
            ) : loadingMatches ? (
              <div className="flex justify-center items-center">
                <LoadingSpinner message="Matching jobs..." />
              </div>
            ) : matchData?.data?.length ? (
              <>
                <h2 className="text-xl font-semibold mb-4 border-b border-gray-200 dark:border-slate-700 pb-2">
                  Job Matches for{' '}
                  <span className="hidden md:inline">{selectedResume.original_name}</span>
                  <span className="inline-block md:hidden max-w-[100%] truncate">{selectedResume.original_name}</span>
                </h2>

                <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-4">
                  {matchData.data.map((job, i) => (
                    <motion.div key={i} variants={listItemVariants}>
                      <JobMatchCard job={job} animatedHover />
                    </motion.div>
                  ))}
                </motion.div>
              </>
            ) : (
              <p className="text-center text-gray-500 dark:text-white mt-10">No matches found for this resume.</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <Toast open={toast.open} message={toast.message} onClose={() => setToast({ open: false, message: '' })} />
    </div>
  );
}
