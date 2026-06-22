"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import EmployeeTable from "@/components/employee/EmployeeTable";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

export default function EmployeesPage() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Employee Directory</h1>
            <p className="text-gray-500 text-sm">Manage your team members and view their profiles.</p>
          </div>
          <Link href="/dashboard/employees/add">
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
              <UserPlus className="mr-2 h-4 w-4" />
              Add Employee
            </Button>
          </Link>
        </div>

        <EmployeeTable />
      </DashboardLayout>
    </AuthGuard>
  );
}
