"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
import AuthGuard from "@/components/auth/AuthGuard";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Clock, CalendarCheck, CalendarX, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function AttendancePage() {
  const queryClient = useQueryClient();

  // Fetch employees to get a valid employee ID for testing
  const { data: employees } = useQuery({
    queryKey: ["employees-list"],
    queryFn: async () => {
      const res = await api.get("/employees");
      return res.data.data;
    }
  });

  const employeeId = employees?.length > 0 ? employees[0].id : null;

  const { data: summary, isLoading: isSummaryLoading } = useQuery({
    queryKey: ["attendance-summary"],
    queryFn: async () => {
      const res = await api.get("/attendance/summary");
      return res.data.data;
    }
  });

  const { data: attendance, isLoading: isAttendanceLoading } = useQuery({
    queryKey: ["attendance-list"],
    queryFn: async () => {
      const res = await api.get("/attendance");
      return res.data.data;
    }
  });

  const checkInMutation = useMutation({
    mutationFn: async () => {
      if (!employeeId) throw new Error("No employee found in the system to check in. Please add an employee first.");
      await api.post("/attendance/check-in", { employee_id: employeeId });
    },
    onSuccess: () => {
      toast.success("Checked in successfully!");
      queryClient.invalidateQueries({ queryKey: ["attendance-summary"] });
      queryClient.invalidateQueries({ queryKey: ["attendance-list"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Check-in failed");
    }
  });

  const checkOutMutation = useMutation({
    mutationFn: async () => {
      if (!employeeId) throw new Error("No employee found in the system to check out. Please add an employee first.");
      await api.post("/attendance/check-out", { employee_id: employeeId });
    },
    onSuccess: () => {
      toast.success("Checked out successfully!");
      queryClient.invalidateQueries({ queryKey: ["attendance-summary"] });
      queryClient.invalidateQueries({ queryKey: ["attendance-list"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Check-out failed");
    }
  });

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Attendance Dashboard</h1>
          <div className="space-x-4">
            <Button 
              onClick={() => checkInMutation.mutate()} 
              disabled={checkInMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {checkInMutation.isPending ? "Checking in..." : "Check In"}
            </Button>
            <Button 
              onClick={() => checkOutMutation.mutate()} 
              disabled={checkOutMutation.isPending}
              variant="destructive"
            >
              {checkOutMutation.isPending ? "Checking out..." : "Check Out"}
            </Button>
          </div>
        </div>

        {isSummaryLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Skeleton className="h-[100px] w-full rounded-xl" />
            <Skeleton className="h-[100px] w-full rounded-xl" />
            <Skeleton className="h-[100px] w-full rounded-xl" />
            <Skeleton className="h-[100px] w-full rounded-xl" />
          </div>
        ) : summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-6 flex items-center space-x-4">
                <CalendarCheck className="h-10 w-10 text-green-500" />
                <div>
                  <p className="text-sm text-gray-500">Present Days</p>
                  <h3 className="text-2xl font-bold">{summary.present_days}</h3>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 flex items-center space-x-4">
                <CalendarX className="h-10 w-10 text-red-500" />
                <div>
                  <p className="text-sm text-gray-500">Absent Days</p>
                  <h3 className="text-2xl font-bold">{summary.absent_days || 0}</h3>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 flex items-center space-x-4">
                <AlertCircle className="h-10 w-10 text-yellow-500" />
                <div>
                  <p className="text-sm text-gray-500">Late Days</p>
                  <h3 className="text-2xl font-bold">{summary.late_days}</h3>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 flex items-center space-x-4">
                <Clock className="h-10 w-10 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">Working Hours</p>
                  <h3 className="text-2xl font-bold">{summary.total_hours || 0}h</h3>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Trend (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              {isSummaryLoading ? (
                <Skeleton className="h-[300px] w-full rounded-xl" />
              ) : summary?.trend && (
                <div className="w-full">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={summary.trend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="present" stroke="#16a34a" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Attendance Logs</CardTitle>
            </CardHeader>
            <CardContent>
              {isAttendanceLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Employee</TableHead>
                      <TableHead>Check In</TableHead>
                      <TableHead>Check Out</TableHead>
                      <TableHead>Hours</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendance?.slice(0, 10).map((a: any) => (
                      <TableRow key={a.id}>
                        <TableCell>{new Date(a.attendance_date).toLocaleDateString()}</TableCell>
                        <TableCell>{a.employee_code}</TableCell>
                        <TableCell>{new Date(a.check_in).toLocaleTimeString()}</TableCell>
                        <TableCell>{a.check_out ? new Date(a.check_out).toLocaleTimeString() : "Pending"}</TableCell>
                        <TableCell>{a.working_hours ? Number(a.working_hours).toFixed(2) : "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
