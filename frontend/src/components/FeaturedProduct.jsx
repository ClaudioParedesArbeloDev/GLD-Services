export default function FeaturedProduct({ product }) {
  const primaryImg = product.images?.find(i => i.is_primary === 1)?.image_url || product.images?.[0]?.image_url || "/placeholder.jpg";
  const hasVideo = product.videos && product.videos.length > 0;
  const mainVideo = hasVideo ? product.videos[0].video_url : null;

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-8 flex flex-col md:flex-row gap-10">
      
      
      <div className="w-full md:w-1/2 space-y-6">
        
        
        {hasVideo && (
          <div className="relative pb-[56.25%] bg-black rounded-2xl overflow-hidden shadow-xl">
            <iframe
              src={mainVideo}
              className="absolute inset-0 w-full h-full"
              allowFullScreen
              title="Video del producto"
            ></iframe>
          </div>
        )}

        
        {!hasVideo && (
          <img 
            src={primaryImg} 
            alt={product.title} 
            className="w-full rounded-2xl object-cover shadow-xl"
            style={{ maxHeight: "500px" }}
          />
        )}

        
        {product.images && product.images.length > 1 && (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {product.images.map((img, i) => (
              <img
                key={i}
                src={img.image_url}
                alt={`${product.title} - ${i + 1}`}
                className={`w-32 h-32 object-cover rounded-xl border-4 flex-shrink-0 ${
                  img.is_primary === 1 ? "border-cyan-500" : "border-gray-300"
                }`}
              />
            ))}
          </div>
        )}

      </div>

      
      <div className="flex-1 flex flex-col justify-center">
        <h2 className="text-4xl font-bold text-gray-800">{product.title}</h2>
        
        <p className="text-gray-600 mt-4 text-lg">
          {product.description || "Producto importado de alta calidad con envío rápido."}
        </p>

        {/* PRECIOS */}
        <div className="mt-6">
          <p className="text-5xl font-bold text-green-600">
            ${parseFloat(product.final_price || product.base_price).toFixed(2)}
          </p>
          
          {product.discount_percent > 0 && (
            <p className="text-2xl text-gray-500 line-through">
              ${parseFloat(product.base_price).toFixed(2)}
            </p>
          )}
          
          {product.discount_percent > 0 && (
            <span className="inline-block mt-2 bg-red-600 text-white px-6 py-2 rounded-full text-xl font-bold">
              -{product.discount_percent}% OFF
            </span>
          )}
        </div>

        
        <div className="mt-6 flex items-center gap-6">
          <p className="text-xl font-semibold">
            Stock: <span className="text-emerald-600 font-bold">{product.stock || 0}</span>
          </p>
          
          <span className={`px-6 py-3 rounded-full text-white font-bold text-lg ${
            product.status === "disponible" ? "bg-green-600" :
            product.status === "en_espera" ? "bg-yellow-600" :
            "bg-red-600"
          }`}>
            {product.status?.replace("_", " ").toUpperCase() || "EN ESPERA"}
          </span>
        </div>

        {/* BOTÓN (opcional pero pro) */}
        <button className="mt-8 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-12 py-5 rounded-full font-bold text-2xl shadow-xl hover:shadow-2xl transition">
          ¡COMPRAR AHORA! 🚀
        </button>
      </div>
    </div>
  );
}