import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/CartContext";

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart, openCart } = useCart(); // ✅ Hook del carrito
  const [product, setProduct] = useState(null);
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [specifications, setSpecifications] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState("");
  const [selectedMediaType, setSelectedMediaType] = useState("image");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addedToCart, setAddedToCart] = useState(false); // ✅ Estado para feedback visual

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const [prodRes, imgsRes, vidsRes, specsRes] = await Promise.all([
          api.get(`/products/${id}`),
          api.get(`/products/images/product/${id}`),
          api.get(`/product-videos/product/${id}`),
          api.get(`/product-specifications/product/${id}`),
        ]);

        const productData = prodRes.data.data || prodRes.data;
        const imagesData = imgsRes.data.data || imgsRes.data || [];
        const videosData = vidsRes.data.data || vidsRes.data || [];
        const specsData = specsRes.data.data || specsRes.data || [];

        console.log("Product:", productData);
        console.log("Images:", imagesData);
        console.log("Videos:", videosData);
        console.log("Specifications:", specsData);

        // Convertir precios a números
        productData.price = parseFloat(productData.price) || 0;
        productData.discount = parseFloat(productData.discount) || 0;
        productData.final_price = productData.price * (1 - productData.discount / 100);

        setProduct(productData);
        setImages(imagesData);
        setVideos(videosData);
        setSpecifications(specsData);

        // Establecer media inicial - priorizar videos si existen
        if (videosData.length > 0) {
          setSelectedMedia(videosData[0].url);
          setSelectedMediaType("video");
        } else {
          const mainImg = imagesData.find((img) => img.is_main);
          if (mainImg) {
            setSelectedMedia(mainImg.url);
            setSelectedMediaType("image");
          } else if (imagesData.length > 0) {
            setSelectedMedia(imagesData[0].url);
            setSelectedMediaType("image");
          }
        }
      } catch (err) {
        console.error("Error al cargar el producto:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const getYoutubeId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/.*[?&]v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/);
    return match ? match[1] : null;
  };

  const isYoutubeVideo = (url) => {
    return url && (url.includes("youtube.com") || url.includes("youtu.be"));
  };

  const getYoutubeThumbnail = (url) => {
    const videoId = getYoutubeId(url);
    return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null;
  };

  const handleQuantityChange = (delta) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  // ✅ Función para agregar al carrito
  const handleAddToCart = () => {
    if (product.stock === 0) {
      alert("Producto sin stock");
      return;
    }

    if (quantity > product.stock) {
      alert("No hay suficiente stock disponible");
      return;
    }

    // Crear objeto completo del producto con imágenes incluidas
    const productWithImages = {
      ...product,
      images: images, // Incluir las imágenes
      videos: videos, // Incluir los videos
      specifications: specifications // Incluir las especificaciones
    };

    // Agregar al carrito
    addToCart(productWithImages, quantity);
    
    // Feedback visual
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
    
    // Abrir el carrito después de medio segundo
    setTimeout(() => openCart(), 300);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-gray-100">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-200 mx-auto"></div>
            <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-blue-600 absolute top-0 left-1/2 transform -translate-x-1/2"></div>
          </div>
          <p className="text-gray-700 font-semibold mt-6 text-lg">Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-gray-100">
        <div className="text-center bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-12 border border-gray-200/50">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-6">
            <i className="fa-solid fa-box-open text-6xl text-gray-400"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Producto no encontrado</h2>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-bold transition-all duration-300 transform hover:-translate-y-1 shadow-lg"
          >
            <i className="fa-solid fa-arrow-left"></i>
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-gray-100 py-8">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="flex items-center gap-2 text-sm">
          <Link to="/" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
            Inicio
          </Link>
          <i className="fa-solid fa-chevron-right text-xs text-gray-400"></i>
          <span className="text-gray-800 font-bold">{product.title}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-gray-200/50">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* COLUMNA IZQUIERDA: MULTIMEDIA */}
            <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 p-6 md:p-8 space-y-4">
              {/* Media principal */}
              <div className="bg-white rounded-2xl overflow-hidden shadow-xl border-4 border-white">
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
                        <video src={selectedMedia} controls className="w-full h-full object-cover" />
                      )}
                    </div>
                  ) : (
                    <img
                      src={selectedMedia || "/placeholder.jpg"}
                      alt={product.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/600x600/E5E7EB/6B7280?text=Sin+Imagen";
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Thumbnails */}
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-gray-200">
                {/* Thumbnails de imágenes */}
                {images.length > 0 && images.map((img) => (
                  <button
                    key={`img-${img.id}`}
                    onClick={() => {
                      setSelectedMedia(img.url);
                      setSelectedMediaType("image");
                    }}
                    className={`relative flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border-3 transition-all duration-300 transform hover:scale-105 ${
                      selectedMedia === img.url && selectedMediaType === "image"
                        ? "border-blue-600 ring-4 ring-blue-200 shadow-lg"
                        : "border-gray-300 hover:border-blue-400 shadow-md"
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
                {videos.length > 0 && videos.map((vid) => (
                  <button
                    key={`vid-${vid.id}`}
                    onClick={() => {
                      setSelectedMedia(vid.url);
                      setSelectedMediaType("video");
                    }}
                    className={`relative flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border-3 transition-all duration-300 transform hover:scale-105 ${
                      selectedMedia === vid.url && selectedMediaType === "video"
                        ? "border-blue-600 ring-4 ring-blue-200 shadow-lg"
                        : "border-gray-300 hover:border-blue-400 shadow-md"
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

              {/* Indicadores de contenido multimedia */}
              <div className="flex items-center gap-4 text-sm text-gray-600 pt-2">
                {images.length > 0 && (
                  <div className="flex items-center gap-2">
                    <i className="fa-solid fa-image text-blue-500"></i>
                    <span>{images.length} {images.length === 1 ? 'imagen' : 'imágenes'}</span>
                  </div>
                )}
                {videos.length > 0 && (
                  <div className="flex items-center gap-2">
                    <i className="fa-solid fa-video text-red-500"></i>
                    <span>{videos.length} {videos.length === 1 ? 'video' : 'videos'}</span>
                  </div>
                )}
              </div>
            </div>

            {/* COLUMNA DERECHA: INFORMACIÓN */}
            <div className="flex flex-col p-6 md:p-8">
              {/* Título */}
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-3 leading-tight">{product.title}</h1>
                {product.discount > 0 && (
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-5 py-2.5 rounded-full text-base font-bold shadow-xl animate-pulse">
                    <i className="fa-solid fa-fire-flame-curved"></i>
                    <span>¡DESCUENTO DEL {product.discount}%!</span>
                  </div>
                )}
              </div>

              {/* Descripción */}
              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <i className="fa-solid fa-align-left text-blue-600"></i>
                  Descripción
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {product.description || "Este producto no tiene descripción disponible."}
                </p>
              </div>

              {/* Precio - MEJORADO */}
              <div className="mb-6 pb-6 border-b-2 border-gray-200">
                {product.discount > 0 ? (
                  <div>
                    {/* Precio anterior tachado */}
                    <div className="mb-2">
                      <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Precio anterior:</span>
                      <p className="text-3xl font-bold text-gray-400 line-through">
                        ${product.price.toFixed(2)}
                      </p>
                    </div>
                    
                    {/* Precio con descuento */}
                    <div className="mb-3">
                      <span className="text-sm font-semibold text-green-600 uppercase tracking-wide">¡Ahorrás ${(product.price - product.final_price).toFixed(2)}!</span>
                      <div className="flex items-end gap-3">
                        <p className="text-6xl font-bold text-blue-600">
                          ${product.final_price.toFixed(2)}
                        </p>
                        <div className="pb-2 bg-red-500 text-white px-3 py-1 rounded-lg text-sm font-bold">
                          -{product.discount}% OFF
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide block mb-2">Precio:</span>
                    <p className="text-6xl font-bold text-blue-600">
                      ${product.price.toFixed(2)}
                    </p>
                  </div>
                )}
                
                {/* Stock */}
                <div className="flex items-center gap-4 mt-4">
                  <span className="text-gray-600 flex items-center gap-2">
                    <i className="fa-solid fa-box text-blue-500"></i>
                    <span className="font-bold text-gray-800">{product.stock}</span> unidades disponibles
                  </span>
                  <span
                    className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                      product.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {product.status === "active" ? "✓ Disponible" : "No disponible"}
                  </span>
                </div>
              </div>

              {/* Selector de cantidad */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <i className="fa-solid fa-calculator text-blue-600"></i>
                  Cantidad
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-2xl font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    readOnly
                    className="w-28 text-center text-3xl font-bold border-2 border-blue-300 rounded-xl py-3 focus:outline-none bg-blue-50"
                  />
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.stock}
                    className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-2xl font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Total: <span className="font-bold text-blue-600 text-lg">${(product.final_price * quantity).toFixed(2)}</span>
                </p>
              </div>

              {/* Botones de acción */}
              <div className="space-y-3 mb-6">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || addedToCart}
                  className={`w-full py-5 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 disabled:cursor-not-allowed ${
                    addedToCart
                      ? "bg-gradient-to-r from-green-600 to-green-700"
                      : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                  } ${product.stock === 0 ? "bg-gradient-to-r from-gray-400 to-gray-500" : ""} text-white`}
                >
                  {product.stock === 0 ? (
                    <>
                      <i className="fa-solid fa-times mr-2"></i>
                      Sin Stock
                    </>
                  ) : addedToCart ? (
                    <>
                      <i className="fa-solid fa-check mr-2"></i>
                      ¡Agregado al Carrito!
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-cart-shopping mr-2"></i>
                      Agregar al Carrito
                    </>
                  )}
                </button>
                <button className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-5 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                  <i className="fa-brands fa-whatsapp mr-2 text-xl"></i>
                  Consultar por WhatsApp
                </button>
              </div>

              {/* Especificaciones */}
              {specifications.length > 0 ? (
                <div className="flex-1 border-t-2 pt-6">
                  <h3 className="text-base font-bold text-gray-700 mb-4 flex items-center gap-2">
                    <i className="fa-solid fa-list-check text-blue-600 text-xl"></i>
                    Especificaciones Técnicas
                    <span className="ml-auto text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                      {specifications.length}
                    </span>
                  </h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-gray-200">
                    {specifications.map((spec, index) => (
                      <div
                        key={spec.id}
                        className={`flex justify-between items-center py-3 px-4 rounded-xl transition-all duration-200 border ${
                          index % 2 === 0
                            ? 'bg-gradient-to-r from-gray-50 to-blue-50/30 hover:from-blue-50 hover:to-blue-100/50 border-gray-200/50'
                            : 'bg-white hover:bg-blue-50/50 border-gray-200'
                        }`}
                      >
                        <span className="text-gray-600 font-semibold text-sm flex items-center gap-2">
                          <i className="fa-solid fa-chevron-right text-blue-500 text-xs"></i>
                          {spec.spec_key}
                        </span>
                        <span className="text-gray-900 font-bold text-sm text-right ml-4">
                          {spec.spec_value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex-1 border-t-2 pt-6">
                  <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                    <i className="fa-solid fa-list-ul text-4xl text-gray-300 mb-3"></i>
                    <p className="text-gray-500 font-medium">No hay especificaciones técnicas disponibles</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Botón volver */}
        <div className="mt-8 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-gray-50 text-gray-700 rounded-xl font-bold border-2 border-gray-300 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            <i className="fa-solid fa-arrow-left"></i>
            Volver a productos
          </Link>
          
          {product.discount > 0 && (
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-xl shadow-lg">
              <p className="text-sm font-semibold">💰 Estás ahorrando</p>
              <p className="text-2xl font-bold">${(product.price - product.final_price).toFixed(2)}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}