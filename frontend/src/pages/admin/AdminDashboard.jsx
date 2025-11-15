import { Link } from "react-router-dom";

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-body py-16">
      <div className="max-w-7xl mx-auto px-6">
        <h1 className="text-4xl font-light text-primary mb-12 text-center flex items-center justify-center gap-4 font-[var(--font-two)]">
          <i className="fa-solid fa-crown text-secondary"></i>
          Panel Administrador
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Link
            to="/admin/products"
            className="bg-white p-10 rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-1"
          >
            <i className="fa-solid fa-boxes-stacked text-6xl text-primary mb-4"></i>
            <h2 className="text-2xl font-light text-primary">Productos</h2>
            <p className="text-muted mt-2">Crear, editar y eliminar productos</p>
          </Link>

          <Link
            to="/admin/categories"
            className="bg-white p-10 rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-1"
          >
            <i className="fa-solid fa-tags text-6xl text-primary mb-4"></i>
            <h2 className="text-2xl font-light text-primary">Categorías</h2>
            <p className="text-muted mt-2">Gestionar categorías de productos</p>
          </Link>
        </div>
      </div>
    </div>
  );
}