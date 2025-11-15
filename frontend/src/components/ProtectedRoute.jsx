import { useAuth0 } from "@auth0/auth0-react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading, user } = useAuth0();

  if (isLoading) return <div className="p-8 text-center">Cargando...</div>;

  const isAdmin = user?.email === "claudioparedesarbelo@gmail.com";

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}