"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";
import AuthGuard from "@/components/auth/AuthGuard";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function PerformancePage() {
  const { data: goals, isLoading: isGoalsLoading } = useQuery({
    queryKey: ["performance-goals"],
    queryFn: async () => {
      const res = await api.get("/performance/goals");
      return res.data.data;
    }
  });

  const { data: reviews, isLoading: isReviewsLoading } = useQuery({
    queryKey: ["performance-reviews"],
    queryFn: async () => {
      const res = await api.get("/performance/reviews");
      return res.data.data;
    }
  });

  return (
    <AuthGuard>
      <DashboardLayout>
        <h1 className="text-2xl font-bold mb-6">Performance & Reviews</h1>

        <Tabs defaultValue="goals" className="space-y-6">
          <TabsList className="bg-white border rounded-md shadow-sm h-12 w-full justify-start overflow-x-auto">
            <TabsTrigger value="goals">Company Goals</TabsTrigger>
            <TabsTrigger value="reviews">Performance Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="goals">
            <Card>
              <CardHeader><CardTitle>Goal Tracking</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {isGoalsLoading ? (
                    <>
                      <Skeleton className="h-24 w-full" />
                      <Skeleton className="h-24 w-full" />
                      <Skeleton className="h-24 w-full" />
                    </>
                  ) : (
                    <>
                      {goals?.map((g: any) => (
                        <div key={g.id} className="border p-4 rounded-lg">
                          <div className="flex justify-between mb-2">
                            <div>
                              <h3 className="font-semibold">{g.title}</h3>
                              <p className="text-sm text-gray-500">Assigned to: {g.employee_name} ({g.employee_code})</p>
                            </div>
                            <Badge variant={g.progress === 100 ? "default" : "secondary"}>
                              {g.progress}%
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-700 mb-4">{g.description}</p>
                          <Progress value={g.progress} className="h-2" />
                        </div>
                      ))}
                      {(!goals || goals.length === 0) && (
                        <p className="text-gray-500 text-center py-4">No goals assigned.</p>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <Card>
              <CardHeader><CardTitle>Review History</CardTitle></CardHeader>
              <CardContent>
                {isReviewsLoading ? (
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
                        <TableHead>Reviewer</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Feedback</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reviews?.map((r: any) => (
                        <TableRow key={r.id}>
                          <TableCell>{new Date(r.created_at).toLocaleDateString()}</TableCell>
                          <TableCell className="font-medium">{r.employee_name}</TableCell>
                          <TableCell>{r.reviewer_name}</TableCell>
                          <TableCell>
                            <div className="flex items-center text-yellow-500">
                              {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs truncate" title={r.comments}>
                            {r.comments}
                          </TableCell>
                        </TableRow>
                      ))}
                      {(!reviews || reviews.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-gray-500 py-4">No performance reviews found.</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

      </DashboardLayout>
    </AuthGuard>
  );
}
