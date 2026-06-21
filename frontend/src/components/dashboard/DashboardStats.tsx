"use client";

import StatsCard from "./StatsCard";
import useDashboard from "@/hooks/useDashboard";

export default function DashboardStats() {
  const data = useDashboard();

  if (!data) {
    return <div className="animate-pulse bg-gray-200 h-32 rounded-lg w-full mb-6"></div>;
  }

  // @ts-ignore
  const { totalEmployees, totalCandidates, totalJobs, payrollCost } = data.data;

  return(
   <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
    <StatsCard
     title="Total Employees"
     value={totalEmployees?.toString() || "0"}
    />
    <StatsCard
     title="Total Candidates"
     value={totalCandidates?.toString() || "0"}
    />
    <StatsCard
     title="Open Jobs"
     value={totalJobs?.toString() || "0"}
    />
    <StatsCard
     title="Payroll (YTD)"
     value={`₹${(payrollCost || 0).toLocaleString()}`}
    />
   </div>
  );
}
