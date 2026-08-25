import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ROLE_DASHBOARD_PATHS, type Role } from "@/lib/constants";

function getActiveRole(contextRole: Role | null): Role | null {
  if (contextRole) {
    const clean = contextRole.toLowerCase().replace(/^role_/, "").trim();
    if (clean === "admin" || clean === "faculty" || clean === "executor" || clean === "student") {
      return clean as Role;
    }
  }

  // Fallback to localStorage if state hasn't re-rendered yet
  try {
    const savedStr = localStorage.getItem("eduflow_user_profile");
    if (savedStr) {
      const saved = JSON.parse(savedStr);
      if (saved && saved.role) {
        const clean = saved.role.toString().toLowerCase().replace(/^role_/, "").trim();
        if (clean === "admin" || clean === "faculty" || clean === "executor" || clean === "student") {
          return clean as Role;
        }
      }
    }
  } catch (e) {}

  return null;
}

function hasActiveSession(contextSession: any): boolean {
  if (contextSession) return true;
  return Boolean(
    localStorage.getItem("eduflow_jwt_token") ||
    localStorage.getItem("eduflow_mock_auth_profile_id") ||
    localStorage.getItem("eduflow_user_profile")
  );
}

/**
 * ProtectedRoute — Blocks unauthenticated users.
 * Redirects to /login if no session.
 */
export function ProtectedRoute() {
  try {
    const { session, loading } = useAuth();

    if (loading) {
      return (
        <div className="flex h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      );
    }

    if (!hasActiveSession(session)) {
      return <Navigate to="/login" replace />;
    }

    return <Outlet />;
  } catch (err) {
    return <Outlet />;
  }
}

/**
 * RoleRoute — Restricts access to specific roles.
 * Redirects to the user's own dashboard if role doesn't match.
 */
export function RoleRoute({ allowedRoles }: { allowedRoles: string[] }) {
  try {
    const { role, loading } = useAuth();

    if (loading) {
      return (
        <div className="flex h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      );
    }

    const currentRole = getActiveRole(role);
    const allowedNormalized = allowedRoles.map((r) => r.toLowerCase().replace(/^role_/, "").trim());

    if (!currentRole || !allowedNormalized.includes(currentRole)) {
      const dashboardPath = currentRole && ROLE_DASHBOARD_PATHS[currentRole]
        ? ROLE_DASHBOARD_PATHS[currentRole]
        : "/login";
      return <Navigate to={dashboardPath} replace />;
    }

    return <Outlet />;
  } catch (err) {
    return <Outlet />;
  }
}

/**
 * PublicOnlyRoute — Blocks authenticated users from auth pages.
 * Redirects to role dashboard if already logged in.
 */
export function PublicOnlyRoute() {
  try {
    const { session, role, loading } = useAuth();

    if (loading) {
      return (
        <div className="flex h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      );
    }

    const currentRole = getActiveRole(role);
    if (hasActiveSession(session) && currentRole && ROLE_DASHBOARD_PATHS[currentRole]) {
      return <Navigate to={ROLE_DASHBOARD_PATHS[currentRole]} replace />;
    }

    return <Outlet />;
  } catch (err) {
    return <Outlet />;
  }
}
