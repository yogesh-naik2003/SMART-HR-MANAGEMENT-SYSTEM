"use client";

import Link from "next/link";
import { ArrowRight, BarChart2, Calendar, Users } from "lucide-react";
import { motion } from "framer-motion";
import ThreeGlobe from "../components/dashboard/ThreeGlobe";

export default function Home() {
  return (
    <div className="min-h-screen animated-bg flex flex-col items-center justify-center relative overflow-hidden text-slate-800 dark:text-slate-100">
      
      {/* 3D Background */}
      <ThreeGlobe />
      
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-400/20 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 blur-[120px]" />

      {/* Navbar Area */}
      <div className="absolute top-6 w-full max-w-6xl px-6 flex justify-between items-center z-20">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 shadow-lg flex items-center justify-center hover-3d cursor-pointer">
            <div className="w-4 h-4 bg-white rounded-full"></div>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-purple-700 dark:from-blue-300 dark:to-purple-300">
            Smart HRMS
          </h1>
        </div>
        <div className="flex space-x-4">
          <Link href="/login" className="px-6 py-2 rounded-xl font-medium transition-all hover:bg-white/20 dark:hover:bg-slate-800/50 glass hover-3d">
            Login
          </Link>
          <Link href="/register" className="px-6 py-2 rounded-xl font-semibold bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-white shadow-[0_8px_20px_rgba(217,70,239,0.3)] hover:shadow-[0_12px_25px_rgba(217,70,239,0.5)] hover:-translate-y-1 transition-all">
            Get Started
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="z-10 text-center px-4 max-w-4xl mt-20"
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="inline-block px-4 py-1.5 mb-6 rounded-full glass border-white/40 text-sm font-semibold text-blue-800 dark:text-blue-300 shadow-sm"
        >
          ✨ The Future of HR Management
        </motion.div>
        <h1 className="text-6xl md:text-7xl font-black mb-6 leading-tight tracking-tighter">
          Manage your team with <br/> 
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Intelligent Automation</span>
        </h1>
        <p className="text-lg md:text-xl mb-10 text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-medium">
          A beautifully designed, AI-powered platform to handle payroll, attendance, recruitment, and performance all in one place.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <Link href="/register" className="px-8 py-4 rounded-2xl font-bold bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-white shadow-[0_4px_14px_rgba(217,70,239,0.4)] hover:shadow-[0_6px_20px_rgba(217,70,239,0.6)] hover:-translate-y-1 transition-all flex items-center group text-lg">
            Start Free Trial
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/login" className="px-8 py-4 rounded-2xl font-bold glass-panel hover-3d text-lg">
            See Dashboard
          </Link>
        </div>
      </motion.div>

      {/* Feature Cards Grid */}
      <div className="z-10 grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 max-w-6xl px-6 w-full">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="glass-panel p-8 rounded-3xl hover-3d group cursor-pointer text-left"
        >
          <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
            <Users size={28} />
          </div>
          <h3 className="text-xl font-bold mb-3">Employee Directory</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">Centralize your team data with rich profiles, document management, and seamless onboarding flows.</p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="glass-panel p-8 rounded-3xl hover-3d group cursor-pointer text-left relative overflow-hidden"
        >
          <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center mb-6 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
            <BarChart2 size={28} />
          </div>
          <h3 className="text-xl font-bold mb-3">AI Analytics</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">Predictive attrition models and comprehensive performance dashboards powered by machine learning.</p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="glass-panel p-8 rounded-3xl hover-3d group cursor-pointer text-left"
        >
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mb-6 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
            <Calendar size={28} />
          </div>
          <h3 className="text-xl font-bold mb-3">Time & Attendance</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">Automated check-ins, intelligent leave routing, and real-time payroll synchronization.</p>
        </motion.div>
      </div>
      
    </div>
  );
}
