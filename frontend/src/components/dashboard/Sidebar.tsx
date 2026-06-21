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
    <div className="w-64 h-full glass rounded-3xl flex flex-col p-4 shadow-xl text-slate-800 dark:text-slate-100">
      <div className="flex items-center space-x-3 px-4 mb-8 mt-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 shadow-lg flex items-center justify-center">
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
                className={`flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-300 ease-out group hover:bg-white/50 dark:hover:bg-slate-800/50 ${
                  isActive 
                    ? "bg-white/60 dark:bg-slate-800/80 shadow-[0_4px_15px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_15px_rgba(0,0,0,0.2)] font-semibold text-blue-700 dark:text-blue-400" 
                    : "text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-300"
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
        <div className="glass p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/20">
          <h4 className="text-sm font-bold mb-1">Upgrade to Pro</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Get advanced AI analytics</p>
          <button className="w-full text-xs py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-medium hover:scale-[1.02] transition-transform">
            Upgrade Now
          </button>
        </div>
      </div>
    </div>
  );
}
