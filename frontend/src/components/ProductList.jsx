import { Link } from "react-router-dom";

export default function ProductList({ products }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => {
        // Convertir a números para evitar errores
        const price = parseFloat(product.price) || 0;
        const discount = parseFloat(product.discount) || 0;
        const finalPrice = product.final_price || price * (1 - discount / 100);
        
        return (
          <Link
            to={`/product/${product.id}`}
            key={product.id}
            className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-gray-100 hover:border-blue-300 transform hover:-translate-y-2"
          >
            {/* Imagen del producto */}
            <div className="relative bg-gradient-to-br from-gray-100 to-blue-50/30 aspect-square overflow-hidden">
              <img
                src={product.image_url || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect width='400' height='400' fill='%23E5E7EB'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-size='20' fill='%236B7280'%3ESin Imagen%3C/text%3E%3C/svg%3E"}
                alt={product.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                onError={(e) => {
                  e.target.onerror = null; // Prevenir loop infinito
                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect width='400' height='400' fill='%23E5E7EB'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-size='20' fill='%236B7280'%3ESin Imagen%3C/svg%3E";
                }}
              />
              
              {/* Badge de descuento */}
              {discount > 0 && (
                <div className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-xl flex items-center gap-1">
                  <i className="fa-solid fa-fire"></i>
                  -{discount}%
                </div>
              )}
              
              {/* Badge de stock bajo */}
              {product.stock < 5 && product.stock > 0 && (
                <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-xl">
                  ¡Últimas unidades!
                </div>
              )}
              
              {/* Badge sin stock */}
              {product.stock === 0 && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm">
                  <span className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-xl">
                    <i className="fa-solid fa-xmark mr-2"></i>
                    Sin Stock
                  </span>
                </div>
              )}
              
              {/* Overlay de hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            {/* Información del producto */}
            <div className="p-5">
              {/* Título */}
              <h3 className="text-lg font-bold text-gray-800 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors min-h-[3.5rem]">
                {product.title}
              </h3>

              {/* Precio */}
              <div className="flex items-end gap-2 mb-4">
                <p className="text-3xl font-bold text-blue-600">
                  ${finalPrice.toFixed(2)}
                </p>
                {discount > 0 && (
                  <p className="text-base text-gray-400 line-through pb-1">
                    ${price.toFixed(2)}
                  </p>
                )}
              </div>

              {/* Stock y estado */}
              <div className="flex items-center justify-between text-sm mb-4 pb-4 border-b border-gray-200">
                <span className="text-gray-600 flex items-center gap-1">
                  <i className="fa-solid fa-box text-blue-500"></i>
                  <span className="font-bold text-gray-800">{product.stock}</span> disponibles
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    product.status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {product.status === "active" ? "Disponible" : "No disponible"}
                </span>
              </div>

              {/* Botón */}
              <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-xl font-bold transition-all duration-300 transform group-hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
                <span>Ver Detalles</span>
                <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
              </button>
            </div>
          </Link>
        );
      })}
    </div>
  );
}