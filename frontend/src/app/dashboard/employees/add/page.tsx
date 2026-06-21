"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import AuthGuard from "@/components/auth/AuthGuard";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AddEmployeePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    user_id: "",
    employee_code: "",
    department_id: "",
    designation: "",
    joining_date: "",
    salary: "",
    phone: "",
    address: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Create employee
      await api.post("/employees", {
        ...formData,
        user_id: formData.user_id ? Number(formData.user_id) : null,
        department_id: formData.department_id ? Number(formData.department_id) : null,
        salary: Number(formData.salary)
      });
      alert("Employee added successfully!");
      router.push("/dashboard/employees");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to add employee");
    }
  };

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Register New Employee</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">User ID (Optional)</label>
                    <Input type="number" placeholder="Leave blank if none" value={formData.user_id} onChange={e => setFormData({...formData, user_id: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Employee Code</label>
                    <Input required value={formData.employee_code} onChange={e => setFormData({...formData, employee_code: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Department ID</label>
                    <Input required type="number" value={formData.department_id} onChange={e => setFormData({...formData, department_id: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Designation</label>
                    <Input required value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Joining Date</label>
                    <Input required type="date" value={formData.joining_date} onChange={e => setFormData({...formData, joining_date: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Base Salary (₹)</label>
                    <Input required type="number" value={formData.salary} onChange={e => setFormData({...formData, salary: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone</label>
                    <Input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Address</label>
                  <Input required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                </div>
                
                <div className="flex gap-4 pt-4">
                  <Button type="button" variant="outline" onClick={() => router.back()} className="w-full">
                    Cancel
                  </Button>
                  <Button type="submit" className="w-full">
                    Save Employee
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
