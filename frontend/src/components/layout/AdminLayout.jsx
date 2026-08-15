import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { AdminSidebar } from "./AdminSidebar";

export function AdminLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: "40px", textAlign: "center" }}>載入後台身分驗證中...</div>;
  }

  if (!user || !user.is_admin) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="admin-layout-wrapper">
      <AdminSidebar />
      <main className="admin-main-container">
        <Outlet />
      </main>
    </div>
  );
}
