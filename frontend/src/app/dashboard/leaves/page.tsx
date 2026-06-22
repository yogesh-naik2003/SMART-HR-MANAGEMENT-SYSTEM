"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import AuthGuard from "@/components/auth/AuthGuard";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

export default function LeavesPage() {
  const [leaves, setLeaves] = useState([]);
  const [types, setTypes] = useState([]);
  const [formData, setFormData] = useState({
    leave_type_id: "",
    start_date: "",
    end_date: "",
    reason: ""
  });

  const fetchData = async () => {
    try {
      const typeRes = await api.get("/leaves/types");
      setTypes(typeRes.data.data);
      const leaveRes = await api.get("/leaves");
      setLeaves(leaveRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/leaves/apply", {
        employee_id: 1, // simulated
        leave_type_id: Number(formData.leave_type_id),
        start_date: formData.start_date,
        end_date: formData.end_date,
        reason: formData.reason
      });
      alert("Leave applied!");
      fetchData();
      setFormData({ leave_type_id: "", start_date: "", end_date: "", reason: "" });
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to apply leave");
    }
  };

  const handleAction = async (id: number, status: string) => {
    try {
      const endpoint = status === 'APPROVED' ? `/leaves/approve/${id}` : `/leaves/reject/${id}`;
      await api.put(endpoint);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AuthGuard>
      <DashboardLayout>
        <h1 className="text-2xl font-bold mb-6">Leave Management</h1>

        <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }}>
        <Tabs defaultValue="employee" className="space-y-6">
          <TabsList className="glass-panel border-white/40 dark:border-white/10 shadow-sm h-14 w-full justify-start overflow-x-auto p-1 rounded-xl">
            <TabsTrigger value="employee" className="rounded-lg data-[state=active]:shadow-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 transition-all">Employee View (Apply)</TabsTrigger>
            <TabsTrigger value="manager" className="rounded-lg data-[state=active]:shadow-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 transition-all">Manager View (Approve)</TabsTrigger>
          </TabsList>

          <TabsContent value="employee" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div variants={itemVariants} className="lg:col-span-1">
            <Card className="glass-panel border-white/40 dark:border-white/10 shadow-xl">
              <CardHeader><CardTitle>Apply for Leave</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleApply} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Leave Type</label>
                    <select 
                      className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 bg-transparent"
                      value={formData.leave_type_id}
                      onChange={(e) => setFormData({...formData, leave_type_id: e.target.value})}
                      required
                    >
                      <option value="">Select type</option>
                      {types.map((t: any) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Start Date</label>
                    <Input required type="date" value={formData.start_date} onChange={(e) => setFormData({...formData, start_date: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">End Date</label>
                    <Input required type="date" value={formData.end_date} onChange={(e) => setFormData({...formData, end_date: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Reason</label>
                    <Input required value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})} />
                  </div>
                  <Button type="submit" className="w-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">Submit Application</Button>
                </form>
              </CardContent>
            </Card>
            </motion.div>

            <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card className="glass-panel border-white/40 dark:border-white/10 shadow-xl overflow-hidden h-full">
              <CardHeader><CardTitle>My Leave History</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaves.filter((l: any) => l.employee_id === 1).map((l: any) => (
                      <TableRow key={l.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                        <TableCell className="font-medium text-slate-700 dark:text-slate-300">{l.leave_type_name}</TableCell>
                        <TableCell>{new Date(l.start_date).toLocaleDateString()} to {new Date(l.end_date).toLocaleDateString()}</TableCell>
                        <TableCell className="max-w-[150px] truncate">{l.reason}</TableCell>
                        <TableCell>
                          <Badge variant={l.status === 'APPROVED' ? "default" : l.status === 'REJECTED' ? "destructive" : "secondary"}>
                            {l.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="manager">
            <motion.div variants={itemVariants}>
            <Card className="glass-panel border-white/40 dark:border-white/10 shadow-xl overflow-hidden">
              <CardHeader><CardTitle>Team Leave Requests</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaves.map((l: any) => (
                      <TableRow key={l.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                        <TableCell className="font-medium text-slate-700 dark:text-slate-300">{l.employee_code}</TableCell>
                        <TableCell>{l.leave_type_name}</TableCell>
                        <TableCell>{new Date(l.start_date).toLocaleDateString()} to {new Date(l.end_date).toLocaleDateString()}</TableCell>
                        <TableCell className="max-w-[150px] truncate">{l.reason}</TableCell>
                        <TableCell>
                          <Badge variant={l.status === 'APPROVED' ? "default" : l.status === 'REJECTED' ? "destructive" : "secondary"}>
                            {l.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          {l.status === 'PENDING' && (
                            <>
                              <Button size="sm" className="bg-green-600 hover:bg-green-700 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all" onClick={() => handleAction(l.id, 'APPROVED')}>Approve</Button>
                              <Button size="sm" variant="destructive" className="shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all" onClick={() => handleAction(l.id, 'REJECTED')}>Reject</Button>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
        </motion.div>
      </DashboardLayout>
    </AuthGuard>
  );
}
