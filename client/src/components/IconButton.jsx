import React from "react";
import { motion } from "framer-motion";

export default function IconButton({
  ariaLabel,
  onClick,
  children,
  className = "",
}) {
  return (
    <motion.button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      whileHover={{ scale: 1.12 }}
      whileTap={{ scale: 0.9 }}
      className={`
        inline-flex items-center justify-center 
        p-2 rounded-full transition-all

        hover:bg-gray-200/60 dark:hover:bg-slate-700/60
        backdrop-blur-sm
        focus:outline-none focus:ring-2 focus:ring-blue-500/60 

        shadow-sm hover:shadow-md
        ${className}
      `}
    >
      {children}
    </motion.button>
  );
}
