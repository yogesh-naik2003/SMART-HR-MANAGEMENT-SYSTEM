"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/services/api";
import AuthGuard from "@/components/auth/AuthGuard";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default function EmployeeProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/employees/${params.id}`);
        setData(res.data.data);
      } catch (err) {
        console.error(err);
        alert("Failed to load employee profile");
      } finally {
        setLoading(false);
      }
    };
    if (params.id) fetchProfile();
  }, [params.id]);

  if (loading) {
    return (
      <AuthGuard>
        <DashboardLayout>
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-gray-200 rounded-lg"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </DashboardLayout>
      </AuthGuard>
    );
  }

  if (!data) return null;

  const { profile, attendance, leaves, payroll, documents, performance } = data;

  return (
    <AuthGuard>
      <DashboardLayout>
        
        {/* Header Section */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center space-x-6">
            <Avatar className="h-24 w-24 border-4 border-white shadow">
              <AvatarFallback className="bg-blue-600 text-white text-3xl">
                {profile.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{profile.name || "Unknown"}</h1>
              <div className="text-gray-500 mt-1 flex items-center space-x-2">
                <span>{profile.designation}</span>
                <span>•</span>
                <Badge variant="secondary">{profile.department_name}</Badge>
                <span>•</span>
                <span>Emp Code: {profile.employee_code}</span>
              </div>
            </div>
          </div>
          <Button variant="outline" onClick={() => router.push("/dashboard/employees")}>
            Back to Directory
          </Button>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-white border rounded-md shadow-sm h-12 w-full justify-start overflow-x-auto">
            <TabsTrigger value="profile">Profile Details</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="leaves">Leave Records</TabsTrigger>
            <TabsTrigger value="payroll">Payroll History</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div><p className="text-sm text-gray-500">Email</p><p className="font-medium">{profile.email}</p></div>
                <div><p className="text-sm text-gray-500">Phone</p><p className="font-medium">{profile.phone || "N/A"}</p></div>
                <div><p className="text-sm text-gray-500">Joining Date</p><p className="font-medium">{new Date(profile.joining_date).toLocaleDateString()}</p></div>
                <div><p className="text-sm text-gray-500">Salary</p><p className="font-medium">₹{Number(profile.salary).toLocaleString()}</p></div>
                <div className="col-span-2"><p className="text-sm text-gray-500">Address</p><p className="font-medium">{profile.address || "N/A"}</p></div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance">
            <Card>
              <CardHeader><CardTitle>Recent Attendance (Last 30 Days)</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Check In</TableHead>
                      <TableHead>Check Out</TableHead>
                      <TableHead>Hours</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendance.map((rec: any) => (
                      <TableRow key={rec.id}>
                        <TableCell>{new Date(rec.attendance_date).toLocaleDateString()}</TableCell>
                        <TableCell>{rec.check_in}</TableCell>
                        <TableCell>{rec.check_out || "Pending"}</TableCell>
                        <TableCell>{rec.working_hours || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leaves">
            <Card>
              <CardHeader><CardTitle>Leave History</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaves.map((l: any) => (
                      <TableRow key={l.id}>
                        <TableCell>{l.leave_type_name}</TableCell>
                        <TableCell>{new Date(l.start_date).toLocaleDateString()} to {new Date(l.end_date).toLocaleDateString()}</TableCell>
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

          <TabsContent value="payroll">
            <Card>
              <CardHeader><CardTitle>Payslips</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Period</TableHead>
                      <TableHead>Net Salary</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payroll.map((p: any) => (
                      <TableRow key={p.id}>
                        <TableCell>{p.month}/{p.year}</TableCell>
                        <TableCell className="font-medium text-green-600">₹{Number(p.net_salary).toLocaleString()}</TableCell>
                        <TableCell><Badge>Generated</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance">
            <Card>
              <CardHeader><CardTitle>Performance Reviews</CardTitle></CardHeader>
              <CardContent>
                {performance.length > 0 ? (
                  <div className="space-y-4">
                    {performance.map((pr: any) => (
                      <div key={pr.id} className="border p-4 rounded-md">
                        <div className="flex justify-between mb-2">
                          <h4 className="font-medium">Rating: {pr.rating}/5</h4>
                          <span className="text-sm text-gray-500">{new Date(pr.review_date).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-gray-700">{pr.comments}</p>
                        <p className="text-xs text-gray-400 mt-2">Reviewed by: {pr.reviewer_name}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No performance reviews found.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <Card>
              <CardHeader><CardTitle>Employee Documents</CardTitle></CardHeader>
              <CardContent>
                {documents.length > 0 ? (
                  <ul className="list-disc pl-5">
                    {documents.map((doc: any) => (
                      <li key={doc.id} className="mb-2 text-blue-600 hover:underline cursor-pointer">
                        {doc.document_type} (Added: {new Date(doc.created_at).toLocaleDateString()})
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No documents uploaded.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </DashboardLayout>
    </AuthGuard>
  );
}
