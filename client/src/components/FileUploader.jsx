import React, { useRef, useState } from "react";
import { FiUploadCloud } from "react-icons/fi";
import { motion } from "framer-motion";

export default function FileUploader({
  accept = ".pdf",
  multiple = false,
  onFileChange = () => {},
}) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [filesLabel, setFilesLabel] = useState("No file selected");

  function handleFiles(files) {
    const fileArray = Array.from(files || []);
    setFilesLabel(
      fileArray.length === 0
        ? "No file selected"
        : fileArray.map((f) => f.name).join(", ")
    );

    onFileChange(multiple ? fileArray : fileArray[0] || null);
  }

  return (
    <div className="flex flex-col gap-2">
      <motion.div
        initial={{ opacity: 0.2, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`cursor-pointer p-6 rounded-xl border-2 border-dashed transition-all
          backdrop-blur-sm shadow-md
          flex flex-col items-center justify-center

          ${
            dragOver
              ? "border-blue-500 bg-blue-100/60 dark:bg-blue-900/40"
              : "border-gray-300 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50"
          }

          hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700
        `}
      >
        <FiUploadCloud
          className={`text-4xl mb-2 transition-colors ${
            dragOver ? "text-blue-500" : "text-gray-500 dark:text-gray-300"
          }`}
        />

        <p className="text-sm font-medium text-gray-700 dark:text-slate-200">
          Drag & drop your file here
        </p>
        <p className="text-xs text-gray-500 dark:text-slate-400">
          or click to browse
        </p>

        <p className="mt-3 text-xs text-gray-500 dark:text-slate-400 italic">
          Accepted: {accept}
        </p>

        {filesLabel !== "No file selected" && (
          <motion.p
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 text-sm font-semibold text-blue-600 dark:text-blue-400"
          >
            {filesLabel}
          </motion.p>
        )}
      </motion.div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
