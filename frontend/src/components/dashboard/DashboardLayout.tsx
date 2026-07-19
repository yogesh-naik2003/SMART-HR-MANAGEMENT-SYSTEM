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
    {/* Premium Liquid Glass Background Orbs */}
    <div className="absolute top-[-10%] left-[-5%] w-[40vw] h-[40vw] bg-sky-200/60 dark:bg-indigo-900/30 blob" style={{ animationDelay: "0s" }}></div>
    <div className="absolute bottom-[-10%] right-[-5%] w-[35vw] h-[35vw] bg-purple-200/60 dark:bg-violet-900/30 blob" style={{ animationDelay: "-5s", animationDuration: "25s" }}></div>
    <div className="absolute top-[20%] right-[20%] w-[25vw] h-[25vw] bg-emerald-200/50 dark:bg-emerald-900/20 blob" style={{ animationDelay: "-10s", animationDuration: "18s" }}></div>

    {/* Floating Glass Sidebar */}
    <div className="p-4 z-20">
      <Sidebar />
    </div>

    {/* Main Content Area */}
    <div className="flex-1 flex flex-col h-screen overflow-hidden p-4 pl-0 z-10 relative">
     <div className="glass-panel flex-1 rounded-3xl overflow-hidden flex flex-col border border-white/40 dark:border-white/10 shadow-2xl relative">
       <Navbar />
       <main className="flex-1 overflow-y-auto p-6 pb-24 glass relative">
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
