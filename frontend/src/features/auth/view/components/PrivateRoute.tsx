import { Navigate, Outlet } from "react-router-dom";
import { useAuthSessionViewModel } from "../../viewModel/useAuthSessionViewModel";

export function PrivateRoute() {
  const { isAuthenticated } = useAuthSessionViewModel();

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
