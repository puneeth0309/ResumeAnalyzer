import React from "react";
import { motion } from "framer-motion";
import { FiCheckCircle, FiXCircle, FiInfo } from "react-icons/fi";

export default function JobMatchCard({ job }) {
  const reasoning = job.reasoning?.reasoning || "";
  const fit_skills = job.reasoning?.fit_skills || [];
  const missing_skills = job.reasoning?.missing_skills || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="
        border rounded-xl p-5 shadow-sm hover:shadow-lg transition
        bg-white/70 dark:bg-slate-800/70 dark:border-slate-700 dark:text-slate-200
        backdrop-blur-md
      "
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2">
        <p className="font-semibold text-lg break-words">{job.title}</p>
        <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
          {job.match_score}%
        </p>
      </div>

      <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2 mb-3 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${job.match_score}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="h-2 bg-green-500 dark:bg-green-400 rounded-full"
        />
      </div>

      {reasoning && (fit_skills.length > 0 || missing_skills.length > 0) && (
        <div className="text-sm space-y-3 mt-4 break-words">
          {reasoning && (
            <div className="flex items-start gap-2">
              <FiInfo className="mt-1 text-blue-500 dark:text-blue-400" />
              <p className="text-gray-700 dark:text-slate-200 leading-relaxed">
                {reasoning}
              </p>
            </div>
          )}

          {fit_skills.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-1 text-green-600 dark:text-green-400 font-semibold">
                <FiCheckCircle /> Fit Skills
              </div>
              <div className="flex flex-wrap gap-2">
                {fit_skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="
                      text-xs px-2 py-1 
                      bg-green-100 text-green-700 
                      dark:bg-green-900 dark:text-green-300 
                      rounded-md font-medium
                    "
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {missing_skills.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-1 text-red-500 dark:text-red-400 font-semibold">
                <FiXCircle /> Missing Skills
              </div>
              <div className="flex flex-wrap gap-2">
                {missing_skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="
                      text-xs px-2 py-1 
                      bg-red-100 text-red-700 
                      dark:bg-red-900 dark:text-red-300 
                      rounded-md font-medium
                    "
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          <a
            href="https://huggingface.co/spaces/RamaRaju18/Learning_Pat_Generator"
            target="_blank"
            rel="noopener noreferrer"
            className="
              inline-block mt-2 text-sm px-3 py-2 rounded-md
              bg-blue-600 text-white font-medium
              hover:bg-blue-700 transition
              dark:bg-blue-500 dark:hover:bg-blue-600
            "
          >
            Learn Missing Skills →
          </a>
        </div>
      )}
    </motion.div>
  );
}
