"use client";

import { motion } from "framer-motion";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
 children
}: {
 children: React.ReactNode;
}) {
  const pathname = usePathname();

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
       <main className="flex-1 overflow-y-auto p-6 bg-white/40 dark:bg-slate-900/40 relative">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          className="min-h-full"
        >
          {children}
        </motion.div>
       </main>
     </div>
    </div>
   </div>
  );
}
