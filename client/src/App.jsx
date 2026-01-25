import React, { useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import { Upload, Brain, Target } from "lucide-react";
import logo from "./assets/logo.png";

export default function Home() {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate("/dashboard");
  }, [user, loading, navigate]);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-gray-700 dark:text-gray-200 font-medium text-lg mb-2">
          Loading...
        </p>
        <div className="w-12 h-12 border-4 border-gray-300 dark:border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="text-gray-700 dark:text-gray-300 mt-4 font-medium animate-pulse">
          Processing your application, please wait...
        </p>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          This may take a few seconds...
        </span>
      </div>
    );

  return (
    <section className="relative flex flex-col md:flex-row items-center justify-between min-h-screen px-6 sm:px-10 lg:px-20
      bg-gradient-to-br from-slate-50 via-white to-blue-50 
      dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 overflow-hidden">

      <div className="absolute -top-16 -left-20 w-[350px] h-[350px] bg-blue-500/20 dark:bg-blue-600/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-[420px] h-[420px] bg-indigo-400/20 dark:bg-indigo-700/20 rounded-full blur-3xl"></div>

      <div className="relative z-10 flex flex-col gap-6 text-center md:text-left max-w-xl">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold 
          text-gray-900 dark:text-white leading-tight">

          Smarter Resumes,
          <span className="block bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
            Smarter Career Matches
          </span>
        </h1>

        <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg leading-relaxed max-w-lg">
          Upload your resume and let AI extract your skills & achievements.
          Instantly discover job roles that fit your profile — powered by intelligence, not luck.
        </p>

        <div className="flex justify-center md:justify-start gap-4 mt-2">
          <Link
            to="/register"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-600/30 transition-all"
          >
            Get Started
          </Link>

          <Link
            to="/login"
            className="border border-blue-600 dark:border-blue-400 
            text-blue-600 dark:text-blue-400 px-6 py-3 rounded-lg font-semibold 
            hover:bg-blue-50 dark:hover:bg-slate-800/60 transition-all"
          >
            Login
          </Link>
        </div>
      </div>

      <div className="relative z-10 mt-12 md:mt-0 flex justify-center w-full md:w-[50%]">
        <div className="bg-white dark:bg-slate-900/80 backdrop-blur-xl 
          rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md
          border border-slate-200 dark:border-slate-700/60">

          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3 text-center">
            AI Resume Evaluator
          </h2>

          <p className="text-gray-500 dark:text-gray-400 text-sm text-center mb-6">
            Analyze your resume & get job recommendations in seconds.
          </p>

          <div className="h-44 sm:h-52 
            bg-gradient-to-r from-blue-100 to-indigo-100 
            dark:from-slate-800 dark:to-slate-700 
            rounded-xl flex flex-col items-center justify-center 
            border border-white/40 dark:border-slate-600/40 
            shadow-inner gap-4">

            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden 
                bg-white/80 dark:bg-slate-700/60 backdrop-blur-md 
                border border-slate-200 dark:border-slate-600 shadow-md flex items-center justify-center">
              <img src={logo} alt="App Logo" className="w-12 sm:w-14 object-contain" />
            </div>

            <div className="flex gap-4 items-center text-blue-700 dark:text-blue-300 font-semibold text-lg">
              <Upload className="w-5 h-5" /> →
              <Brain className="w-5 h-5" /> →
              <Target className="w-5 h-5" />
            </div>

            <span className="font-medium text-gray-700 dark:text-gray-200 text-sm">
              Upload • Analyze • Match
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
