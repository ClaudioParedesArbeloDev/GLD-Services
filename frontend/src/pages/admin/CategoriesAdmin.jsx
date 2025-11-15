import { useEffect, useState } from "react";
import api from "../../services/api";
import CategoryForm from "./CategoryForm";

export default function CategoriesAdmin() {
  const [categories, setCategories] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get("/categories");
      setCategories(res.data.data || res.data || []);
    } catch (err) {
      console.error(err);
      alert("Error cargando categorías");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar esta categoría? Esto puede afectar los productos asociados.")) return;
    try {
      await api.delete(`/categories/${id}`);
      loadCategories();
      alert("Categoría eliminada exitosamente");
    } catch (err) {
      console.error(err);
      alert("Error al eliminar la categoría");
    }
  };

  const handleEdit = (category) => {
    setEditing(category);
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

  return (
    <div className="min-h-screen bg-body py-16">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-4xl font-light text-primary mb-12 text-center font-[var(--font-two)]">
          <i className="fa-solid fa-tags mr-3 text-secondary"></i>
          Administrar Categorías
        </h2>

        {!showForm && (
          <>
            <div className="mb-8 flex justify-between items-center">
              <button
                onClick={handleNew}
                className="px-8 py-4 bg-primary hover:bg-primary/90 text-black rounded-full font-medium shadow-md transition-all duration-200 flex items-center gap-2"
              >
                <i className="fa-solid fa-plus"></i>
                Nueva Categoría
              </button>
              
              <div className="text-muted">
                Total: <span className="font-semibold text-primary">{categories.length}</span> categorías
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary"></div>
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl shadow-lg border border-gray-100">
                <i className="fa-solid fa-tags text-6xl text-gray-300 mb-4"></i>
                <p className="text-xl font-light text-muted">No hay categorías aún</p>
                <p className="text-sm text-muted mt-2">Crea tu primera categoría para comenzar</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                <table className="w-full">
                  <thead className="bg-blue-50">
                    <tr>
                      <th className="p-6 text-left text-primary font-medium">ID</th>
                      <th className="p-6 text-left text-primary font-medium">Nombre</th>
                      <th className="p-6 text-left text-primary font-medium">Descripción</th>
                      <th className="p-6 text-center text-primary font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((cat) => (
                      <tr
                        key={cat.id}
                        className="border-t border-gray-100 hover:bg-blue-50/50 transition-all duration-200"
                      >
                        <td className="p-6 text-muted font-mono text-sm">{cat.id}</td>
                        <td className="p-6 text-main font-semibold">{cat.name}</td>
                        <td className="p-6 text-muted text-sm">
                          {cat.description || <span className="italic text-gray-400">Sin descripción</span>}
                        </td>
                        <td className="p-6 text-center">
                          <div className="flex justify-center gap-3">
                            <button
                              onClick={() => handleEdit(cat)}
                              className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-full font-medium shadow-md transition-all duration-200 flex items-center gap-2"
                              title="Editar"
                            >
                              <i className="fa-solid fa-pen"></i>
                              <span className="text-sm">Editar</span>
                            </button>
                            <button
                              onClick={() => handleDelete(cat.id)}
                              className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full font-medium shadow-md transition-all duration-200 flex items-center gap-2"
                              title="Eliminar"
                            >
                              <i className="fa-solid fa-trash"></i>
                              <span className="text-sm">Eliminar</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {showForm && (
          <div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
            onClick={handleCloseForm}
          >
            <div
              className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full border border-gray-100"
              onClick={(e) => e.stopPropagation()}
            >
              <CategoryForm
                category={editing}
                onSuccess={() => {
                  handleCloseForm();
                  loadCategories();
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