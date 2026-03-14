import React, { createContext, useState, useEffect } from "react";

export const ResumeContext = createContext();

export function ResumeProvider({ children }) {
  const [selectedResume, setSelectedResume] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("selectedResume")) || null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (selectedResume) {
      localStorage.setItem("selectedResume", JSON.stringify(selectedResume));
    } else {
      localStorage.removeItem("selectedResume");
    }
  }, [selectedResume]);


  return (
    <ResumeContext.Provider value={{ selectedResume, setSelectedResume }}>
      {children}
    </ResumeContext.Provider>
  );
}
