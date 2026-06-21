import DashboardLayout from "@/components/dashboard/DashboardLayout";
import AuthGuard from "@/components/auth/AuthGuard";
import DashboardStats from "@/components/dashboard/DashboardStats";
import AnalyticsCharts from "@/components/dashboard/AnalyticsCharts";
import AIInsights from "@/components/dashboard/AIInsights";

export default function DashboardPage() {
 return (
  <AuthGuard>
   <DashboardLayout>
    <div className="space-y-6">
     <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Welcome to AI HRMS</h1>
     
     {/* AI Insights Widget */}
     <AIInsights />

     {/* Step 54: Analytics Cards */}
     <DashboardStats />
     
     {/* Step 60: Analytics Charts */}
     <AnalyticsCharts />
    </div>
   </DashboardLayout>
  </AuthGuard>
 );
}
