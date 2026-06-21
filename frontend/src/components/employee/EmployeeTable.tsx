"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Trash2 } from "lucide-react";

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

      <div className="border rounded-md bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
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
                <TableRow key={emp.id}>
                  <TableCell className="font-medium">{emp.employee_code}</TableCell>
                  <TableCell>{emp.name || "N/A"}</TableCell>
                  <TableCell>{emp.email || "N/A"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{emp.department_name || "N/A"}</Badge>
                  </TableCell>
                  <TableCell>{emp.designation}</TableCell>
                  <TableCell>₹{Number(emp.salary).toLocaleString()}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="icon" onClick={() => router.push(`/dashboard/employees/${emp.id}`)}>
                      <Eye className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleDelete(emp.id)}>
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

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
