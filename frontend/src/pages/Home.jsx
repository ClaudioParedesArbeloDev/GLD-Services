import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import ProductList from "../components/ProductList";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para el producto destacado
  const [featuredProduct, setFeaturedProduct] = useState(null);
  const [featuredImages, setFeaturedImages] = useState([]);
  const [featuredVideos, setFeaturedVideos] = useState([]);
  const [featuredSpecs, setFeaturedSpecs] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [selectedMediaType, setSelectedMediaType] = useState("image");

  // Estados para filtros
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortOrder, setSortOrder] = useState("");

  // Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get("/products"),
          api.get("/categories"),
        ]);

        const prods = (prodRes.data.data || prodRes.data || []).map((p) => ({
          ...p,
          price: parseFloat(p.price) || 0,
          discount: parseFloat(p.discount) || 0,
          final_price: (parseFloat(p.price) || 0) * (1 - (parseFloat(p.discount) || 0) / 100),
        }));

        const cats = catRes.data.data || catRes.data || [];

        setProducts(prods);
        setFiltered(prods);
        setCategories(cats);

        // Establecer primer producto como destacado
        if (prods.length > 0) {
          loadFeaturedProduct(prods[0]);
        }
      } catch (err) {
        console.error("API Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Cargar detalles del producto destacado
  const loadFeaturedProduct = async (product) => {
    try {
      const [imgsRes, vidsRes] = await Promise.all([
        api.get(`/products/images/product/${product.id}`),
        api.get(`/product-videos/product/${product.id}`),
        
      ]);

      const images = imgsRes.data.data || imgsRes.data || [];
      const videos = vidsRes.data.data || vidsRes.data || [];
      

      setFeaturedProduct(product);
      setFeaturedImages(images);
      setFeaturedVideos(videos);
      

      // Establecer media inicial (prioridad: imagen principal > primera imagen > primer video)
      const mainImg = images.find((img) => img.is_main);
      if (mainImg) {
        setSelectedMedia(mainImg.url);
        setSelectedMediaType("image");
      } else if (images.length > 0) {
        setSelectedMedia(images[0].url);
        setSelectedMediaType("image");
      } else if (videos.length > 0) {
        setSelectedMedia(videos[0].url);
        setSelectedMediaType("video");
      }
    } catch (err) {
      console.error("Error cargando producto destacado:", err);
    }
  };

  // Rotar producto destacado cada 10 segundos
  useEffect(() => {
    if (products.length === 0) return;

    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * products.length);
      loadFeaturedProduct(products[randomIndex]);
    }, 10000);

    return () => clearInterval(interval);
  }, [products]);

  // Aplicar filtros
  useEffect(() => {
    let result = [...products];

    // Filtro de búsqueda
    if (searchQuery) {
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filtro de categoría
    if (selectedCategory) {
      result = result.filter((p) => p.category_id === Number(selectedCategory));
    }

    // Ordenamiento por precio
    if (sortOrder === "asc") {
      result.sort((a, b) => a.final_price - b.final_price);
    } else if (sortOrder === "desc") {
      result.sort((a, b) => b.final_price - a.final_price);
    }

    setFiltered(result);
  }, [searchQuery, selectedCategory, sortOrder, products]);

  // Función para obtener el ID de video de YouTube
  const getYoutubeId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/.*[?&]v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/);
    return match ? match[1] : null;
  };

  // Función para determinar si es video de YouTube
  const isYoutubeVideo = (url) => {
    return url && (url.includes("youtube.com") || url.includes("youtu.be"));
  };

  // Función para obtener thumbnail de YouTube
  const getYoutubeThumbnail = (url) => {
    const videoId = getYoutubeId(url);
    return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-gray-100">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-200 mx-auto"></div>
            <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-blue-600 absolute top-0 left-1/2 transform -translate-x-1/2"></div>
          </div>
          <p className="text-gray-700 font-semibold mt-6 text-lg">Cargando productos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-100">
      {/* SECCIÓN DE FILTROS - Diseño moderno con glassmorphism */}
      <section className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Buscador */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <i className="fa-solid fa-search text-blue-400 group-focus-within:text-blue-600 transition-colors"></i>
              </div>
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all duration-300 text-gray-700 placeholder-gray-400"
              />
            </div>

            {/* Filtro por Categoría */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <i className="fa-solid fa-tag text-blue-400 group-focus-within:text-blue-600 transition-colors"></i>
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-12 pr-10 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all duration-300 appearance-none cursor-pointer text-gray-700"
              >
                <option value="">Todas las categorías</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <i className="fa-solid fa-chevron-down text-gray-400"></i>
              </div>
            </div>

            {/* Ordenar por Precio */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <i className="fa-solid fa-arrow-down-wide-short text-blue-400 group-focus-within:text-blue-600 transition-colors"></i>
              </div>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full pl-12 pr-10 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all duration-300 appearance-none cursor-pointer text-gray-700"
              >
                <option value="">Ordenar por precio</option>
                <option value="asc">Menor a mayor</option>
                <option value="desc">Mayor a menor</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <i className="fa-solid fa-chevron-down text-gray-400"></i>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCTO DESTACADO - Versión más compacta */}
      {featuredProduct ? (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-blue-100/50">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              {/* COLUMNA IZQUIERDA: MULTIMEDIA */}
              <div className="bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-slate-50/40 p-4 md:p-6 space-y-3">
                {/* Título del producto (arriba en móvil) */}
                <div className="lg:hidden mb-3">
                  <h1 className="text-xl font-bold text-gray-800 mb-2">
                    {featuredProduct.title}
                  </h1>
                  {featuredProduct.discount > 0 && (
                    <span className="inline-flex items-center gap-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg">
                      <i className="fa-solid fa-fire"></i>
                      -{featuredProduct.discount}% OFF
                    </span>
                  )}
                </div>

                {/* Media principal (imagen o video) - más compacto */}
                <div className="bg-white rounded-xl overflow-hidden shadow-lg border-2 border-white">
                  <div className="aspect-square relative">
                    {selectedMediaType === "video" ? (
                      <div className="w-full h-full bg-black">
                        {isYoutubeVideo(selectedMedia) ? (
                          <iframe
                            src={`https://www.youtube.com/embed/${getYoutubeId(selectedMedia)}?autoplay=0&rel=0&modestbranding=1`}
                            className="w-full h-full"
                            allowFullScreen
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            title="Video del producto"
                          />
                        ) : (
                          <video
                            src={selectedMedia}
                            controls
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    ) : (
                      <img
                        src={selectedMedia || "/placeholder.jpg"}
                        alt={featuredProduct.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/600x600/E5E7EB/6B7280?text=Sin+Imagen";
                        }}
                      />
                    )}
                  </div>
                </div>

                {/* Thumbnails (miniaturas) */}
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-gray-200">
                  {/* Thumbnails de imágenes */}
                  {featuredImages.map((img) => (
                    <button
                      key={`img-${img.id}`}
                      onClick={() => {
                        setSelectedMedia(img.url);
                        setSelectedMediaType("image");
                      }}
                      className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-300 transform hover:scale-105 ${
                        selectedMedia === img.url && selectedMediaType === "image"
                          ? "border-blue-600 ring-2 ring-blue-200 shadow-md"
                          : "border-gray-300 hover:border-blue-400 shadow-sm"
                      }`}
                    >
                      <img
                        src={img.url}
                        alt="Thumbnail"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/96x96/E5E7EB/6B7280?text=Img";
                        }}
                      />
                      {img.is_main && (
                        <div className="absolute top-1 right-1 bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-md">
                          <i className="fa-solid fa-star"></i>
                        </div>
                      )}
                    </button>
                  ))}

                  {/* Thumbnails de videos */}
                  {featuredVideos.map((vid) => (
                    <button
                      key={`vid-${vid.id}`}
                      onClick={() => {
                        setSelectedMedia(vid.url);
                        setSelectedMediaType("video");
                      }}
                      className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-300 transform hover:scale-105 ${
                        selectedMedia === vid.url && selectedMediaType === "video"
                          ? "border-blue-600 ring-2 ring-blue-200 shadow-md"
                          : "border-gray-300 hover:border-blue-400 shadow-sm"
                      }`}
                    >
                      {isYoutubeVideo(vid.url) ? (
                        <div className="relative w-full h-full">
                          <img
                            src={getYoutubeThumbnail(vid.url)}
                            alt="Video thumbnail"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <div className="bg-red-600 rounded-full w-10 h-10 flex items-center justify-center shadow-lg">
                              <i className="fa-solid fa-play text-white text-sm ml-0.5"></i>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                          <div className="bg-blue-600 rounded-full w-10 h-10 flex items-center justify-center shadow-lg">
                            <i className="fa-solid fa-play text-white text-sm ml-0.5"></i>
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* COLUMNA DERECHA: INFORMACIÓN */}
              <div className="flex flex-col p-4 md:p-6">
                {/* Título (solo en desktop) */}
                <div className="hidden lg:block mb-4">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">
                    {featuredProduct.title}
                  </h1>
                  {featuredProduct.discount > 0 && (
                    <span className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-md">
                      <i className="fa-solid fa-fire"></i>
                      OFERTA: -{featuredProduct.discount}% OFF
                    </span>
                  )}
                </div>

                {/* Descripción */}
                <div className="mb-4">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Descripción</h3>
                  <p className="text-gray-700 leading-relaxed text-sm">
                    {featuredProduct.description || "Este producto no tiene descripción disponible."}
                  </p>
                </div>

                {/* Precio */}
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <div className="flex items-end gap-2">
                    <p className="text-3xl font-bold text-blue-600">
                      ${featuredProduct.final_price.toFixed(2)}
                    </p>
                    {featuredProduct.discount > 0 && (
                      <p className="text-lg text-gray-400 line-through pb-1">
                        ${featuredProduct.price.toFixed(2)}
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-1.5 flex items-center gap-1.5">
                    <i className="fa-solid fa-box text-blue-500"></i>
                    Stock disponible: <span className="font-bold text-gray-800">{featuredProduct.stock}</span> unidades
                  </p>
                </div>

                {/* Botón */}
                <Link
                  to={`/product/${featuredProduct.id}`}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-xl font-bold text-base text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2 mb-4"
                >
                  <span>Ver Producto Completo</span>
                  <i className="fa-solid fa-arrow-right"></i>
                </Link>

                {/* Especificaciones */}
                {featuredSpecs.length > 0 && (
                  <div className="flex-1">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <i className="fa-solid fa-list-check text-blue-600"></i>
                      Especificaciones Técnicas
                    </h3>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-gray-200">
                      {featuredSpecs.map((spec) => (
                        <div
                          key={spec.id}
                          className="flex justify-between items-center py-2 px-3 bg-gradient-to-r from-blue-50/40 via-indigo-50/30 to-slate-50/30 rounded-lg hover:from-blue-50 hover:to-indigo-50/50 transition-all duration-200 border border-blue-100/50"
                        >
                          <span className="text-gray-600 font-semibold text-xs">{spec.spec_key}</span>
                          <span className="text-gray-900 font-bold text-xs">{spec.spec_value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-16 border border-gray-200/50">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full mb-6">
              <i className="fa-solid fa-box-open text-5xl text-blue-600"></i>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              No hay productos disponibles
            </h2>
            <p className="text-gray-600 mb-8 text-lg">
              Agrega productos desde el panel de administración para comenzar
            </p>
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-bold shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <i className="fa-solid fa-crown"></i>
              Ir al Panel Admin
            </Link>
          </div>
        </section>
      )}

      {/* LISTA DE TODOS LOS PRODUCTOS - Con fondo gris más fuerte */}
      <section className="bg-gradient-to-br from-gray-100 via-slate-200 to-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-b from-gray-600 to-gray-800 rounded-full"></div>
              Todos los Productos
            </h2>
            <span className="text-gray-700 font-semibold bg-white/90 px-4 py-2 rounded-full shadow-md border border-gray-300">
              {filtered.length} {filtered.length === 1 ? "producto" : "productos"}
            </span>
          </div>

        {filtered.length > 0 ? (
          <ProductList products={filtered} />
        ) : (
          <div className="text-center py-20 bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-6">
              <i className="fa-solid fa-search text-4xl text-gray-400"></i>
            </div>
            <p className="text-xl text-gray-700 font-semibold mb-2">
              No se encontraron productos
            </p>
            <p className="text-gray-500 mb-6">
              Intenta con otros filtros o términos de búsqueda
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("");
                setSortOrder("");
              }}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              <i className="fa-solid fa-rotate-right mr-2"></i>
              Limpiar filtros
            </button>
          </div>
        )}
        </div>
      </section>
    </div>
  );
}