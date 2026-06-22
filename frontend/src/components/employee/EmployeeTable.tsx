"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

export default function EmployeeTable() {
  const router = useRouter();
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(false);

  const fetchEmployees = async (currentPage = 1, searchQuery = "") => {
    setLoading(true);
    try {
      const res = await api.get(`/employees?page=${currentPage}&limit=10&search=${searchQuery}`);
      // res.data -> { success: true, data: { data: [], meta: {} } }
      setEmployees(res.data.data.data);
      setMeta(res.data.data.meta);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      setPage(1);
      fetchEmployees(1, search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= meta.totalPages) {
      setPage(newPage);
      fetchEmployees(newPage, search);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this employee?")) {
      try {
        await api.delete(`/employees/${id}`);
        fetchEmployees(page, search);
      } catch (err) {
        console.error(err);
        alert("Failed to delete employee");
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-4">
        <Input 
          placeholder="Search by name, email, or code..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
        <Button onClick={() => router.push("/dashboard/employees/add")}>
          Add Employee
        </Button>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <div className="border border-white/40 dark:border-white/10 rounded-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl shadow-xl overflow-hidden glass-panel">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee Code</TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Designation</TableHead>
              <TableHead>Salary</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-gray-500">Loading...</TableCell>
              </TableRow>
            ) : employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-gray-500">No employees found.</TableCell>
              </TableRow>
            ) : (
              employees.map((emp: any) => (
                <TableRow key={emp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <TableCell className="font-medium">{emp.employee_code}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-slate-100 overflow-hidden shrink-0 ring-2 ring-slate-100 dark:ring-slate-800">
                        <img 
                          src={`https://api.dicebear.com/7.x/notionists/svg?seed=${emp.name || emp.employee_code}&backgroundColor=b6e3f4,c0aede,d1d4f9`} 
                          alt={emp.name || "Employee"} 
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{emp.name || "N/A"}</div>
                        <div className="text-xs text-slate-500">{emp.email || "N/A"}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{emp.department_name || "N/A"}</Badge>
                  </TableCell>
                  <TableCell>{emp.designation}</TableCell>
                  <TableCell>₹{Number(emp.salary).toLocaleString()}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="icon" onClick={() => router.push(`/dashboard/employees/${emp.id}`)} className="shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                      <Eye className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleDelete(emp.id)} className="shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      </motion.div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Showing page {page} of {Math.max(meta.totalPages, 1)} ({meta.total} total)
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handlePageChange(page - 1)} 
            disabled={page === 1 || loading}
          >
            Previous
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handlePageChange(page + 1)} 
            disabled={page === meta.totalPages || loading || meta.totalPages === 0}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
