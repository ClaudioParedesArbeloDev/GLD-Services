import React from "react";
import ReactDOM from "react-dom/client";
import { Auth0Provider } from "@auth0/auth0-react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import Checkout from "./pages/Checkout";

import Home from "./pages/Home";
import Navbar from "./components/navbar";
import Footer from "./components/footer";
import ProductDetail from "./pages/ProductDetail";
import AdminDashboard from "./pages/admin/AdminDashboard";
import CategoriesAdmin from "./pages/admin/CategoriesAdmin";
import ProductsAdmin from "./pages/admin/ProductsAdmin";
import ProtectedRoute from "./components/ProtectedRoute";

import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Auth0Provider
      domain="claudioparedes.us.auth0.com"
      clientId="71wnXPaTnOSGY4Hwz6d17qo3AnOx6c4Z"
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: "https://api.gldimportaciones.com",
      }}
    >
      <BrowserRouter>
        <CartProvider>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/categories" element={<ProtectedRoute><CategoriesAdmin /></ProtectedRoute>} />
            <Route path="/admin/products" element={<ProtectedRoute><ProductsAdmin /></ProtectedRoute>} />
            <Route path="/checkout" element={<Checkout />} />
          </Routes>
          <Footer />
        </CartProvider>
      </BrowserRouter>
    </Auth0Provider>
  </React.StrictMode>
);