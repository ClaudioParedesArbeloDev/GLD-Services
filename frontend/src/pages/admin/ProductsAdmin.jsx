import { useEffect, useState } from "react";
import api from "../../services/api";
import ProductForm from "./ProductForm";

export default function ProductsAdmin() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get("/products"),
        api.get("/categories"),
      ]);
      setProducts(prodRes.data.data || prodRes.data || []);
      setCategories(catRes.data.data || catRes.data || []);
    } catch (err) {
      console.error(err);
      alert("Error cargando datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = products.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchCategory = !filterCategory || p.category_id == filterCategory;
    const matchStatus = !filterStatus || p.status === filterStatus;
    return matchSearch && matchCategory && matchStatus;
  });

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este producto? Esta acción no se puede deshacer.")) return;
    try {
      await api.delete(`/products/${id}`);
      loadData();
      alert("Producto eliminado exitosamente");
    } catch (err) {
      console.error(err);
      alert("Error al eliminar el producto");
    }
  };

  const handleEdit = (product) => {
    setEditing(product);
    setShowForm(true);
  };

  const handleNew = () => {
    setEditing(null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditing(null);
  };

  const getCategoryName = (categoryId) => {
    const cat = categories.find((c) => c.id === categoryId);
    return cat ? cat.name : "Sin categoría";
  };

  return (
    <div className="min-h-screen bg-body py-16">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-4xl font-light text-primary mb-12 text-center font-[var(--font-two)]">
          <i className="fa-solid fa-boxes-stacked mr-3 text-secondary"></i>
          Administrar Productos
        </h2>

        {!showForm && (
          <>
            {/* Barra de búsqueda y filtros */}
            <div className="bg-white p-6 rounded-2xl shadow-md mb-8 border border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-main mb-2">
                    Buscar producto
                  </label>
                  <div className="relative">
                    <i className="fa-solid fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    <input
                      type="text"
                      placeholder="Buscar por título..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:border-primary focus:outline-none transition-all duration-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-main mb-2">
                    Categoría
                  </label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-primary focus:outline-none transition-all duration-200"
                  >
                    <option value="">Todas</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-main mb-2">
                    Estado
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-primary focus:outline-none transition-all duration-200"
                  >
                    <option value="">Todos</option>
                    <option value="inactive">Out of stock</option>
                    <option value="active">Disponible</option>
                    <option value="waiting">En espera</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200">
                <div className="text-muted">
                  Mostrando <span className="font-semibold text-primary">{filtered.length}</span> de{" "}
                  <span className="font-semibold">{products.length}</span> productos
                </div>
                <button
                  onClick={handleNew}
                  className="px-8 py-3 bg-green-500 hover:bg-primary/90 text-white rounded-full font-medium shadow-md transition-all duration-200 flex items-center gap-2"
                >
                  <i className="fa-solid fa-plus"></i>
                  Nuevo Producto
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary"></div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 bg-green-300 rounded-3xl shadow-lg border border-gray-100">
                <i className="fa-solid fa-box-open text-6xl text-gray-300 mb-4"></i>
                <p className="text-xl font-light text-muted">
                  {products.length === 0 ? "No hay productos aún" : "No se encontraron productos"}
                </p>
                <p className="text-sm text-muted mt-2">
                  {products.length === 0
                    ? "Crea tu primer producto para comenzar"
                    : "Intenta con otros filtros o términos de búsqueda"}
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-blue-50">
                      <tr>
                        <th className="p-6 text-left text-primary font-medium">ID</th>
                        <th className="p-6 text-left text-primary font-medium">Título</th>
                        <th className="p-6 text-left text-primary font-medium">Categoría</th>
                        <th className="p-6 text-left text-primary font-medium">Precio</th>
                        <th className="p-6 text-left text-primary font-medium">Stock</th>
                        <th className="p-6 text-left text-primary font-medium">Estado</th>
                        <th className="p-6 text-center text-primary font-medium">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((p) => (
                        <tr
                          key={p.id}
                          className="border-t border-gray-100 hover:bg-blue-50/50 transition-all duration-200"
                        >
                          <td className="p-6 text-muted font-mono text-sm">{p.id}</td>
                          <td className="p-6 text-main font-semibold">{p.title}</td>
                          <td className="p-6 text-muted text-sm">
                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-primary text-xs font-medium">
                              {getCategoryName(p.category_id)}
                            </span>
                          </td>
                          <td className="p-6 text-main font-semibold">
                            ${Number(p.price).toLocaleString()}
                            {p.discount > 0 && (
                              <span className="ml-2 text-xs text-red-500">-{p.discount}%</span>
                            )}
                          </td>
                          <td className="p-6">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                p.stock > 10
                                  ? "bg-green-50 text-green-700"
                                  : p.stock > 0
                                  ? "bg-yellow-50 text-yellow-700"
                                  : "bg-red-50 text-red-700"
                              }`}
                            >
                              {p.stock} unidades
                            </span>
                          </td>
                          <td className="p-6">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                p.status === "active"
                                  ? "bg-green-50 text-green-700"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {p.status === "active" ? "Activo" : "Inactivo"}
                            </span>
                          </td>
                          <td className="p-6 text-center">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => handleEdit(p)}
                                className="px-4 py-2 bg-indigo-400 hover:bg-secondary/80 text-white rounded-full font-medium shadow-md transition-all duration-200"
                                title="Editar"
                              >
                                <i className="fa-solid fa-pen"></i>
                              </button>
                              <button
                                onClick={() => handleDelete(p.id)}
                                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full font-medium shadow-md transition-all duration-200"
                                title="Eliminar"
                              >
                                <i className="fa-solid fa-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {showForm && (
          <div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto"
            onClick={handleCloseForm}
          >
            <div
              className="bg-white p-8 rounded-3xl shadow-2xl border border-gray-100 max-w-5xl w-full my-8"
              onClick={(e) => e.stopPropagation()}
            >
              <ProductForm
                product={editing}
                categories={categories}
                onSuccess={() => {
                  handleCloseForm();
                  loadData();
                }}
                onCancel={handleCloseForm}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}