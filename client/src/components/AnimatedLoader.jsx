import React from 'react';
import { motion } from 'framer-motion';

export default function AnimatedLoader({ text }) {
  return (
    <div className="flex flex-col items-center justify-center py-6 space-y-3">
      <motion.div
        className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
      />
      <motion.p
        className="text-gray-700 dark:text-slate-200 font-medium"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ repeat: Infinity, duration: 1 }}
      >
        {text}
      </motion.p>
    </div>
  );
}
