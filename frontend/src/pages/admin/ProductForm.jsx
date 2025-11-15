import { useState, useEffect } from "react";
import api from "../../services/api";

export default function ProductForm({ product, categories, onSuccess, onCancel }) {
  // Estado del formulario principal
  const [form, setForm] = useState({
    title: product?.title || "",
    description: product?.description || "",
    price: product?.price || "",
    discount: product?.discount || 0,
    stock: product?.stock || 0,
    weight: product?.weight || "",
    height: product?.height || "",
    width: product?.width || "",
    length: product?.length || "",
    category_id: product?.category_id || "",
    status: product?.status || "active",
  });

  const [productId, setProductId] = useState(product?.id || null);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Estados para imágenes
  const [images, setImages] = useState([]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newImageAlt, setNewImageAlt] = useState("");
  const [loadingImages, setLoadingImages] = useState(false);

  // Estados para videos
  const [videos, setVideos] = useState([]);
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [newVideoTitle, setNewVideoTitle] = useState("");
  const [newVideoDescription, setNewVideoDescription] = useState("");
  const [newVideoType, setNewVideoType] = useState("youtube");
  const [loadingVideos, setLoadingVideos] = useState(false);

  // Estados para especificaciones
  const [specifications, setSpecifications] = useState([]);
  const [newSpecKey, setNewSpecKey] = useState("");
  const [newSpecValue, setNewSpecValue] = useState("");
  const [loadingSpecs, setLoadingSpecs] = useState(false);

  // Cargar datos del producto si estamos editando
  useEffect(() => {
    if (product?.id) {
      setProductId(product.id);
      loadProductMedia(product.id);
    }
  }, [product]);

  const loadProductMedia = async (id) => {
    try {
      const [imgsRes, vidsRes, specsRes] = await Promise.all([
        api.get(`/products/images/product/${id}`),
        api.get(`/product-videos/product/${id}`),
        api.get(`/product-specifications/product/${id}`),
      ]);
      setImages(imgsRes.data.data || imgsRes.data || []);
      setVideos(vidsRes.data.data || vidsRes.data || []);
      setSpecifications(specsRes.data.data || specsRes.data || []);
    } catch (err) {
      console.error("Error cargando multimedia:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // ============= PRODUCTO PRINCIPAL =============
  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    
    // Validación básica
    if (!form.title || !form.price || !form.category_id) {
      alert("Por favor completa los campos requeridos (título, precio y categoría)");
      return;
    }

    setLoading(true);
    try {
      let id = productId;
      if (productId) {
        // Actualizar producto existente
        await api.put(`/products/${id}`, form);
        alert("Producto actualizado exitosamente");
      } else {
        // Crear nuevo producto
        const res = await api.post("/products", form);
        id = res.data.data.id;
        setProductId(id);
        alert("Producto creado exitosamente. Ahora puedes agregar imágenes, videos y especificaciones.");
      }
      
      // Si es paso final, cerrar
      if (currentStep === 4 || !id) {
        onSuccess();
      } else {
        // Avanzar al siguiente paso
        setCurrentStep(2);
      }
    } catch (err) {
      console.error(err);
      alert("Error guardando producto: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // ============= IMÁGENES =============
  const handleAddImage = async () => {
    if (!newImageUrl.trim()) {
      alert("Por favor ingresa una URL de imagen");
      return;
    }

    if (!productId) {
      alert("Primero debes crear el producto");
      return;
    }

    setLoadingImages(true);
    try {
      const imageData = {
        product_id: productId,
        url: newImageUrl.trim(),
        alt_text: newImageAlt.trim() || null,
        is_main: images.length === 0, // Primera imagen es principal
      };

      const res = await api.post("/products/images", imageData);
      setImages([...images, res.data.data]);
      setNewImageUrl("");
      setNewImageAlt("");
      alert("Imagen agregada exitosamente");
    } catch (err) {
      console.error(err);
      alert("Error agregando imagen");
    } finally {
      setLoadingImages(false);
    }
  };

  const handleSetMainImage = async (imageId) => {
    try {
      await api.patch(`/products/images/${imageId}/set-main`);
      await loadProductMedia(productId);
      alert("Imagen principal actualizada");
    } catch (err) {
      console.error(err);
      alert("Error actualizando imagen principal");
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!window.confirm("¿Eliminar esta imagen?")) return;
    
    try {
      await api.delete(`/products/images/${imageId}`);
      setImages(images.filter((img) => img.id !== imageId));
      alert("Imagen eliminada");
    } catch (err) {
      console.error(err);
      alert("Error eliminando imagen");
    }
  };

  // ============= VIDEOS =============
  const handleAddVideo = async () => {
    if (!newVideoUrl.trim()) {
      alert("Por favor ingresa una URL de video");
      return;
    }

    if (!productId) {
      alert("Primero debes crear el producto");
      return;
    }

    setLoadingVideos(true);
    try {
      const videoData = {
        product_id: productId,
        url: newVideoUrl.trim(),
        title: newVideoTitle.trim() || null,
        description: newVideoDescription.trim() || null,
        video_type: newVideoType,
      };

      const res = await api.post("/product-videos", videoData);
      setVideos([...videos, res.data.data]);
      setNewVideoUrl("");
      setNewVideoTitle("");
      setNewVideoDescription("");
      setNewVideoType("youtube");
      alert("Video agregado exitosamente");
    } catch (err) {
      console.error(err);
      alert("Error agregando video");
    } finally {
      setLoadingVideos(false);
    }
  };

  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm("¿Eliminar este video?")) return;
    
    try {
      await api.delete(`/product-videos/${videoId}`);
      setVideos(videos.filter((vid) => vid.id !== videoId));
      alert("Video eliminado");
    } catch (err) {
      console.error(err);
      alert("Error eliminando video");
    }
  };

  // ============= ESPECIFICACIONES =============
  const handleAddSpecification = async () => {
    if (!newSpecKey.trim() || !newSpecValue.trim()) {
      alert("Por favor completa la clave y el valor de la especificación");
      return;
    }

    if (!productId) {
      alert("Primero debes crear el producto");
      return;
    }

    setLoadingSpecs(true);
    try {
      const specData = {
        product_id: productId,
        spec_key: newSpecKey.trim(),
        spec_value: newSpecValue.trim(),
        display_order: specifications.length,
      };

      const res = await api.post("/product-specifications", specData);
      setSpecifications([...specifications, res.data.data]);
      setNewSpecKey("");
      setNewSpecValue("");
      alert("Especificación agregada exitosamente");
    } catch (err) {
      console.error(err);
      alert("Error agregando especificación");
    } finally {
      setLoadingSpecs(false);
    }
  };

  const handleDeleteSpecification = async (specId) => {
    if (!window.confirm("¿Eliminar esta especificación?")) return;
    
    try {
      await api.delete(`/product-specifications/${specId}`);
      setSpecifications(specifications.filter((spec) => spec.id !== specId));
      alert("Especificación eliminada");
    } catch (err) {
      console.error(err);
      alert("Error eliminando especificación");
    }
  };

  const handleUpdateSpecification = async (specId, newValue) => {
    try {
      await api.put(`/product-specifications/${specId}`, {
        spec_value: newValue,
      });
      setSpecifications(
        specifications.map((spec) =>
          spec.id === specId ? { ...spec, spec_value: newValue } : spec
        )
      );
    } catch (err) {
      console.error(err);
      alert("Error actualizando especificación");
    }
  };

  // ============= NAVEGACIÓN ENTRE PASOS =============
  const steps = [
    { number: 1, title: "Información Básica", icon: "fa-info-circle" },
    { number: 2, title: "Imágenes", icon: "fa-images" },
    { number: 3, title: "Videos", icon: "fa-video" },
    { number: 4, title: "Especificaciones", icon: "fa-list-check" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center pb-6 border-b border-gray-200">
        <h3 className="text-3xl font-light text-primary font-[var(--font-two)]">
          {product ? "Editar Producto" : "Nuevo Producto"}
        </h3>
        {productId && (
          <p className="text-sm text-muted mt-2">ID del producto: {productId}</p>
        )}
      </div>

      {/* Indicador de pasos */}
      <div className="flex justify-between items-center mb-8">
        {steps.map((step, idx) => (
          <div key={step.number} className="flex items-center flex-1">
            <button
              type="button"
              onClick={() => productId && setCurrentStep(step.number)}
              disabled={!productId && step.number > 1}
              className={`flex items-center gap-3 ${
                currentStep === step.number
                  ? "text-primary"
                  : currentStep > step.number
                  ? "text-secondary"
                  : "text-gray-400"
              } ${!productId && step.number > 1 ? "cursor-not-allowed" : "cursor-pointer hover:text-primary"} transition-all duration-200`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  currentStep === step.number
                    ? "bg-primary text-white"
                    : currentStep > step.number
                    ? "bg-secondary text-white"
                    : "bg-gray-200 text-gray-500"
                } transition-all duration-200`}
              >
                {currentStep > step.number ? (
                  <i className="fa-solid fa-check"></i>
                ) : (
                  <i className={`fa-solid ${step.icon}`}></i>
                )}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-medium">Paso {step.number}</p>
                <p className="text-sm">{step.title}</p>
              </div>
            </button>
            {idx < steps.length - 1 && (
              <div className={`flex-1 h-1 mx-2 ${currentStep > step.number ? "bg-secondary" : "bg-gray-200"}`}></div>
            )}
          </div>
        ))}
      </div>

      {/* Contenido según el paso */}
      <div className="min-h-[400px]">
        {/* PASO 1: Información del Producto */}
        {currentStep === 1 && (
          <form onSubmit={handleSubmitProduct} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-main mb-2">
                  Título del Producto <span className="text-red-500">*</span>
                </label>
                <input
                  name="title"
                  type="text"
                  placeholder="Ej: Laptop HP Pavilion 15"
                  value={form.title}
                  onChange={handleChange}
                  className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:border-primary focus:outline-none transition"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-main mb-2">
                  Descripción <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  placeholder="Descripción detallada del producto..."
                  value={form.description}
                  onChange={handleChange}
                  className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:border-primary focus:outline-none transition h-32 resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-main mb-2">
                  Categoría <span className="text-red-500">*</span>
                </label>
                <select
                  name="category_id"
                  value={form.category_id}
                  onChange={handleChange}
                  className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:border-primary focus:outline-none transition"
                  required
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-main mb-2">
                  Estado
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:border-primary focus:outline-none transition"
                >
                  <option value="active">Disponible</option>
                  <option value="inactive">En Espera</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-main mb-2">
                  Precio <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={form.price}
                    onChange={handleChange}
                    className="w-full border border-gray-300 pl-8 pr-4 py-3 rounded-xl focus:border-primary focus:outline-none transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-main mb-2">
                  Descuento (%)
                </label>
                <input
                  name="discount"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0"
                  value={form.discount}
                  onChange={handleChange}
                  className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:border-primary focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-main mb-2">
                  Stock <span className="text-red-500">*</span>
                </label>
                <input
                  name="stock"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={form.stock}
                  onChange={handleChange}
                  className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:border-primary focus:outline-none transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-main mb-2">
                  Peso (gramos)
                </label>
                <input
                  name="weight"
                  type="number"
                  step="0.01"
                  placeholder="0"
                  value={form.weight}
                  onChange={handleChange}
                  className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:border-primary focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-main mb-2">
                  Alto (cm)
                </label>
                <input
                  name="height"
                  type="number"
                  step="0.01"
                  placeholder="0"
                  value={form.height}
                  onChange={handleChange}
                  className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:border-primary focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-main mb-2">
                  Ancho (cm)
                </label>
                <input
                  name="width"
                  type="number"
                  step="0.01"
                  placeholder="0"
                  value={form.width}
                  onChange={handleChange}
                  className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:border-primary focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-main mb-2">
                  Largo (cm)
                </label>
                <input
                  name="length"
                  type="number"
                  step="0.01"
                  placeholder="0"
                  value={form.length}
                  onChange={handleChange}
                  className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:border-primary focus:outline-none transition"
                />
              </div>
            </div>

            <div className="flex justify-end pt-6">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-indigo-500 hover:bg-primary/90 text-white rounded-xl font-medium shadow-md transition disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                    Guardando...
                  </>
                ) : (
                  <>
                    {productId ? "Actualizar y Continuar" : "Crear Producto"}
                    <i className="fa-solid fa-arrow-right ml-2"></i>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* PASO 2: Imágenes */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-xl">
              <p className="text-sm text-primary">
                <i className="fa-solid fa-info-circle mr-2"></i>
                Agrega imágenes para tu producto. La primera imagen será la principal.
              </p>
            </div>

            {/* Formulario para agregar imagen */}
            <div className="bg-gray-50 p-6 rounded-xl space-y-4">
              <h4 className="font-medium text-main flex items-center gap-2">
                <i className="fa-solid fa-plus-circle text-primary"></i>
                Agregar Nueva Imagen
              </h4>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-main mb-2">
                    URL de la Imagen <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://ejemplo.com/imagen.jpg"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:border-primary focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-main mb-2">
                    Texto Alternativo (opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Descripción de la imagen"
                    value={newImageAlt}
                    onChange={(e) => setNewImageAlt(e.target.value)}
                    className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:border-primary focus:outline-none transition"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddImage}
                  disabled={loadingImages}
                  className="w-full px-6 py-3 bg-green-300 hover:bg-green-400 text-white rounded-xl font-medium shadow-md transition disabled:opacity-50"
                >
                  {loadingImages ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                      Agregando...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-plus mr-2"></i>
                      Agregar Imagen
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Lista de imágenes */}
            <div>
              <h4 className="font-medium text-main mb-4 flex items-center gap-2">
                <i className="fa-solid fa-images text-primary"></i>
                Imágenes del Producto ({images.length})
              </h4>

              {images.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                  <i className="fa-solid fa-image text-4xl text-gray-300 mb-2"></i>
                  <p className="text-muted">No hay imágenes aún</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {images.map((img) => (
                    <div
                      key={img.id}
                      className="relative bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition"
                    >
                      {img.is_main && (
                        <div className="absolute top-2 left-2 bg-primary text-white px-3 py-1 rounded-full text-xs font-medium z-10">
                          <i className="fa-solid fa-star mr-1"></i>
                          Principal
                        </div>
                      )}
                      
                      <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                        <img
                          src={img.url}
                          alt={img.alt_text || "Imagen del producto"}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/300x300?text=Error+al+cargar";
                          }}
                        />
                      </div>

                      {img.alt_text && (
                        <p className="text-xs text-muted mb-3 line-clamp-2">{img.alt_text}</p>
                      )}

                      <div className="flex gap-2">
                        {!img.is_main && (
                          <button
                            onClick={() => handleSetMainImage(img.id)}
                            className="flex-1 px-3 py-2 bg-indigo-400 hover:bg-secondary/80 text-white rounded-lg text-xs font-medium transition"
                          >
                            <i className="fa-solid fa-star mr-1"></i>
                            Principal
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteImage(img.id)}
                          className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-medium transition"
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* PASO 3: Videos */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-xl">
              <p className="text-sm text-primary">
                <i className="fa-solid fa-info-circle mr-2"></i>
                Agrega videos de YouTube, Vimeo u otras plataformas para mostrar tu producto en acción.
              </p>
            </div>

            {/* Formulario para agregar video */}
            <div className="bg-gray-50 p-6 rounded-xl space-y-4">
              <h4 className="font-medium text-main flex items-center gap-2">
                <i className="fa-solid fa-plus-circle text-primary"></i>
                Agregar Nuevo Video
              </h4>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-main mb-2">
                    URL del Video <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={newVideoUrl}
                    onChange={(e) => setNewVideoUrl(e.target.value)}
                    className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:border-primary focus:outline-none transition"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-main mb-2">
                      Título (opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Título del video"
                      value={newVideoTitle}
                      onChange={(e) => setNewVideoTitle(e.target.value)}
                      className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:border-primary focus:outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-main mb-2">
                      Tipo de Video
                    </label>
                    <select
                      value={newVideoType}
                      onChange={(e) => setNewVideoType(e.target.value)}
                      className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:border-primary focus:outline-none transition"
                    >
                      <option value="youtube">YouTube</option>
                      <option value="vimeo">Vimeo</option>
                      <option value="other">Otro</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-main mb-2">
                    Descripción (opcional)
                  </label>
                  <textarea
                    placeholder="Descripción del video"
                    value={newVideoDescription}
                    onChange={(e) => setNewVideoDescription(e.target.value)}
                    className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:border-primary focus:outline-none transition h-24 resize-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddVideo}
                  disabled={loadingVideos}
                  className="w-full px-6 py-3 bg-orange-500 hover:bg-primary/90 text-white rounded-xl font-medium shadow-md transition disabled:opacity-50"
                >
                  {loadingVideos ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                      Agregando...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-plus mr-2"></i>
                      Agregar Video
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Lista de videos */}
            <div>
              <h4 className="font-medium text-main mb-4 flex items-center gap-2">
                <i className="fa-solid fa-video text-primary"></i>
                Videos del Producto ({videos.length})
              </h4>

              {videos.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                  <i className="fa-solid fa-video text-4xl text-gray-300 mb-2"></i>
                  <p className="text-muted">No hay videos aún</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {videos.map((video) => (
                    <div
                      key={video.id}
                      className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                              <i className="fa-solid fa-play text-red-600"></i>
                            </div>
                            <div className="flex-1">
                              <h5 className="font-semibold text-main">
                                {video.title || "Video sin título"}
                              </h5>
                              <span className="inline-block px-2 py-1 bg-blue-50 text-primary text-xs rounded-full mt-1">
                                {video.video_type}
                              </span>
                            </div>
                          </div>
                          
                          {video.description && (
                            <p className="text-sm text-muted mb-3">{video.description}</p>
                          )}
                          
                          <a
                            href={video.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline break-all"
                          >
                            <i className="fa-solid fa-link mr-1"></i>
                            {video.url}
                          </a>
                        </div>

                        <button
                          onClick={() => handleDeleteVideo(video.id)}
                          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition flex-shrink-0"
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* PASO 4: Especificaciones */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-xl">
              <p className="text-sm text-primary">
                <i className="fa-solid fa-info-circle mr-2"></i>
                Define las características técnicas de tu producto con pares clave-valor.
              </p>
            </div>

            {/* Formulario para agregar especificación */}
            <div className="bg-gray-50 p-6 rounded-xl space-y-4">
              <h4 className="font-medium text-main flex items-center gap-2">
                <i className="fa-solid fa-plus-circle text-primary"></i>
                Agregar Nueva Especificación
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-main mb-2">
                    Clave <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Procesador, RAM, Pantalla..."
                    value={newSpecKey}
                    onChange={(e) => setNewSpecKey(e.target.value)}
                    className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:border-primary focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-main mb-2">
                    Valor <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Intel Core i7, 16GB, 15.6 pulgadas..."
                    value={newSpecValue}
                    onChange={(e) => setNewSpecValue(e.target.value)}
                    className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:border-primary focus:outline-none transition"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddSpecification}
                disabled={loadingSpecs}
                className="w-full px-6 py-3 bg-orange-300 hover:bg-primary/90 text-white rounded-xl font-medium shadow-md transition disabled:opacity-50"
              >
                {loadingSpecs ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                    Agregando...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-plus mr-2"></i>
                    Agregar Especificación
                  </>
                )}
              </button>
            </div>

            {/* Lista de especificaciones */}
            <div>
              <h4 className="font-medium text-main mb-4 flex items-center gap-2">
                <i className="fa-solid fa-list-check text-primary"></i>
                Especificaciones del Producto ({specifications.length})
              </h4>

              {specifications.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                  <i className="fa-solid fa-list text-4xl text-gray-300 mb-2"></i>
                  <p className="text-muted">No hay especificaciones aún</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-4 text-left text-sm font-medium text-main">Característica</th>
                        <th className="p-4 text-left text-sm font-medium text-main">Valor</th>
                        <th className="p-4 text-center text-sm font-medium text-main">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {specifications.map((spec, index) => (
                        <tr
                          key={spec.id}
                          className={`${index !== specifications.length - 1 ? "border-b border-gray-100" : ""} hover:bg-gray-50 transition`}
                        >
                          <td className="p-4">
                            <span className="font-semibold text-main">{spec.spec_key}</span>
                          </td>
                          <td className="p-4">
                            <input
                              type="text"
                              value={spec.spec_value}
                              onChange={(e) => handleUpdateSpecification(spec.id, e.target.value)}
                              onBlur={() => {}}
                              className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:border-primary focus:outline-none transition text-sm"
                            />
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => handleDeleteSpecification(spec.id)}
                              className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition"
                            >
                              <i className="fa-solid fa-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navegación de pasos */}
      <div className="flex justify-between items-center pt-8 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-main rounded-xl font-medium transition"
        >
          <i className="fa-solid fa-times mr-2"></i>
          Cancelar
        </button>

        <div className="flex gap-3">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep - 1)}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-main rounded-xl font-medium transition"
            >
              <i className="fa-solid fa-arrow-left mr-2"></i>
              Anterior
            </button>
          )}

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={() => {
                if (!productId) {
                  alert("Primero debes crear el producto en el Paso 1");
                  setCurrentStep(1);
                } else {
                  setCurrentStep(currentStep + 1);
                }
              }}
              className="px-6 py-3 bg-green-700 hover:bg-primary/90 text-white rounded-xl font-medium transition"
            >
              Siguiente
              <i className="fa-solid fa-arrow-right ml-2"></i>
            </button>
          ) : (
            <button
              type="button"
              onClick={onSuccess}
              className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium shadow-md transition"
            >
              <i className="fa-solid fa-check mr-2"></i>
              Finalizar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}