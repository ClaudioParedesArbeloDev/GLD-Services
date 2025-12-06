import { useAuth0 } from "@auth0/auth0-react";
import { Link } from "react-router-dom";

import LoginButton from "./LoginButton";
import LogoutButton from "./Logout";
import CartButton from "./CartButton";
import Cart from "./Cart"; 

function Navbar() {
  const { isAuthenticated, isLoading, user } = useAuth0();
  const isAdmin = user?.email === "claudioparedesarbelo@gmail.com";

  return (
    <>
      <header className="sticky top-0 z-50 bg-linear-to-t from-sky-500 to-indigo-500 backdrop-blur-md shadow-lg border-b border-white/10 md:py-4">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2 hover:scale-105 transition-transform">
            <img
              src="/logo-light.png"
              alt="GLD Importaciones"
              className="w-16 md:w-20 lg:w-24"
            />
            <div className="hidden md:block text-text-color">
              <p className="text-xs md:text-sm tracking-widest font-light">DIVISIÓN</p>
              <p className="text-lg md:text-xl font-bold tracking-wider">IMPORTACIONES</p>
            </div>
          </Link>

          
          <div className="flex items-center gap-3 sm:gap-5">
            
            
            <CartButton />
            
            {isLoading ? (
              <div className="text-sm animate-pulse">Cargando...</div>
            ) : isAuthenticated ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="relative group">
                    <img
                      src={user.picture}
                      alt={user.name}
                      className="w-10 h-10 rounded-full ring-2 ring-white/50 shadow-lg"
                    />
                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs bg-black/70 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
                      {user.name}
                    </span>
                  </div>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="hidden sm:flex items-center gap-2 bg-linear-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white px-4 py-2 rounded-full font-bold shadow-md transition"
                    >
                      <i className="fa-solid fa-crown"></i>
                      Admin
                    </Link>
                  )}
                </div>
                <LogoutButton />
              </>
            ) : (
              <LoginButton />
            )}
          </div>
        </div>
      </header>
      <Cart />
    </>
  );
}

export default Navbar;