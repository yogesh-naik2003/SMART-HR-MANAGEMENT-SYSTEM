"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from "recharts";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function AnalyticsCharts() {
  const [attendanceData, setAttendanceData] = useState([]);
  const [payrollData, setPayrollData] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [loading, setLoading] = useState(true);

  // In a real app we would fetch real chart data from endpoints like /api/analytics/charts
  // For now we will mock the data structures and simulate API loading delay to build out the UI requirement.
  
  useEffect(() => {
    // Simulating API call for charts
    setTimeout(() => {
      setAttendanceData([
        { name: 'Mon', present: 45, absent: 5 },
        { name: 'Tue', present: 48, absent: 2 },
        { name: 'Wed', present: 46, absent: 4 },
        { name: 'Thu', present: 49, absent: 1 },
        { name: 'Fri', present: 47, absent: 3 },
      ] as any);

      setPayrollData([
        { month: 'Jan', cost: 120000 },
        { month: 'Feb', cost: 125000 },
        { month: 'Mar', cost: 128000 },
        { month: 'Apr', cost: 135000 },
        { month: 'May', cost: 142000 },
      ] as any);

      setPerformanceData([
        { rating: 'Excellent', count: 15 },
        { rating: 'Good', count: 25 },
        { rating: 'Average', count: 8 },
        { rating: 'Poor', count: 2 },
      ] as any);

      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-96 rounded-lg w-full mt-6"></div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      
      {/* Attendance Trend Chart */}
      <div className="glass-panel p-6 rounded-xl hover-3d border border-white/40 dark:border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-400/10 rounded-full blur-3xl"></div>
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Attendance Trend (This Week)</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <AreaChart data={attendanceData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Area type="monotone" dataKey="present" stackId="1" stroke="#10b981" fill="#10b981" />
              <Area type="monotone" dataKey="absent" stackId="1" stroke="#ef4444" fill="#ef4444" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Payroll Cost Chart */}
      <div className="glass-panel p-6 rounded-xl hover-3d border border-white/40 dark:border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-400/10 rounded-full blur-3xl"></div>
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Payroll Cost (YTD)</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <BarChart data={payrollData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" />
              <YAxis />
              <RechartsTooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
              <Bar dataKey="cost" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recruitment Funnel Chart */}
      <div className="glass-panel p-6 rounded-xl hover-3d border border-white/40 dark:border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-400/10 rounded-full blur-3xl"></div>
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Recruitment Funnel</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <LineChart data={[
              { stage: 'Applied', count: 120 },
              { stage: 'Screened', count: 45 },
              { stage: 'Interviewed', count: 15 },
              { stage: 'Offered', count: 5 },
              { stage: 'Hired', count: 3 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="stage" />
              <YAxis />
              <RechartsTooltip />
              <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Performance Rating Chart */}
      <div className="glass-panel p-6 rounded-xl hover-3d border border-white/40 dark:border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 rounded-full blur-3xl"></div>
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Performance Ratings</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <PieChart>
              <Pie
                data={performanceData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
                nameKey="rating"
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
              >
                {performanceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
