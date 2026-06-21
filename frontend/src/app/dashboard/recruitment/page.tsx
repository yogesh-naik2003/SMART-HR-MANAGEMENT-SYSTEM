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
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

const jobSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  department_id: z.string().min(1, "Department ID is required"),
  description: z.string().min(10, "Description must be at least 10 characters")
});

const candidateSchema = z.object({
  full_name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  experience: z.string().optional()
});

export default function RecruitmentPage() {
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [funnel, setFunnel] = useState([]);
  
  const jobForm = useForm<z.infer<typeof jobSchema>>({
    resolver: zodResolver(jobSchema),
    defaultValues: { title: "", department_id: "", description: "" }
  });

  const candidateForm = useForm<z.infer<typeof candidateSchema>>({
    resolver: zodResolver(candidateSchema),
    defaultValues: { full_name: "", email: "", phone: "", experience: "" }
  });

  const fetchData = async () => {
    try {
      const jRes = await api.get("/recruitment/jobs");
      setJobs(jRes.data.data);
      const cRes = await api.get("/recruitment/candidates");
      setCandidates(cRes.data.data);
      const fRes = await api.get("/recruitment/funnel");
      setFunnel(fRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onJobSubmit = async (values: z.infer<typeof jobSchema>) => {
    try {
      await api.post("/recruitment/jobs", { ...values, department_id: Number(values.department_id) });
      toast.success("Job posted successfully!");
      fetchData();
      jobForm.reset();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to post job");
    }
  };

  const onCandidateSubmit = async (values: z.infer<typeof candidateSchema>) => {
    try {
      await api.post("/recruitment/candidates", values);
      toast.success("Candidate added successfully!");
      fetchData();
      candidateForm.reset();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add candidate");
    }
  };

  return (
    <AuthGuard>
      <DashboardLayout>
        <h1 className="text-2xl font-bold mb-6">Recruitment & ATS</h1>

        <Tabs defaultValue="funnel" className="space-y-6">
          <TabsList className="bg-white border rounded-md shadow-sm h-12 w-full justify-start overflow-x-auto">
            <TabsTrigger value="funnel">Recruitment Funnel</TabsTrigger>
            <TabsTrigger value="jobs">Job Management</TabsTrigger>
            <TabsTrigger value="candidates">Candidate Tracking</TabsTrigger>
          </TabsList>

          <TabsContent value="funnel">
            <Card>
              <CardHeader><CardTitle>Pipeline Overview</CardTitle></CardHeader>
              <CardContent>
                <div className="w-full">
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={funnel}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip />
                      <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="#93c5fd" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="jobs" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader><CardTitle>Post a Job</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={jobForm.handleSubmit(onJobSubmit)} className="space-y-4">
                  <div>
                    <Label>Job Title</Label>
                    <Input {...jobForm.register("title")} />
                    {jobForm.formState.errors.title && (
                      <p className="text-sm text-red-500 mt-1">{jobForm.formState.errors.title.message}</p>
                    )}
                  </div>
                  <div>
                    <Label>Dept ID</Label>
                    <Input type="number" {...jobForm.register("department_id")} />
                    {jobForm.formState.errors.department_id && (
                      <p className="text-sm text-red-500 mt-1">{jobForm.formState.errors.department_id.message}</p>
                    )}
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Input {...jobForm.register("description")} />
                    {jobForm.formState.errors.description && (
                      <p className="text-sm text-red-500 mt-1">{jobForm.formState.errors.description.message}</p>
                    )}
                  </div>
                  <Button type="submit" className="w-full">Publish Job</Button>
                </form>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader><CardTitle>Active Openings</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Posted</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobs.map((j: any) => (
                      <TableRow key={j.id}>
                        <TableCell className="font-medium">{j.title}</TableCell>
                        <TableCell>{j.department_name}</TableCell>
                        <TableCell>{new Date(j.created_at).toLocaleDateString()}</TableCell>
                        <TableCell><Badge variant="default">Open</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="candidates" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader><CardTitle>Add Candidate</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={candidateForm.handleSubmit(onCandidateSubmit)} className="space-y-4">
                  <div>
                    <Label>Full Name</Label>
                    <Input {...candidateForm.register("full_name")} />
                    {candidateForm.formState.errors.full_name && (
                      <p className="text-sm text-red-500 mt-1">{candidateForm.formState.errors.full_name.message}</p>
                    )}
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input type="email" {...candidateForm.register("email")} />
                    {candidateForm.formState.errors.email && (
                      <p className="text-sm text-red-500 mt-1">{candidateForm.formState.errors.email.message}</p>
                    )}
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input {...candidateForm.register("phone")} />
                  </div>
                  <div>
                    <Label>Experience (Years)</Label>
                    <Input type="number" {...candidateForm.register("experience")} />
                  </div>
                  <Button type="submit" className="w-full">Save Candidate</Button>
                </form>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader><CardTitle>Candidate Pool</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Experience</TableHead>
                      <TableHead>Applied For</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {candidates.map((c: any) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">
                          <div>{c.full_name}</div>
                          <div className="text-xs text-gray-500">{c.email}</div>
                        </TableCell>
                        <TableCell>{c.experience} Yrs</TableCell>
                        <TableCell>{c.applied_job || "None"}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{c.status || "NEW"}</Badge>
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
