import { useIsAdmin } from "../hooks/useIsAdmin";
import { useAuth0 } from "@auth0/auth0-react";

export default function RequireAdmin({ children }) {
  const { isAdmin, loading } = useIsAdmin();
  const { isAuthenticated, loginWithRedirect } = useAuth0();

  if (!isAuthenticated) {
    loginWithRedirect({ appState: { returnTo: window.location.pathname } });
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-emerald-600"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-pink-100">
        <div className="text-center p-20 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-rose-200">
          <i className="fa-solid fa-lock text-9xl text-rose-500 mb-8"></i>
          <h1 className="text-6xl font-extralight text-rose-600 mb-4">ACCESO RESTRINGIDO</h1>
          <p className="text-2xl text-rose-500">Solo administradores autorizados</p>
        </div>
      </div>
    );
  }

  return children;
}