"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { Users, FileText, Briefcase, DollarSign } from "lucide-react";

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

 if (!data) return <div className="grid grid-cols-4 gap-4 animate-pulse">
  {[1,2,3,4].map(i => <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>)}
 </div>;

 const cards = [
  { title: "Total Employees", value: data.employees, icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
  { title: "Total Candidates", value: data.candidates, icon: FileText, color: "text-purple-600", bg: "bg-purple-100" },
  { title: "Open Jobs", value: data.openJobs, icon: Briefcase, color: "text-orange-600", bg: "bg-orange-100" },
  { title: "Payroll Cost", value: `$${data.payrollCost.toLocaleString()}`, icon: DollarSign, color: "text-green-600", bg: "bg-green-100" }
 ];

 return (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
   {cards.map((card, idx) => {
    const Icon = card.icon;
    return (
     <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
      <div className={`p-4 rounded-full ${card.bg}`}>
       <Icon className={`w-8 h-8 ${card.color}`} />
      </div>
      <div>
       <p className="text-sm font-medium text-gray-500">{card.title}</p>
       <h3 className="text-2xl font-bold text-gray-900">{card.value}</h3>
      </div>
     </div>
    );
   })}
  </div>
 );
}
