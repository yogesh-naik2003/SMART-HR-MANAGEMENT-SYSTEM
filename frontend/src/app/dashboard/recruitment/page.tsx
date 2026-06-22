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
import { motion } from "framer-motion";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

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

        <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }}>
        <Tabs defaultValue="funnel" className="space-y-6">
          <TabsList className="glass-panel border-white/40 dark:border-white/10 shadow-sm h-14 w-full justify-start overflow-x-auto p-1 rounded-xl">
            <TabsTrigger value="funnel" className="rounded-lg data-[state=active]:shadow-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 transition-all">Recruitment Funnel</TabsTrigger>
            <TabsTrigger value="jobs" className="rounded-lg data-[state=active]:shadow-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 transition-all">Job Management</TabsTrigger>
            <TabsTrigger value="candidates" className="rounded-lg data-[state=active]:shadow-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 transition-all">Candidate Tracking</TabsTrigger>
          </TabsList>

          <TabsContent value="funnel">
            <motion.div variants={itemVariants}>
            <Card className="glass-panel border-white/40 dark:border-white/10 shadow-xl overflow-hidden">
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
            </motion.div>
          </TabsContent>

          <TabsContent value="jobs" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div variants={itemVariants} className="lg:col-span-1">
            <Card className="glass-panel border-white/40 dark:border-white/10 shadow-xl h-full">
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
                  <Button type="submit" className="w-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">Publish Job</Button>
                </form>
              </CardContent>
            </Card>
            </motion.div>

            <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card className="glass-panel border-white/40 dark:border-white/10 shadow-xl overflow-hidden h-full">
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
                      <TableRow key={j.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                        <TableCell className="font-medium text-slate-700 dark:text-slate-300">{j.title}</TableCell>
                        <TableCell>{j.department_name}</TableCell>
                        <TableCell>{new Date(j.created_at).toLocaleDateString()}</TableCell>
                        <TableCell><Badge variant="default">Open</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="candidates" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div variants={itemVariants} className="lg:col-span-1">
            <Card className="glass-panel border-white/40 dark:border-white/10 shadow-xl h-full">
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
                  <Button type="submit" className="w-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">Save Candidate</Button>
                </form>
              </CardContent>
            </Card>
            </motion.div>

            <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card className="glass-panel border-white/40 dark:border-white/10 shadow-xl overflow-hidden h-full">
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
                      <TableRow key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
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
            </motion.div>
          </TabsContent>
        </Tabs>
        </motion.div>
      </DashboardLayout>
    </AuthGuard>
  );
}
