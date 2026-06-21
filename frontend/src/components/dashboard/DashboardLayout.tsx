import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function DashboardLayout({
 children
}: {
 children: React.ReactNode;
}) {
  return (
   <div className="flex h-screen overflow-hidden animated-bg relative">
    {/* Floating Glass Sidebar */}
    <div className="p-4 z-20">
      <Sidebar />
    </div>

    {/* Main Content Area */}
    <div className="flex-1 flex flex-col h-screen overflow-hidden p-4 pl-0 z-10 relative">
     <div className="glass-panel flex-1 rounded-3xl overflow-hidden flex flex-col border border-white/40 dark:border-white/10 shadow-2xl relative">
       <Navbar />
       <main className="flex-1 overflow-y-auto p-6 bg-white/40 dark:bg-slate-900/40">
        {children}
       </main>
     </div>
    </div>
   </div>
  );
}
