"use client";

import { useState, useEffect, Suspense } from "react";
import Cookies from "js-cookie";
import api from "@/services/api";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Lock, Mail } from "lucide-react";

function LoginForm() {
  const searchParams = useSearchParams();
  const registered = searchParams?.get("registered");
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    
    try {
      const response = await api.post("/auth/login", { email, password });
      Cookies.set("token", response.data.data.token);
      window.location.href = "/dashboard";
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md z-10">
      <div className="glass-panel rounded-3xl p-8 sm:p-10 shadow-2xl hover-3d transition-transform duration-500">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black mb-2 tracking-tight">Welcome Back</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Log in to your dashboard</p>
        </div>

        {registered && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-medium text-center">
            Registration successful! Please log in.
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-bold mb-2 ml-1">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Mail size={18} />
              </div>
              <input
                type="email"
                required
                placeholder="you@company.com"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400 font-medium"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2 ml-1 mr-1">
              <label className="block text-sm font-bold">Password</label>
              <a href="#" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">Forgot?</a>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Lock size={18} />
              </div>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400 font-medium"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-4 rounded-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-500 dark:to-violet-500 text-white shadow-[0_4px_14px_rgba(79,70,229,0.3)] dark:shadow-[0_4px_14px_rgba(129,140,248,0.3)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.5)] dark:hover:shadow-[0_6px_20px_rgba(129,140,248,0.5)] hover:-translate-y-0.5 transition-all flex justify-center items-center group disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Log In"}
            {!loading && <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <p className="text-center mt-8 text-sm font-medium text-slate-500 dark:text-slate-400">
          Don't have an account?{" "}
          <Link href="/register" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen animated-bg flex flex-col items-center justify-center relative overflow-hidden text-slate-800 dark:text-slate-100 p-4">
      {/* Decorative background elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-400/20 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-400/20 blur-[120px]" />

      <Link href="/" className="absolute top-8 left-8 flex items-center space-x-2 font-bold text-lg group z-20">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center">
          <div className="w-3 h-3 bg-white rounded-full"></div>
        </div>
        <span className="group-hover:text-blue-600 transition-colors">Smart HRMS</span>
      </Link>

      <Suspense fallback={<div className="z-10 text-xl font-bold">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
