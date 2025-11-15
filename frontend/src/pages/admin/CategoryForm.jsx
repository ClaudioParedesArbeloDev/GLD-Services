import { useState } from "react";
import api from "../../services/api";

export default function CategoryForm({ category, onSuccess, onCancel }) {
  const [name, setName] = useState(category ? category.name : "");
  const [description, setDescription] = useState(category ? category.description || "" : "");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    
    if (!name.trim()) {
      newErrors.name = "El nombre es requerido";
    } else if (name.trim().length < 3) {
      newErrors.name = "El nombre debe tener al menos 3 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;

    setLoading(true);
    try {
      if (category) {
        await api.put(`/categories/${category.id}`, { name, description });
        alert("Categoría actualizada exitosamente");
      } else {
        await api.post("/categories", { name, description });
        alert("Categoría creada exitosamente");
      }
      onSuccess();
    } catch (err) {
      console.error(err);
      alert("Error al guardar la categoría. Por favor intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
          <i className="fa-solid fa-tag text-2xl text-primary"></i>
        </div>
        <h3 className="text-2xl font-light text-primary">
          {category ? "Editar Categoría" : "Nueva Categoría"}
        </h3>
        <p className="text-sm text-muted mt-2">
          {category ? "Modifica los datos de la categoría" : "Completa los datos de la nueva categoría"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-main mb-2">
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Ej: Electrónica, Ropa, Hogar..."
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors({ ...errors, name: "" });
            }}
            className={`w-full border ${errors.name ? 'border-red-500' : 'border-gray-300'} px-4 py-3 rounded-xl focus:border-primary focus:outline-none transition-all duration-200`}
            disabled={loading}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-main mb-2">
            Descripción <span className="text-gray-400 text-xs">(opcional)</span>
          </label>
          <textarea
            placeholder="Describe brevemente esta categoría..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:border-primary focus:outline-none transition-all duration-200 h-28 resize-none"
            disabled={loading}
          />
          <p className="text-xs text-muted mt-1">
            {description.length} caracteres
          </p>
        </div>

        <div className="flex justify-between gap-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-main rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-green-700 hover:bg-green-500 text-white rounded-xl font-medium shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <i className="fa-solid fa-spinner fa-spin"></i>
                Guardando...
              </>
            ) : (
              <>
                <i className="fa-solid fa-save"></i>
                {category ? "Actualizar" : "Crear"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}