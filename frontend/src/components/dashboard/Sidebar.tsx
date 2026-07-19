"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, CalendarCheck, FileText, DollarSign, Target, Settings, Briefcase } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Employees", href: "/dashboard/employees", icon: Users },
    { name: "Attendance", href: "/dashboard/attendance", icon: CalendarCheck },
    { name: "Leave", href: "/dashboard/leaves", icon: FileText },
    { name: "Payroll", href: "/dashboard/payroll", icon: DollarSign },
    { name: "Recruitment", href: "/dashboard/recruitment", icon: Briefcase },
    { name: "Performance", href: "/dashboard/performance", icon: Target },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <div className="w-64 h-full glass-panel rounded-3xl p-5 flex flex-col shadow-[0_8px_32px_rgba(0,0,0,0.1)] border border-white/40 dark:border-white/10 relative overflow-hidden group">
      {/* Dynamic Lighting effect inside sidebar */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-rose-500/10 rounded-full blur-3xl"></div>
      
      <div className="flex items-center space-x-3 px-4 mb-8 mt-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-rose-600 shadow-lg flex items-center justify-center">
          <div className="w-3 h-3 bg-white rounded-full"></div>
        </div>
        <h1 className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-purple-700 dark:from-blue-400 dark:to-purple-400">
          Smart HRMS
        </h1>
      </div>
      
      <ul className="space-y-2 flex-1">
        {links.map((link) => {
          const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname?.startsWith(link.href));
          return (
            <li key={link.name}>
              <Link 
                href={link.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-300 ease-out group hover:bg-white/20 dark:hover:bg-slate-800/50 ${
                  isActive 
                    ? "glass shadow-[0_4px_15px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_15px_rgba(0,0,0,0.2)] font-semibold text-rose-600 dark:text-rose-400" 
                    : "text-slate-600 dark:text-slate-400 font-medium"
                }`}
              >
                <link.icon className={`h-5 w-5 transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`} />
                <span>{link.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      
      <div className="p-4 mt-auto">
        <div className="p-4 glass rounded-2xl border border-rose-500/10 dark:border-white/5 relative overflow-hidden group-hover:shadow-lg transition-all duration-500">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-all duration-500"></div>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1">AI Assistant</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">Ask HR related questions or generate reports.</p>
          <button className="w-full text-xs py-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-lg font-medium hover:scale-[1.02] transition-all shadow-md">
            Ask AI ✨
          </button>
        </div>
      </div>
    </div>
  );
}
