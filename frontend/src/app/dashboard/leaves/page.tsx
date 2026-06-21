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

        <Tabs defaultValue="employee" className="space-y-6">
          <TabsList className="bg-white border rounded-md shadow-sm h-12 w-full justify-start overflow-x-auto">
            <TabsTrigger value="employee">Employee View (Apply)</TabsTrigger>
            <TabsTrigger value="manager">Manager View (Approve)</TabsTrigger>
          </TabsList>

          <TabsContent value="employee" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
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
                  <Button type="submit" className="w-full">Submit Application</Button>
                </form>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
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
                      <TableRow key={l.id}>
                        <TableCell>{l.leave_type_name}</TableCell>
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
          </TabsContent>

          <TabsContent value="manager">
            <Card>
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
                      <TableRow key={l.id}>
                        <TableCell className="font-medium">{l.employee_code}</TableCell>
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
                              <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleAction(l.id, 'APPROVED')}>Approve</Button>
                              <Button size="sm" variant="destructive" onClick={() => handleAction(l.id, 'REJECTED')}>Reject</Button>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DashboardLayout>
    </AuthGuard>
  );
}
