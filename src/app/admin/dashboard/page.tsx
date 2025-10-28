"use client";

import { AdminProtectedRoute } from "@/components/AdminProtectedRoute";
import AdminDashboard from "@/components/pages/admin/dashboard";

export default function AdminDashboardPage() {
  return (
    <AdminProtectedRoute>
      <AdminDashboard />
    </AdminProtectedRoute>
  );
}

