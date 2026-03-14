import React from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ExpandablePanel({ title, expanded, setExpanded, children, className }) {
  return (
    <div className={`${className} bg-white dark:bg-slate-800 dark:text-slate-200 p-4 rounded-lg shadow-md`}>
      <button
        onClick={setExpanded}
        className="w-full flex items-center justify-between px-4 py-2 font-semibold text-left hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition"
      >
        {title}
        <motion.span
          animate={{ rotate: expanded ? 180 : 0 }}
          className="ml-2 transition-transform duration-300"
        >
          <ChevronDown size={20} />
        </motion.span>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-3"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
