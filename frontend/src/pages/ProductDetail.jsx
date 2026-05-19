import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/CartContext";

const IMG_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='600'%3E%3Crect width='100%25' height='100%25' fill='%23E5E7EB'/%3E%3Ctext x='50%25' y='50%25' fill='%236B7280' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='28'%3ESin Imagen%3C/text%3E%3C/svg%3E";

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart, openCart } = useCart();

  const [product, setProduct] = useState(null);
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [specifications, setSpecifications] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState("");
  const [selectedMediaType, setSelectedMediaType] = useState("image");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addedToCart, setAddedToCart] = useState(false);

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

        productData.price = parseFloat(productData.price) || 0;
        productData.discount = parseFloat(productData.discount) || 0;
        productData.final_price = productData.price * (1 - productData.discount / 100);

        setProduct(productData);
        setImages(imagesData);
        setVideos(videosData);
        setSpecifications(specsData);


        if (videosData.length > 0) {
          setSelectedMedia(videosData[0].url);
          setSelectedMediaType("video");
        } else {
          const mainImg = imagesData.find((img) => img.is_main);
          setSelectedMedia(mainImg ? mainImg.url : imagesData[0]?.url || "");
          setSelectedMediaType("image");
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

  const isYoutubeVideo = (url) => url && (url.includes("youtube.com") || url.includes("youtu.be"));
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

  const handleAddToCart = () => {
    if (product.stock === 0) {
      alert("Producto sin stock");
      return;
    }
    if (quantity > product.stock) {
      alert("No hay suficiente stock disponible");
      return;
    }

    const productWithImages = { ...product, images, videos, specifications };
    addToCart(productWithImages, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
    setTimeout(() => openCart(), 300);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-r from-slate-50 via-blue-50 to-gray-100">
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
      <div className="min-h-screen flex items-center justify-center bg-linear-to-r from-slate-50 via-blue-50 to-gray-100">
        <div className="text-center bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-12 border border-gray-200/50">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-linear-to-r from-gray-100 to-gray-200 rounded-full mb-6">
            <i className="fa-solid fa-box-open text-6xl text-gray-400"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Producto no encontrado</h2>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-bold transition-all duration-300 transform hover:-translate-y-1 shadow-lg"
          >
            <i className="fa-solid fa-arrow-left"></i> Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-r from-slate-50 via-blue-50 to-gray-100 py-8">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="flex items-center gap-2 text-sm">
          <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium">Inicio</Link>
          <i className="fa-solid fa-chevron-right text-xs text-gray-400"></i>
          <span className="text-gray-800 font-bold">{product.title}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-gray-200/50">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-0">

          
            <div className="order-1 space-y-8">

          
              <div className="bg-linear-to-r from-gray-50 to-blue-50/30 p-6 md:p-8 rounded-3xl lg:rounded-r-none lg:rounded-l-3xl">
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
                        src={selectedMedia || IMG_PLACEHOLDER}
                        alt={product.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = IMG_PLACEHOLDER;
                        }}
                      />
                    )}
                  </div>
                </div>

                
                <div className="flex gap-3 overflow-x-auto py-4 scrollbar-thin scrollbar-thumb-blue-400">
                  {images.map((img) => (
                    <button
                      key={`img-${img.id}`}
                      onClick={() => {
                        setSelectedMedia(img.url);
                        setSelectedMediaType("image");
                      }}
                      className={`relative shrink-0 w-24 h-24 rounded-xl overflow-hidden border-3 transition-all ${
                        selectedMedia === img.url && selectedMediaType === "image"
                          ? "border-blue-600 ring-4 ring-blue-200"
                          : "border-gray-300 hover:border-blue-400"
                      }`}
                    >
                      <img src={img.url} alt="thumb" className="w-full h-full object-cover" />
                      {img.is_main && (
                        <div className="absolute top-1 right-1 bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                          ★
                        </div>
                      )}
                    </button>
                  ))}
                  {videos.map((vid) => (
                    <button
                      key={`vid-${vid.id}`}
                      onClick={() => {
                        setSelectedMedia(vid.url);
                        setSelectedMediaType("video");
                      }}
                      className={`relative shrink-0 w-24 h-24 rounded-xl overflow-hidden border-3 transition-all ${
                        selectedMedia === vid.url && selectedMediaType === "video"
                          ? "border-blue-600 ring-4 ring-blue-200"
                          : "border-gray-300 hover:border-blue-400"
                      }`}
                    >
                      {isYoutubeVideo(vid.url) ? (
                        <>
                          <img src={getYoutubeThumbnail(vid.url)} alt="yt" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <div className="bg-red-600 rounded-full w-10 h-10 flex items-center justify-center">
                              ▶
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full bg-linear-to-r from-gray-800 to-gray-900 flex items-center justify-center">
                          <div className="bg-blue-600 rounded-full w-10 h-10 flex items-center justify-center">
                            ▶
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                <div className="flex gap-4 text-sm text-gray-600">
                  {images.length > 0 && (
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-image text-blue-500"></i>
                      <span>{images.length} imágenes</span>
                    </div>
                  )}
                  {videos.length > 0 && (
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-video text-red-500"></i>
                      <span>{videos.length} videos</span>
                    </div>
                  )}
                </div>
              </div>

              
              {specifications.length > 0 && (
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-gray-200/50">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center justify-between">
                    <span className="flex items-center gap-3">
                      <i className="fa-solid fa-list-check text-blue-600 text-xl"></i>
                      Especificaciones Técnicas
                    </span>
                    <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                      {specifications.length}
                    </span>
                  </h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-blue-400">
                    {specifications.map((spec, i) => (
                      <div
                        key={spec.id}
                        className={`flex justify-between items-center py-3 px-4 rounded-xl border ${
                          i % 2 === 0 ? "bg-gray-50 border-gray-200" : "bg-white border-gray-100"
                        } hover:bg-blue-50/50 transition-all`}
                      >
                        <span className="text-gray-600 font-medium flex items-center gap-2">
                          <i className="fa-solid fa-chevron-right text-blue-500 text-xs"></i>
                          {spec.spec_key}
                        </span>
                        <span className="text-gray-900 font-bold text-right">{spec.spec_value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            
            <div className="order-2 flex flex-col p-6 md:p-8 bg-white/90 backdrop-blur-sm rounded-3xl lg:rounded-l-none lg:rounded-r-3xl">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-3 leading-tight">{product.title}</h1>
                {product.discount > 0 && (
                  <div className="inline-flex items-center gap-2 bg-linear-to-r from-red-500 to-red-600 text-white px-5 py-2.5 rounded-full text-base font-bold shadow-xl animate-pulse">
                    <i className="fa-solid fa-fire-flame-curved"></i>
                    ¡DESCUENTO DEL {product.discount}%!
                  </div>
                )}
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Descripción
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {product.description || "Este producto no tiene descripción disponible."}
                </p>
              </div>

              {/* Precio */}
              <div className="mb-6 pb-6 border-b-2 border-gray-200">
                {product.discount > 0 ? (
                  <>
                    <p className="text-3xl font-bold text-gray-400 line-through">${product.price.toFixed(2)}</p>
                    <div className="flex items-end gap-3 mt-2">
                      <p className="text-6xl font-bold text-blue-600">${product.final_price.toFixed(2)}</p>
                      <div className="pb-2 bg-red-500 text-white px-3 py-1 rounded-lg text-sm font-bold">
                        -{product.discount}% OFF
                      </div>
                    </div>
                    <p className="text-green-600 font-bold mt-2">
                      ¡Ahorrás ${(product.price - product.final_price).toFixed(2)}!
                    </p>
                  </>
                ) : (
                  <p className="text-4xl font-bold text-blue-600">${product.price.toFixed(2)}</p>
                )}
                <div className="flex items-center gap-4 mt-4">
                  <span className="text-gray-600 flex items-center gap-2">
                    <i className="fa-solid fa-box text-blue-500"></i>
                    <span className="font-bold text-gray-800">{product.stock}</span> unidades disponibles
                  </span>
                </div>
              </div>

              
              <div className="mb-8">
                <label className="text-sm font-bold text-gray-700 mb-3 block">Cantidad</label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="w-14 h-14 rounded-xl bg-linear-to-r from-gray-100 to-gray-200 disabled:opacity-50 text-2xl font-bold hover:shadow-lg transition-all flex items-center justify-center"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    readOnly
                    className="w-28 text-center text-3xl font-bold border-2 border-blue-300 rounded-xl py-3 bg-blue-50"
                  />
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.stock}
                    className="w-14 h-14 rounded-xl bg-linear-to-r from-gray-100 to-gray-200 disabled:opacity-50 text-2xl font-bold hover:shadow-lg transition-all flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Total: <span className="font-bold text-blue-600 text-lg">${(product.final_price * quantity).toFixed(2)}</span>
                </p>
              </div>

              
              <div className="space-y-4">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || addedToCart}
                  className={`w-full py-5 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 disabled:cursor-not-allowed text-white ${
                    addedToCart
                      ? "bg-linear-to-r from-green-600 to-green-700"
                      : product.stock === 0
                      ? "bg-linear-to-r from-gray-400 to-gray-500"
                      : "bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                  }`}
                >
                  {product.stock === 0 ? "Próximamente" : addedToCart ? "¡Agregado al carrito!" : "Agregar al Carrito"}
                </button>

                <a
                  href={`https://wa.me/543412665209?text=${encodeURIComponent(
                    `¡Hola! 👋\n\nEstoy interesado/a en:\n\n*${product.title}*` +
                      `${product.discount > 0 ? `\n\nPrecio final: $${product.final_price.toFixed(2)} (${product.discount}% OFF)` : `\n\nPrecio: $${product.price.toFixed(2)}`}\n\n${window.location.href}\n\n¿Lo tenés en stock? ¿Hacés envíos a todo el país? ¡Gracias!`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-full bg-linear-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-5 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1"
                >
                  <i className="fa-brands fa-whatsapp mr-2 text-xl"></i>
                  Consultar por WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>

        
        <div className="mt-8 flex justify-between items-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-gray-50 text-gray-700 rounded-xl font-bold border-2 border-gray-300 transition-all shadow-md hover:shadow-lg"
          >
            <i className="fa-solid fa-arrow-left"></i> Volver a productos
          </Link>
          {product.discount > 0 && (
            <div className="bg-linear-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-xl shadow-lg text-right">
              <p className="text-sm font-semibold">Ahorrás</p>
              <p className="text-2xl font-bold">${(product.price - product.final_price).toFixed(2)}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}