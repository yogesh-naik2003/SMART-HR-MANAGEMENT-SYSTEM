"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { Users, FileText, Briefcase, DollarSign } from "lucide-react";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

interface DashboardData {
 employees: number;
 candidates: number;
 openJobs: number;
 payrollCost: number;
}

export default function DashboardCards() {
 const [data, setData] = useState<DashboardData | null>(null);

 useEffect(() => {
  const fetchSummary = async () => {
   try {
    const res = await api.get("/analytics/dashboard");
    setData(res.data.data);
   } catch (error) {
    console.error("Failed to fetch dashboard summary", error);
   }
  };
  fetchSummary();
 }, []);

 if (!data) return (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
   {[1,2,3,4].map(i => <div key={i} className="h-32 glass-panel border-white/40 dark:border-white/10 rounded-2xl"></div>)}
  </div>
 );

 const cards = [
  { title: "Total Employees", value: data.employees, icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
  { title: "Total Candidates", value: data.candidates, icon: FileText, color: "text-purple-600", bg: "bg-purple-100" },
  { title: "Open Jobs", value: data.openJobs, icon: Briefcase, color: "text-orange-600", bg: "bg-orange-100" },
  { title: "Payroll Cost", value: `$${data.payrollCost.toLocaleString()}`, icon: DollarSign, color: "text-green-600", bg: "bg-green-100" }
 ];

 return (
  <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
   {cards.map((card, idx) => {
    const Icon = card.icon;
    return (
     <motion.div variants={itemVariants} key={idx}>
      <div className="glass-panel border-white/40 dark:border-white/10 p-6 rounded-2xl shadow-xl flex items-center space-x-4 hover-3d transition-all cursor-pointer">
       <div className={`p-4 rounded-xl ${card.bg}`}>
        <Icon className={`w-8 h-8 ${card.color}`} />
       </div>
       <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{card.title}</p>
        <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white bg-clip-text">{card.value}</h3>
       </div>
      </div>
     </motion.div>
    );
   })}
  </motion.div>
 );
}
