"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import AuthGuard from "@/components/auth/AuthGuard";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download } from "lucide-react";
import { motion } from "framer-motion";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

export default function PayrollPage() {
  const [payrolls, setPayrolls] = useState([]);

  useEffect(() => {
    const fetchPayroll = async () => {
      try {
        const res = await api.get("/payroll");
        setPayrolls(res.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPayroll();
  }, []);

  const handleDownload = async (id: number) => {
    try {
      const res = await api.get(`/payroll/download/${id}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `payslip_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      alert("Failed to download PDF");
    }
  };

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Payroll & Payslips</h1>
        </div>

        <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }}>
          <motion.div variants={itemVariants}>
            <Card className="glass-panel border-white/40 dark:border-white/10 shadow-xl overflow-hidden">
              <CardHeader>
                <CardTitle>My Salary History</CardTitle>
              </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>Basic Salary</TableHead>
                  <TableHead>Allowances</TableHead>
                  <TableHead>Deductions</TableHead>
                  <TableHead>Net Salary</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payrolls.map((p: any) => (
                  <TableRow key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <TableCell className="font-medium text-slate-700 dark:text-slate-300">{p.month} / {p.year}</TableCell>
                    <TableCell>₹{Number(p.basic_salary).toLocaleString()}</TableCell>
                    <TableCell>₹{Number(p.allowances || 0).toLocaleString()}</TableCell>
                    <TableCell>₹{Number(p.deductions).toLocaleString()}</TableCell>
                    <TableCell className="font-semibold text-green-600">₹{Number(p.net_salary).toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => handleDownload(p.id)} className="shadow-sm hover:shadow hover:-translate-y-0.5 transition-all">
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {payrolls.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500 py-6">No payroll records found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        </motion.div>
      </motion.div>
      </DashboardLayout>
    </AuthGuard>
  );
}
